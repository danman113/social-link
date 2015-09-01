//Make it so you can pass settings
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/sociallink");
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
	email:String,
	salt:Number,
	messages:[{type:mongoose.Schema.Types.ObjectId,ref:'message'}],
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
		hidden:Boolean
	}
});

var messageSchema=mongoose.Schema({
	subject:String,
	sender:mongoose.Schema.Types.ObjectId,
	recipients:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
	contents:[{from:{type:mongoose.Schema.Types.ObjectId,ref:'user'},message:String}]
});

exports.user=mongoose.model('user',userSchema);
exports.message=mongoose.model('message',userSchema);