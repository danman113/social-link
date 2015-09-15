var fs=require("fs");
var logFile="";
exports.log=function(request, settings){
	if(settings.log!="false" || settings.log!="no"){
		var pathname=request._parsedUrl.pathname.substring(1,request._parsedUrl.pathname.length);
		var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
		var date=new Date();
		logFile+=date.getMonth()+"-"+date.getDay()+"-"+date.getFullYear()+ " "+date.getHours()+":"+date.getMinutes()+" "+ip+" "+request.method+"s "+pathname+""+"\n";
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