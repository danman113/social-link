var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser=require("../lib/viewParser.js");
module.exports=function(database,settings){
	router.get("/users/:id",function(req, res){
		var body="";
		database.user.find({username:req.params.id}).populate("friends").exec(function(err, data){
			if(err){
				body+="Error finding "+req.params.id;
			} else {
				if(data.length>=1){
					if(req.session.user)
						if(req.session.user.username != req.params.id)
							body+="<form method='POST'><button class='btn btn-primary'>Add Friend</button></form>";
					console.log(data);
					var genders=["Male", "Female", "Transgendered", "Otherkin"];
					body+="<h1>"+data[0].username+"</h1>";
					body+="<h2>"+data[0].about.firstName+" "+data[0].about.lastName+"</h2>";
					body+="<div style='margin-left:20px;'>";
						body+="<h2>Gender</h2><p>"+genders[parseInt(data[0].about.gender,10)-1]+"</p>";
						body+=(data[0].about.location.length<=1)?"":"<h2>Location</h2><p>"+data[0].about.location+"</p>";
						body+=(data[0].about.education.length<=1)?"":"<h2>Education</h2><p>"+data[0].about.education+"</p>";
						body+=(data[0].about.website.length<5)?"":"<h2>Website</h2><p><a target='_blank' href='http://"+data[0].about.website+"'>"+data[0].about.website+"</a></p>";
						body+="<h2>"+(data[0].about.relationship?"In a relationship":"Single")+"</h2>";
						body+=(data[0].about.phone<40)?"":"<h2>Phone</h2><p><a href='tel:"+data[0].about.phone.toString()+"'>("+data[0].about.phone.toString().substr(0,3)+")-"+data[0].about.phone.toString().substr(3,3)+"-"+data[0].about.phone.toString().substr(6,4)+"</a></p>";
						body+=(data[0].about.politics.length<1)?"":"<h2>Political Views</h2><p>"+data[0].about.politics+"</p>";
						body+=(data[0].about.religion.length<1)?"":"<h2>Religion</h2><p>"+data[0].about.religion+"</p>";
						body+=(data[0].about.about.length<5)?"":"<h2>About</h2><p>"+data[0].about.about+"</p>";
					body+="</div>";
				} else {
					body+="Error finding "+req.params.id;
				}
			}
			parser("fullwidth.html",{"%%title%%":req.params.id,"%%content%%":body,"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/"},function(err, data){
				res.send(data);
			});
		});
	});
	router.post("/users/:id",function(req, res){
		var body="";
		database.user.find({username:req.params.id}).populate("friends").exec(function(err, data){
			if(err){
				body+="Error finding "+req.params.id;
			} else {
				if(data.length>=1){
					console.log(data);
					if(req.session.user){
						console.log(data[0].friends);
						var filter = data[0].friends.filter(function(match){return match.username==req.session.user.username;});
						console.log(filter);
						if(filter.length<1){
							body+="You have requested "+req.params.id+"'s friendship. c:";
						} else if (req.session.user.username==req.params.id){
							body+="You must have low self esteem to friend yourself. You should try taking a walk in the park, a nice long shower, or leaving the house in general.";
						} else {
							body+="You already friended this person!";
						}
					} else {
						res.status(403);
						res.redirect("/login/");
						return false;
					}
				} else {
					body+="Error finding "+req.params.id;
				}
			}
			parser("fullwidth.html",{"%%title%%":req.params.id,"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":body},function(err, data){
				res.send(data);
			});
		});
	});
	router.get("/users/",function(req, res){
		database.user.find().populate("friends").exec(function(err, data){
			console.log(data);
		});
		res.send("Sent ;D");
	});

	return router;
};

function printValues(obj, block, recursive){
	var str="";
	for(var i=0;i<block.length;i++){
		var val=block[i];
		var properties=val.split(".");
		if(properties.length<2){
				var value=(typeof obj[val]=="object" && recursive)?printArrayValues(obj[val],block):obj[val];
				//console.log((typeof obj[val]=="object") + ": "+val);
				str+="<div style='margin-left:20px;'><h2>"+val+"</h2><h5>"+ value +"</h5></div>";
		} else {
			console.log("Root");
			var _obj=obj;
			for(var x=0;x<properties.length;x++){
				_obj=_obj[properties[x]];
				console.log(properties[x]);
				console.log(_obj);
			}
			var value=(typeof _obj=="object" && recursive)?printArrayValues(_obj,block):_obj;
			//console.log((typeof obj[val]=="object") + ": "+val);
			str+="<div style='margin-left:20px;'><h2>"+val+"</h2><h5>"+ value +"</h5></div>";
		}	
	}
	return str;
}

function printArrayValues(array, block){
	if(array && typeof array == "object"){
		if(!array.length){
			return array;
		} else {
			var str="";
			for(var i=0;i<array.length;i++){
				str+=printValues(array[i],block, true);
			}
			return str;
		}
	}
}
function encrypt(text,pass){
	var cypher=crypto.createHash("sha256");
	var crypted=cypher.update(text).digest("hex");
	return crypted;
}