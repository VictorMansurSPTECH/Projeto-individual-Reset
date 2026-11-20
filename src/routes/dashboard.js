var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboard");

// GET /dashboard/dados retorna indicadores e dados para os gráficos.
router.get("/dados", function (req, res) {
    dashboardController.buscarDados(req, res);
});

module.exports = router;
