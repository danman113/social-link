var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser = require("../lib/viewParser.js");
module.exports=function(database,settings){
	router.get("/logout",function(req, res, next){
		if(req.session.user){
			req.session.destroy(function(){
				console.log("Logged out user");
				res.redirect("/");
			});
		} else {
			res.status(403);
			res.redirect("/403/logout");
		}
	});
	return router;
};