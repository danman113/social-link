var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");
var crypto = require("crypto");
module.exports=function(database, settings){
	router.post("/passwordreset/",function(req, res){
		if(req.session.user){
			if(req.body.pass1==req.body.pass2 && req.body.pass1.length>=7){
				database.user.find({_id:req.session.user.id},function(err, data){
					var salt=data[0].salt.toString().split(".");
					var hashed;
					if(salt.length<2){
						hashed=encrypt(salt[0]+req.body.pass1.toString(),data[0].username);
					} else {
						hashed=encrypt(salt[0]+req.body.pass1.toString()+salt[1],data[0].username);
					}
					database.user.update({_id:req.session.user.id},{password:hashed},function(err,data){
						parser("fullwidth.html",{"%%title%%":"password","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":"Your password has been reset!"},function(err, data){
							res.send(data);
						});
					});
				});
			} else {
				var response={error:0};
				response.errorMessage="Invalid passwords, passwords must be 7 characters long.";
				res.send(response);
			}
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	return router;
};

function encrypt(text,pass){
	var cypher=crypto.createHash("sha256");
	var crypted=cypher.update(text).digest("hex");
	return crypted;
}