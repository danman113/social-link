var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");
module.exports=function(database){
	router.get("/",function(req, res){
		res.send("<head><script src='/public/js/test.js'></script></head>Welcome to Social-Link.<h2><a href='/login/'>Login</a></h2><h2><a href='/signup/'>Sign Up</a></h2>");
	});
	return router;
};