var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser=require("../lib/viewParser.js");
module.exports=function(database,settings){
	router.get("/signup/:id",function(req, res){
		database.user.find({username:req.params.id}, function(err, data){
			if(err){
				res.send("{\"error\":0}");
			} else {
				if (data.length<=0){
					res.send("{\"error\":0}");
				} else {
					res.send("{\"error\":1}");
				}
			}
		});
	});
	router.get("/signupSuccess/:id",function(req, res){
		parser("success.html",{"%%username%%":req.params.id}, function(err,data){
			res.send(data);
		});
	});
	router.get("/signup/",function(req, res){
		if(!req.session.user){
			parser("signup.html",{}, function(err,data){
				res.send(data);
			});
		} else {
			res.status(403);
			res.redirect("/403/signup");
		}
	});
	router.post("/signup/",function(req, res){
		req.body.username=(/\w+/g).exec(req.body.username)[0].toLowerCase().trim();
		database.user.find({username:req.body.username}, function(err, data){
			if(err){
				console.log(err);
				res.send("{\"error\":0,\"errorMessage\":\"Error connecting to database\"}");
				return false;
			} else {
				if (data.length>0){
					res.send("{\"error\":0,\"errorMessage\":\"Username taken\"}");
					return false;
				} else if (req.body.pass1 != req.body.pass2){
					res.send("{\"error\":0,\"errorMessage\":\"Invalid Password\"}");
					return false;
				} else if (req.body.username.length < 5){
					res.send("{\"error\":0,\"errorMessage\":\"Username must be longer than 5 characters\"}");
					return false;
				}  else if (req.body.email.search(/[a-zA-Z0-9]+(?:(\.|_)[A-Za-z0-9!#$%&'*+/=?^`{|}~-]+)*@(?!([a-zA-Z0-9]*\.[a-zA-Z0-9]*\.[a-zA-Z0-9]*\.))(?:[A-Za-z0-9](?:[a-zA-Z0-9-]*[A-Za-z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/g)>0){
					res.send("{\"error\":0,\"errorMessage\":\"Invalid email\"}");
					return false;
				} else {
					addUser(req, res);
					return true;
				}
			}
		});
	});
	function addUser(req, res){
		var date = req.body.dob.split("-");
		console.log(date);
		var dob= new Date(parseInt(date[0],10), parseInt(date[1],10), parseInt(date[2],10));
		var salt=Math.random()*0xffffffff+0xfff;
		var saltParse= salt.toString().split(".");
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var userSchema={
			username:req.body.username,
			password:encrypt(saltParse[0]+req.body.pass1+saltParse[1], req.body.username),
			friends:[],
			posts:[],
			powerlevel:5,
			email:req.body.email,
			salt:salt,
			passwordReset:false,
			messages:[],
			request:[],
			about:{
				firstName:"",
				lastName:"",
				education:"",
				location:"",
				birthday:dob,
				gender:1,
				website:"",
				politics:"",
				religion:"",
				relationship:false,
				phone:0,
				about:"",
				image:""
			},
			settings:{
				hidden:false,
				creationIP:ip,
				creationDate:new Date()
			}
		};
		var newFriend = new database.user(userSchema);
		newFriend.save();
		res.send("{\"error\":1,\"errorMessage\":\"Successful form\"}");
	}
	return router;
};

function encrypt(text,pass){
	var cypher=crypto.createHash("sha256");
	var crypted=cypher.update(text).digest("hex");
	return crypted;
}