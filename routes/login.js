var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser=require("../lib/viewParser.js");
module.exports=function(database,settings){
	router.get("/login/",function(req, res){
		parser("login.html",{},function(err, data){
			res.send(data);
		});
	});
	router.post("/login/",function(req, res){
		database.user.find({username:req.body.username},function(err, data){
			console.log(data);
			if(err){
				res.send("{\"error\":0,\"errorMessage\":\"Error connecting to database\"}");
			} else {
				if(data.length<=0){
					res.send("{\"error\":0,\"errorMessage\":\"Username/password combination does not exist\"}");
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
					if(hashed==data[0].password)
						res.send("{\"error\":1,\"errorMessage\":\"Login successful\"}");
					else {
						res.send("{\"error\":0,\"errorMessage\":\"Invalid Password\"}");
					}
				}
			}
		});
	});
	function addUser(req, res){
		var date = req.body.dob.split("-");
		var dob= new Date(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
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
		}
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