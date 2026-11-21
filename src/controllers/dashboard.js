var dashboardModel = require("../models/dashboard");

function buscarDados(req, res) {
    // Guarda aqui o resultado de cada consulta para montar a resposta no final
    var r = {};

    dashboardModel.buscarTotalUsuarios()
        .then(function (resultado) {
            r.totalUsuarios = Number(resultado[0].total_usuarios);
            return dashboardModel.buscarMediaIdadeUsuarios();
        })
        .then(function (resultado) {
            // O banco pode devolver a média como texto; convertendo para número
            if (resultado[0].media_idade === null) {
                r.mediaIdade = null;
            } else {
                r.mediaIdade = Number(resultado[0].media_idade);
            }
            return dashboardModel.buscarUsuariosPorIdade();
        })
        .then(function (resultado) {
            r.usuariosPorIdade = resultado;
            return dashboardModel.buscarUsuariosPorFaixaIdade();
        })
        .then(function (resultado) {
            r.usuariosPorFaixaIdade = resultado;
            return dashboardModel.buscarUsuariosPorData();
        })
        .then(function (resultado) {
            r.usuariosPorData = resultado;
            return dashboardModel.buscarTitansMaisEscolhidos();
        })
        .then(function (resultado) {
            r.titans = resultado;
            return dashboardModel.buscarFasesMaisEscolhidas();
        })
        .then(function (resultado) {
            r.fases = resultado;

            // Envia para a página os indicadores e os dados de cada gráfico
            res.status(200).json({
                kpis: {
                    totalUsuarios: r.totalUsuarios,
                    mediaIdade: r.mediaIdade,
                    titanMaisEscolhido: r.titans.length > 0 ? r.titans[0].nome : null,
                    mapaMaisEscolhido: r.fases.length > 0 ? r.fases[0].nome : null
                },
                graficos: {
                    usuariosPorIdade: r.usuariosPorIdade,
                    usuariosPorFaixaIdade: r.usuariosPorFaixaIdade,
                    usuariosPorData: r.usuariosPorData,
                    titansMaisEscolhidos: r.titans,
                    fasesMaisEscolhidas: r.fases
                }
            });
        })
        .catch(function (erro) {
            console.error("Houve um erro ao buscar os dados da dashboard:", erro.sqlMessage || erro);
            res.status(500).json({ erro: "Não foi possível carregar os dados da dashboard." });
        });
}

module.exports = {
    buscarDados: buscarDados
};