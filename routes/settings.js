var express = require('express');
var router = express.Router();
var parser=require("../lib/viewParser.js");

module.exports=function(database, settings){
	router.get("/settings/", function(req, res){
		if(req.session.user){
			database.user.findOne({_id:req.session.user.id},function(err, data){
				console.log(data.about);
				var select='<option value="1"'+(data.about.gender==1?"selected":"")+'>Male</option><option value="2"'+(data.about.gender==2?"selected":"")+'>Female</option><option value="3"'+(data.about.gender==3?"selected":"")+'>Transgendered</option><option value="4"'+(data.about.gender==4?"selected":"")+'>OtherKin</option>';
				var dataobj={
					"%%title%%":"Settings",
					"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/",
					"%%firstName%%":data.about.firstName,
					"%%lastName%%":data.about.lastName,
					"%%education%%":data.about.education,
					"%%location%%":data.about.location,
					"%%gender%%":data.about.gender,
					"%%website%%":data.about.website,
					"%%politics%%":data.about.politics,
					"%%religion%%":data.about.religion,
					"%%relationship%%":data.about.relationship?"checked":"",
					"%%phone%%":data.about.phone,
					"%%about%%":data.about.about,
					"%%genderSelect%%":select,
					"%%dfa%%":false
				};
				parser("settings.html",dataobj,function(err, data){
					res.send(data);
				});
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	router.post("/settings/", function(req, res){
		if(req.session.user){
			var newInfo = {
				about:{
					firstName:req.body.firstName.substr(0,40),
					lastName:req.body.lastName.substr(0,40),
					education:req.body.education.substr(0,100),
					location:req.body.location.substr(0,100),
					gender:parseInt(req.body.gender,10),
					website:req.body.website.substr(0,100),
					politics:req.body.politics.substr(0,100),
					religion:req.body.religion.substr(0,100),
					relationship:req.body.relationship=="on",
					phone:parseInt(req.body.phone,10),
					about:req.body.about.substr(0,1000)
				}
			};
			console.log(req.body.relationship);
			database.user.update({_id:req.session.user.id},newInfo,function(err, data){
				if(err){
					console.log(err);
				}
				res.redirect("/settings/");
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	return router;
};