var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser = require("../lib/viewParser.js");
var mongoose = require("mongoose");
module.exports=function(database,settings){
	router.get("/posts",function(req, res, next){
		if(req.session.user){
			//feed code
			database.user.findOne({_id:req.session.user.id}).populate("friends").exec(function(err, you){
				console.log(you);
				database.posts.find({owner:{$in:you.friends}}).sort({postDate:-1}).exec(function(err, data){
					console.log(data);
					res.send(data);
				});
			});
			
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});

	router.post("/posts",function(req, res, next){
		console.log(req.body.content);
		if(req.session.user && req.body.content){
			if(req.session.user.id ){
				var you=new mongoose.Types.ObjectId(req.session.user.id);
				var postSchema={
					content:req.body.content,
					postDate:new Date(),
					owner:you,
					likes:[]
				}
				var post = new database.posts(postSchema);
				var postId=new mongoose.Types.ObjectId(post._id);
				post.save();
				database.user.update({_id:req.session.user.id},{$push:{posts:postId}},{safe: true, upsert: true, new : true},function(err, data){
					console.log(post._id);
				});
				res.redirect("/feed/");
				//res.send("Posted data");
				return true;
			}
		} else {
			res.status(403);
			res.redirect("/login/");
			return false;
		}
		res.redirect("/feed/");
	});
	router.get("/posts/:id",function(req, res, next){
		if(req.session.user){
			
		} else {
			res.status(403);
			res.redirect("login");
		}
	});
	router.put("/posts/:id",function(req, res, next){
		if(req.session.user){
			
		} else {
			res.status(403);
			res.redirect("login");
		}
	});

	router.get("/posts/comments/:id",function(req, res, next){
		if(req.session.user){
			
		} else {
			res.status(403);
			res.redirect("login");
		}
	});
	router.post("/posts/comments/:id",function(req, res, next){
		if(req.session.user){
			
		} else {
			res.status(403);
			res.redirect("login");
		}
	});

	return router;
};