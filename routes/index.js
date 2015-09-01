var express = require('express');
var router = express.Router();

module.exports=function(database){
	router.get("/",function(req, res){
		res.send("<head><script src='/public/js/test.js'></script></head>Welcome");
	});
	
	
	return router;
};