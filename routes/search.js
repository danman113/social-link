var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/search/", function(req, res){
		res.send("search");
	});
	router.post("/search/", function(req, res){
		res.redirect("/search/"+req.body.query);
	});
	router.get("/search/:id", function(req, res){
		database.user.find({username:new RegExp(".*"+req.params.id+".*","g")}, function(err, data){
			console.log(data);
			if(err){
				res.send("dfas");
				return false;
			}
			var text="";
			for(var i=0;i<data.length;i++){
				text+='<div class="media"><div class="media-left"><div class="media-body"><h4 class="media-heading"><a href="/users/'+data[i].username+'">'+data[i].username+"</a></h4></div></div></div>";
			}
			parser("fullwidth.html",{"%%title%%":"search "+req.params.id,"%%username%%":req.session.user?req.session.user.username:"test","%%content%%":text}, function(err, data){
				res.send(data);
			});
		});
	});
	return router;
}
