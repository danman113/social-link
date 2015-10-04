var express = require('express');
var router = express.Router();
var parser = require("../lib/viewParser.js");
var mongoose = require("mongoose");
module.exports=function(database,settings){
	router.get("/messages/new",function(req, res, next){
		if(req.session.user){
			var text='<form method="POST" action="/messages/" class="form-inline"> <input class="form-control" name="to" placeholder="To: "  value="'+(req.query.send?req.query.send:"")+'" type="text"/><br/><br/> <input class="form-control" name="subject" placeholder="Subject: " type="text"/><br/><br/> <textarea class="form-control" name="content" placeholder="content"></textarea><br/><br/> <input type="submit" class="btn btn-primary" /> </form>';
			parser("fullwidth.html",{"%%title%%":"Messages","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text},function(err, data){
				res.send(data);
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	router.get("/messages/",function(req, res, next){
		if(req.session.user){
			var text="<a class='btn btn-primary' href='/messages/new/'>New Message</a><br/>";
			database.user.find({_id:req.session.user.id}).populate({path:"messages.message"}).exec().then(function(data){
				console.log(data);
				console.log(data[0].messages);
				for(var i=0,count=data[0].messages.length;i<count;i++)
					text+=data[0].messages[i].message.sender+" <a href='/messages/view/"+data[0].messages[i].message._id+"'>"+data[0].messages[i].message.subject+"</a><br/>";
				console.log(Object.keys({viewed:false}).length);
				parser("fullwidth.html",{"%%title%%":"Messages","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text},function(err, data){
					res.send(data);
				});
			});
			
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});
	router.post("/messages",function(req, res, next){
		res.send(req.body);
		if(req.session.user){
			//parses to field to an array of recipient strings
			var to = req.body.to.split(/\s*[;,]\s*/);
			//gets sender info
			database.user.findOne({"_id":req.session.user.id}).populate("friends").exec(function(err, data){
				//scema for message. Notice it initializes with the user as the first recipient
				var messageSchema={
					subject:req.body.subject,
					sender:req.session.user.username,
					recipients:[new mongoose.Types.ObjectId(req.session.user.id)],
					contents:[{from:0,message:req.body.content,sendDate:new Date()}],
					lastUpdate:new Date()
				};
				//parses through recipient list to make sure they exist/are on friends list
				var toList=[];
				for(var i=0,count=data.friends.length;i<count;i++){
					if(to.indexOf(data.friends[i].username)>=0){
						toList.push({username:data.friends[i].username,index:i});
					}
				}
				for(var i=0;i<toList.length;i++){
					messageSchema.recipients.push(data.friends[toList[i].index]._id);
				}
				//creates message
				var message = new database.message(messageSchema);
				message.save();
				console.log(message);
				var messageID = new mongoose.Types.ObjectId(message._id);
				//pushes notification to users
				database.user.update(
									{_id:{$in:message.recipients}},
									{$push:{messages:{message:messageID,viewed:false}}},
									{safe: true, upsert: true, new : true, multi: true},
									function(err, data){

									}
				);
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}

	});
	router.get("/messages/view/:id",function(req, res, next){
		console.log("Route");
				console.log(req.originalUrl);
		if(req.session.user){
			database.message.findOne({_id:req.params.id,recipients:{$in:[req.session.user.id]}}).populate("recipients").exec(function(err, data){
				console.log(data);
				var text="";
				if(!data)
					text = "No Message with that ID found";
				else {
					text+="<h2>"+data.subject+"<h2>";
					text+="<h3>Original Sender: <a href='"+data.sender+"'>"+data.sender+"</a></h3>";
					text+="<h4>Recipients: "
					for(var i=0;i<data.recipients.length;i++)
						text+="<a href="+data.recipients[i].username+">"+data.recipients[i].username+"</a> ";
					text+="</h4>"
					for(var i=0;i<data.contents.length;i++){
						console.log(data.contents[i]);
						text+=formatMessage(data.contents[i],data.recipients);
					}
					text+='<br/><form method="POST" class="form-inline"> <textarea class="form-control" name="content" placeholder="content"></textarea><br/><br/> <input type="submit" class="btn btn-primary" /> </form>';
				}
				parser("fullwidth.html",{"%%title%%":"Messages","%%username%%":req.session.user?"/users/"+req.session.user.username:"/login/","%%content%%":text},function(err, data){
					res.send(data);
				});
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});

	router.post("/messages/view/:id", function(req, res, next){
		if(req.session.user){
			database.message.findOne({_id:req.params.id,recipients:{$in:[req.session.user.id]}}).exec(function(err, data){
				console.log(data);
				var text="";
				if(!data)
					text = "No Message with that ID found";
				else {
					var yourIndex=data.recipients.indexOf(req.session.user.id);
					console.log(yourIndex);
					database.message.update(
											{_id:req.params.id,recipients:{$in:[req.session.user.id]}},
											{$push:{contents:{message:req.body.content,from:yourIndex,sendDate:new Date()}}},
											{safe: true, upsert: true, new : true, multi: true},
											function(err, data){

											}
					);
				}
				console.log("Route");
				res.redirect(req.originalUrl);
			});
		} else {
			res.status(403);
			res.redirect("/login/");
		}
	});

	function formatMessage(message,recipients){
		var postDateString="";
		console.log(message.sendDate);
		if(message.sendDate){
			var postDate=new Date(message.sendDate);
			console.log(postDate.getMonth());
			postDateString = (postDate.getMonth()+1)+"\\"+postDate.getDate()+"\\"+postDate.getFullYear().toString().substr(2,2)+" "+(postDate.getHours()+1)+":"+((postDate.getUTCMinutes()+1)<10?+"0"+(postDate.getUTCMinutes()+1).toString():(postDate.getUTCMinutes()+1).toString());
		} else {
			postDateString = "A long time ago..."
		}	
		return '<div class="media"> <div class="media-body"> <h4 class="media-heading"><a href="/users/'+recipients[message.from].username+'"> '+recipients[message.from].username+' </a> <small>'+postDateString+'</small></h4>'+message.message+' </div> </div>';
	}

	return router;
};