var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.all("/admin/",function(req, res, next){
		if(req.session.user){
			if(req.session.user.powerlevel){
				if(req.session.user.powerlevel>9000){
					next();
					return true;
				}
			}
		}
		sendTo403(req, res);
	});
	router.all("/admin/*",function(req, res, next){
		if(req.session.user){
			if(req.session.user.powerlevel){
				if(req.session.user.powerlevel>9000){
					next();
					return true;
				}
			}
		}
		sendTo403(req, res);
	});
	router.get("/admin/",function(req, res){
		var text="super secret admin panel";
		text+="<br/><a href='/admin/search/'>Super Search</a> <a href='/admin/destroy/'>Destory</a>";
		parser("fullwidth.html",{"%%title%%":"admin panel","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text},function(err, data){
			res.send(data);
		});
	});
	router.get("/admin/search",function(req, res){
		var text="";
		database.user.find({},function(err, data){
			console.log(data);
			for(var i=0;i<data.length;i++){
				text+='<div class="media"><div class="media-left"><div class="media-body"><h4 class="media-heading"><a class="btn btn-primary" href="/admin/promote/'+data[i].username+'">Promote</a> <a href="/users/'+data[i].username+'">'+data[i].username+"</a></h4></div></div></div>";
			}
			parser("fullwidth.html",{"%%title%%":"admin panel","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text},function(err, data){
				res.send(data);
			});
		});
	});
	router.get("/admin/promote/:id",function(req, res){
		database.user.findOne({username:req.params.id},function(err, data){
			if(data){
				database.user.update({username:req.params.id},{powerlevel:9001},function(){
					console.log(req.params.id+" upgraded their powerlevel");
				});
			}
			res.redirect("/admin/search");
		});
	});
	router.get("/admin/destroy",function(req, res){
		database.user.find({}).remove().exec(function(err, data){
			console.log("Destoryed database");
			res.redirect("/signup/");
		});
	});
	router.get("/promote/:id",function(req, res){
		database.user.findOne({username:req.params.id},function(err, data){
			if(data){
				database.user.update({username:req.params.id},{powerlevel:9001},function(){
					console.log(req.params.id+" upgraded their powerlevel");
				});
			}
		});
	});
	return router;
};

function sendTo403(req, res){
	var pathname=req._parsedUrl.pathname.substring(1,req._parsedUrl.pathname.length);
	res.status(403);
	res.redirect("/403/"+pathname);
}