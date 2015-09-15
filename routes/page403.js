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
	router.get("/403/*",function(req, res, next){
		var pathname=req._parsedUrl.pathname.substring(1,req._parsedUrl.pathname.length);
		var paths=pathname.split("/");
		paths.splice(0,1);
		var directory=paths.join("/");
		parser("403.html",{"%%redirect%%":directory},function(err, data){
			res.send(data);
		});
	});
	return router;
};