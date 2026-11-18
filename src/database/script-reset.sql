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
SELECT experiencia, COUNT(*) AS total
FROM avaliacao
GROUP BY experiencia
ORDER BY total DESC;

SELECT p.nome AS personagem, COUNT(*) AS total
FROM avaliacao_personagem ap
JOIN personagem p ON ap.fk_personagem = p.id_personagem
GROUP BY p.nome
ORDER BY total DESC;

SELECT f.nome AS fase, COUNT(*) AS total
FROM avaliacao a
JOIN fase f ON a.fk_fase = f.id_fase
GROUP BY f.nome
ORDER BY total DESC;

SELECT a.id_avaliacao, u.nome AS usuario, a.experiencia, f.nome AS fase, a.data_hora
FROM avaliacao a
JOIN usuario u ON a.fk_usuario = u.id_usuario
JOIN fase f ON a.fk_fase = f.id_fase
ORDER BY a.data_hora DESC
LIMIT 20;