var fs=require("fs");
var settings={port:3000,extensions:"js css png jpg",custom404:"404.html"};
module.exports=function(optionalPath){
	var path=optionalPath?optionalPath:"./config.ini";
	try{
		var data=fs.readFileSync(path, {encoding:"utf8"});
	} catch(e){
		console.log("Error reading config.ini");
		console.log(e);
		return settings;
	}
	for(var option in settings){
		var reg=new RegExp(option+"=(.+)","g");
		var matches=reg.exec(data);
		if(matches!=null){
			settings[option]=matches[1];
			console.log("Set "+option+" to "+matches[1]);
		}
	}
	return settings;
}