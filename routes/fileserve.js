var express = require('express');
var fs= require("fs");
var router = express.Router();
var parser=require("../lib/viewParser.js");
module.exports=function(database,settings){
	var folders=settings.fileserverFolders.split(",");
		for(var i=folders.length-1;i>=0;i--){
			if(folders[i].trim()=="")
				folders.splice(i,1);
			else {
				folders[i]=folders[i].trim();
				if(folders[i].substr(0,1) != "/" || folders[i].substr(0,1) != "\\"){
					folders[i]="/"+folders[i];
				}
				if(folders[i].substr(folders[i].length-1,folders[i].length) != "/" || folders[i].substr(length-1,folders[i].length)!="\\"){
					folders[i]=folders[i]+"/";
				}
			}
		}
		console.log("Folders used as filedirectories: ");
		for (var i = 0; i<folders.length; i++) {
			router.get(folders[i],filesystem);
			console.log(folders[i]);
			router.get(folders[i]+"*",filesystem);
		};
	return router;
};


function filesystem(req, res, next){
	var pathname=req._parsedUrl.pathname.substring(1,req._parsedUrl.pathname.length);
	console.log(pathname);
	fs.stat("./"+pathname,function(err, stats){
		if(!err){
			if(stats.isDirectory()){
				parser("../"+pathname+"/index.html",{},function(err, data){
					if(!err){
						res.send(data);
					} else {
						next();
					}
				});
			} else {
				var split=pathname.split(".");
				if(split[split.length-1]=="html"){
					parser("../"+pathname,{},function(err, data){
						if(!err){
							res.send(data);
						} else {
							next();
						}
					});	
				} else {
					console.log("Sending image");
					var directory=__dirname.split("\\");
					directory.pop();
					var path=directory.join("\\");
					console.log(path);
					res.sendFile(path+"\\"+pathname);
				}
			}
		} else {
			next();
		}
	});
	
}