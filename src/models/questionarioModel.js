var database = require("../database/config");

// Cria um erro com código HTTP (400 ou 401) para o controller responder ao navegador
function criarErro(mensagem, statusCode) {
    var erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

function inserirAvaliacao(dados) {
    var idFase;
    var idsPersonagens;
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

        // Passo 3: busca o id de cada personagem escolhido
        // Monta "?, ?, ?" conforme a quantidade de personagens
        var interrogacoes = dados.personagens.map(function () { return "?"; }).join(", ");

        return database.executar(
            "SELECT id_personagem, nome FROM personagem WHERE nome IN (" + interrogacoes + ")",
            dados.personagens
        );
    })
    .then(function (personagens) {
        if (personagens.length !== dados.personagens.length) {
            return Promise.reject(criarErro("Um ou mais personagens selecionados não foram encontrados.", 400));
        }

        // Guarda só os ids dos personagens
        idsPersonagens = personagens.map(function (p) { return p.id_personagem; });

        // Passo 4: insere a avaliação principal
        return database.executar(
            "INSERT INTO avaliacao (experiencia, por_que_fase, titas_favoritos, comentario, fk_usuario, fk_fase) VALUES (?, ?, ?, ?, ?, ?)",
            [
                dados.experiencia,
                dados.porQueFase,
                dados.titasFavoritos,
                dados.comentario,
                dados.idUsuario,
                idFase
            ]
        );
    })
    .then(function (resultado) {
        // O banco devolve o id da avaliação que acabou de ser criada
        idAvaliacao = resultado.insertId;

        // Passo 5: liga a avaliação a cada personagem escolhido
        var partes = [];
        var valores = [];
        for (var i = 0; i < idsPersonagens.length; i++) {
            partes.push("(?, ?)");
            valores.push(idAvaliacao, idsPersonagens[i]);
        }

        return database.executar(
            "INSERT INTO avaliacao_personagem (fk_avaliacao, fk_personagem) VALUES " + partes.join(", "),
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