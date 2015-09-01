var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var parser=require("../lib/viewParser.js");
module.exports=function(database,settings){
	router.get("/users/:id",function(req, res){
		database.user.find({username:req.params.id}).populate("friends").exec(function(err, data){
			if(err){
				res.send("Error finding "+req.params.id);
			} else {
				if(data.length>=1){
					res.send("Found "+req.params.id+"<br/>"+printArrayValues(data,["username", "password","friends"],true));
				} else {
					res.send("Error finding "+req.params.id);
				}
			}
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
	for(var val in obj){
		if(block.indexOf(val)>=0){
			var value=typeof obj[val]=="object" && recursive?printArrayValues(obj[val],block):obj[val];
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