var dashboardModel = require("../models/dashboard");

async function buscarDados(req, res) {
    try {
        // Cada linha abaixo busca uma parte dos dados no banco.
        var resultadoTotal = await dashboardModel.buscarTotalUsuarios();
        var resultadoMedia = await dashboardModel.buscarMediaIdadeUsuarios();
        var usuariosPorIdade = await dashboardModel.buscarUsuariosPorIdade();
        var usuariosPorData = await dashboardModel.buscarUsuariosPorData();
        var avaliacoesPorExperiencia = await dashboardModel.buscarAvaliacoesPorExperiencia();
        var personagens = await dashboardModel.buscarPersonagensMaisEscolhidos();
        var fases = await dashboardModel.buscarFasesMaisEscolhidas();

        var totalUsuarios = Number(resultadoTotal[0].total_usuarios);
        var mediaIdade = resultadoMedia[0].media_idade;

        // O banco pode retornar a média como texto. Convertendo para número.
        if (mediaIdade !== null) {
            mediaIdade = Number(mediaIdade);
        }

        // Envia para a página os indicadores e os dados de cada gráfico.
        res.status(200).json({
            kpis: {
                totalUsuarios: totalUsuarios,
                mediaIdade: mediaIdade,
                personagemMaisEscolhido: personagens.length > 0 ? personagens[0].nome : null,
                mapaMaisEscolhido: fases.length > 0 ? fases[0].nome : null
            },
            graficos: {
                usuariosPorIdade: usuariosPorIdade,
                usuariosPorData: usuariosPorData,
                avaliacoesPorExperiencia: avaliacoesPorExperiencia,
                personagensMaisEscolhidos: personagens,
                fasesMaisEscolhidas: fases
            }
        });
    } catch (erro) {
        console.error("Houve um erro ao buscar os dados da dashboard:", erro.sqlMessage || erro);
        res.status(500).json({ erro: "Não foi possível carregar os dados da dashboard." });
    }
}

module.exports = {
    buscarDados
};
