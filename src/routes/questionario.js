var express = require("express");
var router = express.Router();

var questionarioController = require("../controllers/questionarioController");

router.post("/", function (req, res) {
    questionarioController.salvar(req, res);
});

module.exports = router;
