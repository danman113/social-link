var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser = require("../lib/viewParser.js");
var session = require("express-session");
module.exports=function(database,settings){
	router.get("/login/",function(req, res){
		if(req.session.user){
			res.send("Already logged in");
		} else {
			parser("login.html",{},function(err, data){
				res.send(data);
			});
		}
	});
	router.post("/login/",function(req, res){
		//intializes session data if not currently there
		req.session.loginAttempts=req.session.loginAttempts?req.session.loginAttempts:0;
		req.session.lastAttempt=req.session.lastAttempt?new Date(req.session.lastAttempt):new Date();
		if((new Date().getTime()-req.session.lastAttempt)>1000*60*2){
			req.session.lastAttempt=new Date();
			req.session.loginAttempts=0;
		}
		var errorObj={error:0,errorMessage:"",attempts:req.session.loginAttempts,lastAttempt:req.session.lastAttempt};
		if(req.session.loginAttempts<5){
			database.user.find({username:req.body.username},function(err, data){
				console.log(data);
				if(err){
					errorObj.errorMessage="Error connecting to database";
					res.send(errorObj);
				} else {
					if(data.length<=0){
						req.session.loginAttempts++;
						errorObj.lastAttempt=new Date();
						errorObj.errorMessage="Username/password combination does not exist";
						errorObj.attempts=req.session.loginAttempts;
						res.send(errorObj);
					} else {
						//Add Stuff here!
						var salt=data[0].salt.toString().split(".");
						var hashed;
						if(salt.length<2){
							hashed=encrypt(salt[0]+req.body.pass1.toString(),data[0].username);
						} else {
							hashed=encrypt(salt[0]+req.body.pass1.toString()+salt[1],data[0].username);
						}
						console.log(hashed);
						if(hashed==data[0].password){
							req.session.loginAttempts=0;
							errorObj.error=1;
							errorObj.errorMessage="Login successful";
							errorObj.attempts=req.session.loginAttempts;
							req.session.user={username:data[0].username,powerlevel:data[0].powerlevel};
							res.send(errorObj);
						} else {
							req.session.loginAttempts++;
							errorObj.lastAttempt=new Date();
							errorObj.errorMessage="Invalid Password";
							errorObj.attempts=req.session.loginAttempts;
							res.send(errorObj);
						}
					}
				}
			});
		} else {
			errorObj.errorMessage="Timeout, please wait and attempt to login again";
			res.send(errorObj);
		}
	});
	function addUser(req, res){
		var date = req.body.dob.split("-");
		var dob= new Date(parseInt(date[0],10), parseInt(date[1],10), parseInt(date[2],10));
		var salt=Math.random()*0xffffffff+0xfff;
		var saltParse= salt.toString().split(".");
		var userSchema={
			username:req.body.username,
			password:encrypt(saltParse[0]+req.body.pass1+saltParse[1], req.body.username),
			friends:[],
			email:req.body.email,
			salt:salt,
			messages:[],
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
				hidden:false
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