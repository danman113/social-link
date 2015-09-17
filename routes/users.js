var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser=require("../lib/viewParser.js");
var mongoose = require("mongoose");
module.exports=function(database,settings){
	router.get("/users/",function(req, res){
		database.user.find().populate("friends").exec(function(err, data){
			console.log(data);
		});
		res.send("Sent ;D");
	});
	router.delete("/users/",function(req, res){
		var json={"success":0};
		if(req.session.user){
			console.log(req.body);
			if (req.body.id){
				database.user.find({username:req.session.user.username},function(err, data){
					if (err){
						res.send(json);
						return false;
					}
					if(data[0].request.length>parseInt(req.body.id,10)){
						console.log(data[0].request[parseInt(req.body.id,10)]);
						data[0].request.splice(parseInt(req.body.id,10),1);
						database.user.update({_id:req.session.user.id},{request:data[0].request},function(){
							json.success=1;
							res.send(json);
						});
					} else{
						res.send(json);
					}
				});
			} else {
				res.send(json);
			}
		} else {
			res.send(json);
		}
		return false;
	});
	router.post("/users/",function(req, res){
		var json={"success":0};
		if(req.session.user){
			console.log(req.body);
			if (req.body.id){
				database.user.find({username:req.session.user.username},function(err, data){
					if (err || data.length<=0){
						res.send(json);
						return false;
					}
					if(data[0].request.length>parseInt(req.body.id,10)){
						console.log(data[0].request[parseInt(req.body.id,10)]);
						var you=new mongoose.Types.ObjectId(req.session.user.id);
						var friend = new mongoose.Types.ObjectId(data[0].request[parseInt(req.body.id,10)].toString());
						database.user.update({_id:data[0].request[parseInt(req.body.id,10)].toString()},{$push:{friends:you}},{safe: true, upsert: true, new : true},function(){
							console.log("Added you to their friendslist");
						});
						data[0].request.splice(parseInt(req.body.id,10),1);
						database.user.update({_id:req.session.user.id},{$push:{friends:friend},request:data[0].request},{safe: true, upsert: true, new : true},function(){
							console.log("Added them to your friendslist");
						});
						json.success=1;
						res.send(json);
					} else{
						res.send(json);
					}
				});
			} else {
				res.send(json);
			}
		} else {
			res.send(json);
		}
		return false;
	});
	router.get("/users/:id",function(req, res){
		var body="";
		database.user.find({username:req.params.id}).populate("friends").exec(function(err, data){
			if(err){
				body+="Error finding "+req.params.id;
			} else {
				if(data.length>=1){
					if(req.session.user){
						var filter = data[0].friends.filter(function(match){return match.username==req.session.user.username;});
						console.log(filter);
						var requestSent=false;
						for(var x=0;x<data[0].request.length;x++){
							if(data[0].request[x].toString()==req.session.user.id)
								requestSent=true;
						}
						if(req.session.user.username != req.params.id && filter.length<=0 && !requestSent)
							body+="<form method='POST'><button class='btn btn-primary'>Add Friend</button></form>";
						else if (filter.length>0)
							body+="<h3>Friend</h3>";
						else if (requestSent){
							body+="<h3>Request Sent</h3>";
						}
					}
					console.log(data);
					var genders=["Male", "Female", "Transgendered", "Otherkin"];
					body+="<h1>"+data[0].username+"</h1>";
					body+="<h2>"+data[0].about.firstName+" "+data[0].about.lastName+"</h2><a href='/users/"+data[0].username+"/friends'>Friends</a>";
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
						var filter = data[0].friends.filter(function(match){return match.username==req.session.user.username;});
						if(filter.length<1){
							var friendrequest=new mongoose.Types.ObjectId(req.session.user.id);
							var requestSent=false;
							for(var x=0;x<data[0].request.length;x++){
								if(data[0].request[x].toString()==req.session.user.id){
									console.log(data[0].request[x].toString());
									console.log(req.session.user.id);
									requestSent=true;
								}
							}
							data[0].request.push(friendrequest);
							if(requestSent){
								body+="You already requested "+req.params.id+"'s friendship. :c";
							} else {
								body+="You have requested "+req.params.id+"'s friendship. c:";
								database.user.update({username:req.params.id},{request:data[0].request},function(){

								});
							}
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

	router.get("/users/:id/friends",function(req, res){
		if(req.session.user){
			var body="";
			database.user.find({username:req.params.id}).populate("friends").exec(function(err, data){
				if(err){
					body+="Error finding "+req.params.id;
				} else {
					if(data.length>=1){
						console.log(data);
						body+="<h1>"+data[0].username+"'s friends</h1><div class='row'>";
						for(var i=0;i<data[0].friends.length;i++){
							body+="<div class='col-md-3 col-sm-6'><h4><a href='/users/"+data[0].friends[i].username+"''>"+data[0].friends[i].username+"</h4></a></div>";
						}
						body+="</div>";
					} else {
						body+="Error finding "+req.params.id;
					}
				}
				parser("fullwidth.html",{"%%title%%":req.params.id,"%%content%%":body,"%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/"},function(err, data){
					res.send(data);
				});
			});
		} else {
			res.status(403);
			res.redirect("/login/");
			return false;
		}
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