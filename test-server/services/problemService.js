var ProblemModel = require("../models/problemModel");

var getProblems = function() {
    return new Promise(function(resolve,reject){
        ProblemModel.find({}, function (err, problems) {
            if (err){
                reject(err);
            } else{
                resolve(problems);
            }
        });
    });
}

var getProblem = function(id) {
    return new Promise(function(resolve,reject){
        ProblemModel.findOne({ id: id}, function (err, problem) {
            if (err){
                reject(err);
            } else{
                resolve(problem);
            }
        })
    })
}

var addProblem = function(newProblem){
    return new Promise(function(resolve,reject){
        ProblemModel.findOne({name: newProblem.name}, function (err, problem) {
            if (problem){
                reject("Problem name already exists!!!");
            } else{
                ProblemModel.count({},function (err, num) {
                    newProblem.id = num + 1;
                    var mongoProblem = new ProblemModel(newProblem);
                    mongoProblem.save();
                    resolve(newProblem);
                });
            }
        })
    })
}

// 输出object使得其他类可以引用！
module.exports = {
    getProblems: getProblems,
    getProblem: getProblem,
    addProblem: addProblem,
}