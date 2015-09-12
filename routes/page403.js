var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser = require("../lib/viewParser.js");
module.exports=function(database,settings){
	router.get("/403",function(req, res, next){
		parser("403.html",{"%%redirect%%":"this page"},function(err, data){
			res.send(data);
		});
	});
	router.get("/403/:id",function(req, res, next){
		parser("403.html",{"%%redirect%%":req.params.id},function(err, data){
			res.send(data);
		});
	});
	return router;
};