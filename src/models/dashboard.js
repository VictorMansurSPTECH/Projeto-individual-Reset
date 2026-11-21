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

// Agrupa os usuários nas faixas de idade exibidas pela dashboard.
function buscarUsuariosPorFaixaIdade() {
    var instrucaoSql = `
        SELECT faixas.faixa_idade, COUNT(usuario.id_usuario) AS total
        FROM (
            SELECT 'Até 12 anos' AS faixa_idade, 1 AS ordem
            UNION ALL SELECT '13 a 17 anos', 2
            UNION ALL SELECT '18 a 24 anos', 3
            UNION ALL SELECT '25 a 34 anos', 4
            UNION ALL SELECT '35 a 44 anos', 5
            UNION ALL SELECT '45 a 59 anos', 6
            UNION ALL SELECT '60 anos ou mais', 7
        ) AS faixas
        LEFT JOIN usuario
            ON faixas.faixa_idade = CASE
                WHEN TIMESTAMPDIFF(YEAR, usuario.data_nascimento, CURDATE()) <= 12 THEN 'Até 12 anos'
                WHEN TIMESTAMPDIFF(YEAR, usuario.data_nascimento, CURDATE()) <= 17 THEN '13 a 17 anos'
                WHEN TIMESTAMPDIFF(YEAR, usuario.data_nascimento, CURDATE()) <= 24 THEN '18 a 24 anos'
                WHEN TIMESTAMPDIFF(YEAR, usuario.data_nascimento, CURDATE()) <= 34 THEN '25 a 34 anos'
                WHEN TIMESTAMPDIFF(YEAR, usuario.data_nascimento, CURDATE()) <= 44 THEN '35 a 44 anos'
                WHEN TIMESTAMPDIFF(YEAR, usuario.data_nascimento, CURDATE()) <= 59 THEN '45 a 59 anos'
                ELSE '60 anos ou mais'
            END
        GROUP BY faixas.faixa_idade, faixas.ordem
        ORDER BY faixas.ordem;
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

// Conta as escolhas de cada titã registradas nas avaliações.
function buscarTitansMaisEscolhidos() {
    var instrucaoSql = `
        SELECT titan.nome, COUNT(*) AS total
        FROM avaliacao_titan
        INNER JOIN titan
            ON avaliacao_titan.fk_titan = titan.id_titan
        GROUP BY titan.id_titan, titan.nome
        ORDER BY total DESC, titan.nome ASC;
    `;
    return database.executar(instrucaoSql);
}

// Conta quantas avaliações escolheram cada fase.
function buscarFasesMaisEscolhidas() {
    var instrucaoSql = `
        SELECT fase.nome, COUNT(*) AS total
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
    buscarUsuariosPorFaixaIdade,
    buscarUsuariosPorData,
    buscarTitansMaisEscolhidos,
    buscarFasesMaisEscolhidas
};