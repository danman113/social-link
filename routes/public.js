var express=require("express");
var router=express.Router();
var fs=require("fs");
module.exports=function(database,settings){
	var approvedFiletypes=settings.extensions.split(" ");
	for(var i=0;i<approvedFiletypes.length;i++)
		approvedFiletypes[i].length<=0?approvedFiletypes.splice(i,1):false;
	

	router.get("/public/*.:id",function(req, res){
		if(approvedFiletypes.indexOf(req.params.id)>=0){
			var pathname=req._parsedUrl.pathname.substring(1,req._parsedUrl.pathname.length);
			getFile(pathname,req,res);	
		} else {
			res.sendStatus(403);
		}
	});
	router.get("/public/",function(req, res){
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		res.send(ip);
	});
	return router;
}

function getFile(pathname,req,res){
	var directory=__dirname.split("\\");
	directory.pop();
	var path=directory.join("\\");
	fs.readFile(path+"\\"+pathname,function(err,file){
		if(!err){
			res.sendFile(path+"/"+pathname);
		}else{
			res.sendStatus(404);
		}
	});
}