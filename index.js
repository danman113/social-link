var express=require("express");
var app=express();
var config=require("./lib/config.js")();
var database=require("./lib/database.js")(config);
var routes=require("./lib/router.js")(app,database,config);

