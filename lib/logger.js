var fs=require("fs");
var logFile="";
exports.log=function(request, settings){
	var addToList=function(req){
		var pathname=req._parsedUrl.pathname.substring(1,req._parsedUrl.pathname.length);
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var date=new Date();
		logFile+=date.getMonth()+"-"+date.getDay()+"-"+date.getFullYear()+ " "+date.getHours()+":"+date.getMinutes()+" "+ip+" "+req.method+"s "+pathname+""+"\n";
	};
	if(settings.log!="false" || settings.log!="no"){
		addToList(request);
	}
};
exports.save=function(settings){
	fs.appendFile(settings.logFile,logFile,{encoding:"utf8"},function(err, data){
		if(err){
			console.log("Error writing to logfile");
			console.log(err);
		}
	});
	logFile="";
};