var database = require("../database/config");

function criarErroValidacao(mensagem, statusCode) {
    var erro = new Error(mensagem);
    erro.statusCode = statusCode;
    return erro;
}

async function inserirAvaliacao(dados) {
    var conexao = database.criarConexao().promise();
    var transacaoIniciada = false;

    try {
        await conexao.beginTransaction();
        transacaoIniciada = true;

        var [usuarios] = await conexao.execute(
            "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
            [dados.idUsuario]
        );
        if (usuarios.length === 0) {
            throw criarErroValidacao("Sua sessão expirou. Faça login novamente.", 401);
        }

        var [fases] = await conexao.execute(
            "SELECT id_fase FROM fase WHERE nome = ?",
            [dados.faseFavorita]
        );
        if (fases.length === 0) {
            throw criarErroValidacao("A fase selecionada não foi encontrada.", 400);
        }

        var placeholdersPersonagens = dados.personagens.map(function () {
            return "?";
        }).join(", ");
        var [personagens] = await conexao.execute(
            "SELECT id_personagem, nome FROM personagem WHERE nome IN (" + placeholdersPersonagens + ")",
            dados.personagens
        );
        if (personagens.length !== dados.personagens.length) {
            throw criarErroValidacao("Um ou mais personagens selecionados não foram encontrados.", 400);
        }

        var [resultadoAvaliacao] = await conexao.execute(
            `INSERT INTO avaliacao
                (experiencia, por_que_fase, titas_favoritos, comentario, fk_usuario, fk_fase)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                dados.experiencia,
                dados.porQueFase,
                dados.titasFavoritos,
                dados.comentario,
                dados.idUsuario,
                fases[0].id_fase
            ]
        );

        var idAvaliacao = resultadoAvaliacao.insertId;
        for (var i = 0; i < personagens.length; i++) {
            await conexao.execute(
                "INSERT INTO avaliacao_personagem (fk_avaliacao, fk_personagem) VALUES (?, ?)",
                [idAvaliacao, personagens[i].id_personagem]
            );
        }

        await conexao.commit();
        transacaoIniciada = false;
        return idAvaliacao;
    } catch (erro) {
        if (transacaoIniciada) {
            try {
                await conexao.rollback();
            } catch (erroRollback) {
                console.error("Erro ao desfazer transação do questionário:", erroRollback);
            }
        }
        throw erro;
    } finally {
        await conexao.end();
    }
}

module.exports = {
    inserirAvaliacao
};
