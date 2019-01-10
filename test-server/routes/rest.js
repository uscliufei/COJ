var express = require("express");
var router = express.Router();
var problemService = require("../services/problemService");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

var node_rest_client = require('node-rest-client').Client;

var rest_client = new node_rest_client();

EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';

rest_client.registerMethod('build_and_run',EXECUTOR_SERVER_URL, 'POST');

router.get("/problems", function(req, res){
    problemService.getProblems()
        .then(function(problems){
            res.json(problems);
        });
});

router.get("/problems/:id", function(req,res) {
    var id = req.params.id; //req.params包括URL变量
    problemService.getProblem(+id)
        .then(function(problem){
            res.json(problem);
        })
});

router.post("/problems",jsonParser, function(req, res){
    problemService.addProblem(req.body)   //REQUEST.BODY 即为JSON文件！
        .then(function(problem){
            res.json(problem);
        })
        .catch(function(error){
            res.status(400).send(error);   //
        })
});

router.post("/build_and_run",jsonParser, function(req, res){
    const userCode = req.body.user_code;
    const lang = req.body.lang;
    console.log(lang+': '+userCode);
    let arg = {
        data: {code: userCode, lang: lang},
        headers: {"Content-Type": "application/json"}
    };
    console.log(arg.data);
    rest_client.methods.build_and_run(
       arg,(data,response) => {
            console.log("Received response from executor"+response);
            const text = `Build output：${data['build']} Execute output: ${data['run']}`;
            data['text'] = text;
            res.json(data);
    }
    )
});

module.exports = router;