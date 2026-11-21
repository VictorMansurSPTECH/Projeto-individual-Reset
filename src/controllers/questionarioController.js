var questionarioModel = require("../models/questionarioModel");

function salvar(req, res) {
    var dados = req.body || {};

    // Lê os campos que vieram do formulário
    var idUsuario = Number(dados.idUsuario);
    var experiencia = dados.experiencia;
    var personagens = dados.personagens;
    var faseFavorita = dados.faseFavorita;
    var porQueFase = dados.porQueFase;
    var titasFavoritos = dados.titasFavoritos;
    var comentario = dados.comentario;

    // 1) idUsuario precisa ser um número inteiro maior ou igual a 1
    if (isNaN(idUsuario) || idUsuario < 1 || Math.floor(idUsuario) !== idUsuario) {
        res.status(401).json({ erro: "Faça login novamente para enviar a avaliação." });
        return;
    }

    // 2) experiencia precisa ser uma das quatro opções
    if (experiencia !== "Excelente" && experiencia !== "Boa" && experiencia !== "Regular" && experiencia !== "Ruim") {
        res.status(400).json({ erro: "Selecione uma opção válida para sua experiência." });
        return;
    }

    // 3) personagens precisa ser uma lista com de 1 a 6 itens
    if (!Array.isArray(personagens) || personagens.length === 0 || personagens.length > 6) {
        res.status(400).json({ erro: "Selecione ao menos um personagem." });
        return;
    }

    // Cada personagem precisa ser um texto não vazio. Tira os espaços das pontas.
    for (var i = 0; i < personagens.length; i++) {
        if (typeof personagens[i] !== "string" || personagens[i].trim() === "") {
            res.status(400).json({ erro: "A seleção de personagens é inválida." });
            return;
        }
        personagens[i] = personagens[i].trim();
    }

    // 4) faseFavorita precisa ser texto, não vazio, com até 60 caracteres
    if (typeof faseFavorita !== "string" || faseFavorita.trim() === "" || faseFavorita.length > 60) {
        res.status(400).json({ erro: "Selecione uma fase válida." });
        return;
    }
    faseFavorita = faseFavorita.trim();

    // 5) porQueFase precisa ser texto, não vazio, com até 1000 caracteres
    if (typeof porQueFase !== "string" || porQueFase.trim() === "" || porQueFase.length > 1000) {
        res.status(400).json({ erro: "Explique sua escolha da fase em até 1000 caracteres." });
        return;
    }
    porQueFase = porQueFase.trim();

    // 6) titasFavoritos precisa ser texto, não vazio, com até 1000 caracteres
    if (typeof titasFavoritos !== "string" || titasFavoritos.trim() === "" || titasFavoritos.length > 1000) {
        res.status(400).json({ erro: "Informe seus titãs favoritos em até 1000 caracteres." });
        return;
    }
    titasFavoritos = titasFavoritos.trim();

    // 7) comentario é opcional. Se não vier, fica null.
    if (comentario === undefined || comentario === null) {
        comentario = null;
    } else if (typeof comentario !== "string") {
        res.status(400).json({ erro: "O comentário informado é inválido." });
        return;
    } else {
        comentario = comentario.trim();
        if (comentario.length > 1000) {
            res.status(400).json({ erro: "O comentário deve ter até 1000 caracteres." });
            return;
        }
        if (comentario === "") {
            comentario = null;
        }
    }

    // Tudo validado. Monta o objeto que será enviado ao model.
    var dadosAvaliacao = {
        idUsuario: idUsuario,
        experiencia: experiencia,
        personagens: personagens,
        faseFavorita: faseFavorita,
        porQueFase: porQueFase,
        titasFavoritos: titasFavoritos,
        comentario: comentario
    };

    // Chama o model. Se der certo, cai no .then. Se der erro, cai no .catch.
    questionarioModel.inserirAvaliacao(dadosAvaliacao)
        .then(function (idAvaliacao) {
            res.status(201).json({ idAvaliacao: idAvaliacao });
        })
        .catch(function (erro) {
            // Erros de validação do model trazem statusCode (400 ou 401)
            if (erro.statusCode === 400 || erro.statusCode === 401) {
                res.status(erro.statusCode).json({ erro: erro.message });
                return;
            }
            // Qualquer outro erro é problema interno do servidor
            console.error("Erro ao salvar questionário:", erro.sqlMessage || erro);
            res.status(500).json({ erro: "Não foi possível salvar a avaliação." });
        });
}

module.exports = {
    salvar: salvar
};