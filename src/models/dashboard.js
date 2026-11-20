var database = require("../database/config");

// Busca os indicadores e listas usados pelos gráficos da dashboard.

// Conta quantos usuários estão cadastrados.
function buscarTotalUsuarios() {
    var instrucaoSql = `
        SELECT COUNT(*) AS total_usuarios
        FROM usuario;
    `;
    return database.executar(instrucaoSql);
}

// Calcula a idade média dos usuários, com uma casa decimal.
function buscarMediaIdadeUsuarios() {
    var instrucaoSql = `
        SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE())), 1) AS media_idade
        FROM usuario;
    `;
    return database.executar(instrucaoSql);
}

// Agrupa os usuários pela idade atual.
function buscarUsuariosPorIdade() {
    var instrucaoSql = `
        SELECT TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) AS idade, COUNT(*) AS total
        FROM usuario
        GROUP BY idade
        ORDER BY idade ASC;
    `;
    return database.executar(instrucaoSql);
}

// Agrupa os cadastros por dia.
function buscarUsuariosPorData() {
    var instrucaoSql = `
        SELECT DATE_FORMAT(data_cadastro, '%d/%m/%Y') AS data_cadastro, COUNT(*) AS total
        FROM usuario
        GROUP BY DATE(data_cadastro), DATE_FORMAT(data_cadastro, '%d/%m/%Y')
        ORDER BY DATE(data_cadastro) ASC;
    `;
    return database.executar(instrucaoSql);
}

// Conta quantas avaliações existem para cada experiência.
function buscarAvaliacoesPorExperiencia() {
    var instrucaoSql = `
        SELECT experiencia, COUNT(*) AS total
        FROM avaliacao
        GROUP BY experiencia
        ORDER BY total DESC, experiencia ASC;
    `;
    return database.executar(instrucaoSql);
}

// Conta as escolhas de cada personagem registradas nas avaliações.
function buscarPersonagensMaisEscolhidos() {
    var instrucaoSql = `
        SELECT personagem.nome, COUNT(*) AS total
        -- Relaciona cada escolha ao nome do personagem.
        FROM avaliacao_personagem
        INNER JOIN personagem
            ON avaliacao_personagem.fk_personagem = personagem.id_personagem
        GROUP BY personagem.id_personagem, personagem.nome
        ORDER BY total DESC, personagem.nome ASC;
    `;
    return database.executar(instrucaoSql);
}

// Conta quantas avaliações escolheram cada fase.
function buscarFasesMaisEscolhidas() {
    var instrucaoSql = `
        SELECT fase.nome, COUNT(*) AS total
        -- Relaciona cada avaliação ao nome da fase.
        FROM avaliacao
        INNER JOIN fase
            ON avaliacao.fk_fase = fase.id_fase
        GROUP BY fase.id_fase, fase.nome
        ORDER BY total DESC, fase.nome ASC;
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarTotalUsuarios,
    buscarMediaIdadeUsuarios,
    buscarUsuariosPorIdade,
    buscarUsuariosPorData,
    buscarAvaliacoesPorExperiencia,
    buscarPersonagensMaisEscolhidos,
    buscarFasesMaisEscolhidas
};
