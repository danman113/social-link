var fs= require("fs");
function multiReplace(obj, replacer){
	if(Object.keys(obj).length === 0)
		return replacer;
	var query = Object.keys(obj).join("|");
	var regex= new RegExp(query,"gi");
	var hi=replacer.replace(regex, function (match){
		return obj[match]
	});
	return hi;
}

module.exports=function(pathname, replaceObj, callback){
	var hi=fs.readFile("./views/"+pathname, {encoding:"utf8"}, function(err, data){
		if(err){
			callback(err, data);
		} else {
			var html=multiReplace(replaceObj, data);
			callback(err, html);
		}
	});
}