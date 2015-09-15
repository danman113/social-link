var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/search/", function(req, res){
		parser("fullwidth.html",{"%%title%%":"search","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":"Please enter in a search term and try again"}, function(err, data){
			res.send(data);
		});
	});
	router.post("/search/", function(req, res){
		res.redirect("/search/"+req.body.query.toLowerCase().trim());
	});
	router.get("/search/:id", function(req, res){
		req.params.id=req.params.id.toLowerCase().trim();
		var text="";
		if(req.params.id.length<4){
			text+="Search query must be longer than 3 characters";
			parser("fullwidth.html",{"%%title%%":"search "+req.params.id,"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text}, function(err, data){
				res.send(data);
			});
			return false;
		}
		database.user.find({username:new RegExp(".*"+req.params.id+".*","g")}, function(err, data){
			console.log(data);
			if(err){
				res.status(403);
				res.redirect("/login/");
				return false;
			}
			if(!req.session.user){
				res.status(403);
				res.redirect("/login/");
				return false;
			}
			
			if(data.length<1)
				text+="No users found with that query";
			for(var i=0;i<data.length;i++){
				text+='<div class="media"><div class="media-left"><div class="media-body"><h4 class="media-heading"><a href="/users/'+data[i].username+'">'+data[i].username+"</a></h4></div></div></div>";
			}
			parser("fullwidth.html",{"%%title%%":"search "+req.params.id,"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text}, function(err, data){
				res.send(data);
			});
		});
	});
	return router;
};
