var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/feed/", function(req, res){
		if(req.session.user){
			res.send("Welcome " + req.session.user.username);
		} else {
			res.send("403");
		}
	});
	return router;
}