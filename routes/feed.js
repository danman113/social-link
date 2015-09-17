var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/feed/", function(req, res){
		var body="";
		if(req.session.user){
			database.user.find({_id:req.session.user.id}).populate("friends").populate("request").exec(function(err, data){
				if(data.length<=0){
					res.status(403);
					res.redirect("/logout/");
				}
				console.log(data[0].request);
				if(data[0].request.length>=1){
					body+="<h1 id='request'>Friend Requests</h1>";
					for(var i=0;i<data[0].request.length;i++){
						console.log(data[0].request[i]);
						body+='<div class="media" name="request"><div class="media-left"><div class="media-body"><h4 class="media-heading"><button name="'+i+'" class="btn btn-primary add" type="submit">Add Friend</button> <button name="'+i+'" class="btn btn-danger remove" type="submit">X</button></form> <a href="/users/'+data[0].request[i].username+'">'+data[0].request[i].username+"</a></h4></div></div></div>";
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