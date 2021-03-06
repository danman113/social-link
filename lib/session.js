var express = require('express');
var router = express.Router();
var session = require("express-session");
module.exports=function(database,settings){
	router.use(session({
		secret:"Cookie Parserdude",
		name:"Super Session Bros",
		cookie:{
			expires:new Date(Date.now()+1000*60)
		}
	}));
	router.use(function(req, res, next){
		req.session.cookie.expires=new Date(Date.now()+1000*60);
		next();
	});
	router.get("/session/",function(req, res, next){
		console.log(req.session);
		next();
	});
	return router;
};
