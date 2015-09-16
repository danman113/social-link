var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/feed/", function(req, res){
		var body="";
		if(req.session.user){
			database.user.find({_id:req.session.user.id}).populate("friends").populate("request").exec(function(err, data){
				console.log(data[0].request);
				if(data[0].request.length>=1){
					body+="<h1>Friend Requests</h1>";
					for(var i=0;i<data[0].request.length;i++){
						console.log(data[0].request[i]);
						body+='<div class="media"><div class="media-left"><div class="media-body"><h4 class="media-heading"><form method="POST" action="/users/"><input type="hidden" name="id" value="'+i+'"/><button class="btn btn-primary" type="submit">Add Friend</button></form> <a href="/users/'+data[0].request[i].username+'">'+data[0].request[i].username+"</a></h4></div></div></div>";
					}
				}
				parser("feed.html",{"%%username%%":req.session.user.username,"%%request%%":body},function(err, html){
					res.send(html);
				});
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	return router;
};