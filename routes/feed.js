var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/feed/", function(req, res){
		res.send("Feed");
	});
	return router;
}