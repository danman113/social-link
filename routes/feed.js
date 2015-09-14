var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/feed/", function(req, res){
		if(req.session.user){
			parser("feed.html",{"%%username%%":req.session.user.username},function(err, data){
				res.send(data);
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	return router;
};