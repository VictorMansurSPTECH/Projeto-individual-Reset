var database = require("../database/config");

// Cria um erro com código HTTP (400 ou 401) para o controller responder ao navegador
function criarErro(mensagem, statusCode) {
    var erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

function inserirAvaliacao(dados) {
    var idFase;
    var idsTitans;
    var idAvaliacao;

    // Passo 1: confere se o usuário existe
    return database.executar(
        "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
        [dados.idUsuario]
    )
    .then(function (usuarios) {
        if (usuarios.length === 0) {
            return Promise.reject(criarErro("Sua sessão expirou. Faça login novamente.", 401));
        }

        // Passo 2: busca o id da fase escolhida
        return database.executar(
            "SELECT id_fase FROM fase WHERE nome = ?",
            [dados.faseFavorita]
        );
    })
    .then(function (fases) {
        if (fases.length === 0) {
            return Promise.reject(criarErro("A fase selecionada não foi encontrada.", 400));
        }
        idFase = fases[0].id_fase;

        // Passo 3: busca o id de cada titã escolhido
        // Monta "?, ?, ?" conforme a quantidade de titãs
        var interrogacoes = dados.titans.map(function () { return "?"; }).join(", ");

        return database.executar(
            "SELECT id_titan, nome FROM titan WHERE nome IN (" + interrogacoes + ")",
            dados.titans
        );
    })
    .then(function (titans) {
        if (titans.length !== dados.titans.length) {
            return Promise.reject(criarErro("Um ou mais titãs selecionados não foram encontrados.", 400));
        }

        // Guarda só os ids dos titãs
        idsTitans = titans.map(function (t) { return t.id_titan; });

        // Passo 4: insere a avaliação principal
        return database.executar(
            "INSERT INTO avaliacao (experiencia, por_que_fase, comentario, fk_usuario, fk_fase) VALUES (?, ?, ?, ?, ?)",
            [
                dados.experiencia,
                dados.porQueFase,
                dados.comentario,
                dados.idUsuario,
                idFase
            ]
        );
    })
    .then(function (resultado) {
        // O banco devolve o id da avaliação que acabou de ser criada
        idAvaliacao = resultado.insertId;

        // Passo 5: liga a avaliação a cada titã escolhido
        var partes = [];
        var valores = [];
        for (var i = 0; i < idsTitans.length; i++) {
            partes.push("(?, ?)");
            valores.push(idAvaliacao, idsTitans[i]);
        }

        return database.executar(
            "INSERT INTO avaliacao_titan (fk_avaliacao, fk_titan) VALUES " + partes.join(", "),
            valores
        );
    })
    .then(function () {
        // Tudo certo: devolve o id da avaliação
        return idAvaliacao;
    });
}

module.exports = {
    inserirAvaliacao: inserirAvaliacao
};