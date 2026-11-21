CREATE DATABASE Projeto_reset;
USE Projeto_reset;

CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fase (
    id_fase INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE personagem (
    id_personagem INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL UNIQUE
);

CREATE TABLE avaliacao (
    id_avaliacao INT PRIMARY KEY AUTO_INCREMENT,
    experiencia VARCHAR(10) NOT NULL CHECK (experiencia IN ('Excelente', 'Boa', 'Regular', 'Ruim')),
    por_que_fase VARCHAR(1000) NOT NULL,
    titas_favoritos VARCHAR(1000) NOT NULL,
    comentario VARCHAR(1000),
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fk_usuario INT NOT NULL,
    fk_fase INT NOT NULL,
    CONSTRAINT ch_fk_usuario FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario),
    CONSTRAINT ch_fk_fase FOREIGN KEY (fk_fase) REFERENCES fase(id_fase)
);

CREATE TABLE avaliacao_personagem (
    fk_avaliacao INT NOT NULL,
    fk_personagem INT NOT NULL,
    PRIMARY KEY (fk_avaliacao, fk_personagem),
    CONSTRAINT ch_fk_avaliacao FOREIGN KEY (fk_avaliacao) REFERENCES avaliacao(id_avaliacao),
    CONSTRAINT ch_fk_personagem FOREIGN KEY (fk_personagem) REFERENCES personagem(id_personagem)
);

INSERT INTO usuario (nome, email, senha, data_nascimento) VALUES
    ('Victor Mansur', 'victor@email.com', 'senha_de_teste', '2007-03-15'),
    ('Ana Souza', 'ana@email.com', 'senha_de_teste', '2003-08-10');

INSERT INTO fase (nome) VALUES
    ('Wumpa Island'),
    ('Lumber Yard'),
    ('N. Sanity Island'),
    ('Uka Tree'),
    ('Cortex''s Lair / Doominator');

INSERT INTO personagem (nome) VALUES
    ('Crash Bandicoot'),
    ('Coco Bandicoot'),
    ('Crunch Bandicoot'),
    ('Neo Cortex'),
    ('Nina Cortex'),
    ('Aku Aku / Uka Uka');

-- Dados de teste
INSERT INTO avaliacao (experiencia, por_que_fase, titas_favoritos, comentario, fk_usuario, fk_fase) VALUES
    ('Excelente', 'A trilha e o visual da selva são muito marcantes.', 'Spike e Magmadon.', NULL, 1, 1),
    ('Boa', 'Os desafios da serraria são divertidos.', 'RhinoRoller.', 'Ótimo projeto!', 2, 2);

INSERT INTO avaliacao_personagem (fk_avaliacao, fk_personagem) VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 4);

-- Consultas para o dashboard
-- KPI: Total de usuários cadastrados
SELECT COUNT(*) AS total_usuarios
FROM usuario;

-- KPI: Média de idade dos usuários
SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE())), 1) AS media_idade
FROM usuario;

-- Gráfico: Idade dos usuários (quantidade por idade)
SELECT TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE()) AS idade, COUNT(*) AS total
FROM usuario
GROUP BY idade
ORDER BY idade ASC;

-- Gráfico: Usuários agrupados por faixa de idade
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

-- Gráfico: Quantidade de usuários cadastrados por data
SELECT DATE_FORMAT(data_cadastro, '%d/%m/%Y') AS data_cadastro, COUNT(*) AS total
FROM usuario
GROUP BY DATE(data_cadastro), DATE_FORMAT(data_cadastro, '%d/%m/%Y')
ORDER BY DATE(data_cadastro) ASC;

-- Avaliação da experiência no site (Excelente, Boa, Regular, Ruim)
SELECT experiencia, COUNT(*) AS total
FROM avaliacao
GROUP BY experiencia
ORDER BY total DESC;