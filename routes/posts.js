var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser = require("../lib/viewParser.js");
var mongoose = require("mongoose");
module.exports=function(database,settings){
	function formatDate(date){
		return (date.getMonth()+1)+"\\"+date.getDate()+"\\"+date.getFullYear().toString().substring(2,4);
	}
	router.get("/posts",function(req, res, next){
		if(req.session.user){
			database.user.findOne({_id:req.session.user.id}).populate("friends").exec(function(err, you){
				if(!you){
					res.send([]);
					return false;
				}
				var limit = 20;
				if(req.query.limit)
					limit=parseInt(req.query.limit,10);
				database.posts.find({owner:{$in:you.friends}}).limit(limit).sort({postDate:-1}).populate({path:"owner",select:"username _id"}).exec(function(err, data){
					res.send(data);
				});
			});
			
		} else {
			res.send([]);
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
				};
				var post = new database.posts(postSchema);
				var postId=new mongoose.Types.ObjectId(post._id);
				post.save();
				database.user.update({_id:req.session.user.id},{$push:{posts:postId}},{safe: true, upsert: true, new : true},function(err, data){
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
		var body="";
		if(req.session.user){
			database.posts.findOne({_id:req.params.id}).populate({path:"owner",select:"username _id"}).exec(function(err, data){
				if(data){
					body+="<a href='/users/"+data.owner.username+"'><h2>"+data.owner.username+"</h2></a><small>"+formatDate(data.postDate)+"</small><p>"+data.content+"</p>";
				} else {
					body+="Not found";
				}
				parser("fullwidth.html",{"%%title%%":data.owner.username+"'s post","%%content%%":body,"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/"},function(err, html){
					res.send(html);
				});
			});
		} else {
			res.status(403);
			res.redirect("/login/");
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