var fs=require("fs");
var body=require("body-parser");
var parser=require("../lib/viewParser.js");
module.exports=function(app, database, settings){
	var http=require("http").Server(app);
	app.use(body.json());
	app.use(body.urlencoded({ extended: true }));
	fs.readdir("./routes",function(err, files){
		if(!err){
			if(files.length <=0){
				console.log("No routes found");
			} else {
				for(var i=0;i<files.length;i++){
					var filename = files[i];
					var fileArray = filename.split(".");
					var filetype= fileArray[fileArray.length-1];
					if(filetype == "js"){
						var route= require("../routes/"+filename)(database,settings);
						try{
							app.use("/",route);
							console.log("Used route "+filename);
						} catch(e){
							console.log("Route error: ");
							console.log(e);
						}
					} else {
						console.log("Non .js file found in routes directory. Reccomend removing file to keep application clean.");
					}
				}
			}
		} else {
			console.log("Error encountered reading routes folder. Error: ");
			console.log(err);
		}
	});
	fs.readFile("./views/"+settings.custom404,function(err,data){
		var custom404=false;
		if(err){
			console.log("Custom 404 file "+settings.custom404+" not found!");
		} else {
			custom404=true;
		}
		app.use(function(req, res, next){
			res.status(404);
			var pathname=req._parsedUrl.pathname.substring(1,req._parsedUrl.pathname.length);
			if (req.accepts('html')) {
				if(custom404){
					parser("./"+settings.custom404,{"%%url%%":pathname},function(err,data){
						res.send(data);
					});	
				} else {
					res.send("<!-- custom 404 file not found -->404!");
				}
				
				return false;
			}
			if (req.accepts('json')) {
			    res.send({ error: 'Not found' });
				return;
			}

			res.type('txt').send('Not found');
		});
	});
	http.listen(parseInt(settings.port), function(){
		console.log("Server started on port "+settings.port);
	});
}