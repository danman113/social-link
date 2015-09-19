//Make it so you can pass settings

module.exports=function(settings){
	var mongoose = require("mongoose");
	mongoose.connect("mongodb://localhost/"+settings.database);
	var db=mongoose.connection;
	db.on('error', function(){
		console.log("Error connecting to server");
		process.exit(1);
	});
	db.once('open', function (callback) {
		console.log("DB is established");
	});
	var userSchema=mongoose.Schema({
		username:String,
		password:String,
		friends:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
		posts:[{type:mongoose.Schema.Types.ObjectId,ref:'posts'}],
		powerlevel:Number,
		email:String,
		salt:Number,
		passwordReset:Boolean,
		messages:[{type:mongoose.Schema.Types.ObjectId,ref:'message'}],
		request:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
		about:{
			firstName:String,
			lastName:String,
			education:String,
			location:String,
			birthday:Date,
			gender:Number,
			website:String,
			politics:String,
			religion:String,
			relationship:Boolean,
			phone:Number,
			about:String,
			image:String
		},
		settings:{
			hidden:Boolean,
			creationIP:String,
			creationDate:Date
		}
	});

	var messageSchema=mongoose.Schema({
		subject:String,
		sender:mongoose.Schema.Types.ObjectId,
		recipients:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
		contents:[{from:{type:mongoose.Schema.Types.ObjectId,ref:'user'},message:String}]
	});
	var postSchema=mongoose.Schema({
		content:String,
		postDate:Date,
		owner:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
		likes:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}]
	});
	var exportObj={};
	exportObj.user=mongoose.model('user',userSchema);
	exportObj.message=mongoose.model('message',userSchema);
	exportObj.posts=mongoose.model('posts',postSchema);
	return exportObj;
};
