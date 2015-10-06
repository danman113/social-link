window.onload=feedLoad;
var feedLength=10;
function feedLoad(){
	var adds=document.getElementsByClassName("add");
	var remove=document.getElementsByClassName("remove");
	for(var i=0;i<adds.length;i++){
		adds[i].onclick=function(){addUser(this);};
	}
	for(var i=0;i<remove.length;i++){
		remove[i].onclick=function(){removeRequest(this);};
	}
	getFeed(feedLength);
}

function addUser(elem){
	sendHTTP("POST","/users/",{id:elem.name},function(data){
		console.log(data);
		var json=JSON.parse(data);
		if(json.success){
			var name = elem.parentElement.children[2].innerHTML;
			removeRequestDom(elem);
			var id=(new Date()).getTime();
			var notification = '<div id="'+id+'" style="padding-bottom:10px;display:none;" class="alert alert-success" id="attempts" role="alert"><strong>Added '+name+' to friends list</strong></div>';
			$(".notifications").append(notification);
			$("#"+id).fadeIn(500);
			setTimeout(function(){$("#"+id).fadeOut(500);},4000);
			removeRequestDom(elem);
		}
	});
}

function removeRequest(elem){
	console.log(elem);
	sendHTTP("DELETE","/users/",{id:elem.name},function(data){
		console.log(data);
		var json=JSON.parse(data);
		if(json.success)
			removeRequestDom(elem);
	});
}

function removeRequestDom(elem){
	elem.parentElement.parentElement.parentElement.parentElement.remove();
	if(document.getElementsByName("request").length<=0){
		document.getElementsByClassName("request")[0].remove();
	}
}

function getFeed(limit){
	limit=limit?limit:10;
	sendHTTP("get","/posts/?limit="+limit,{},function(data){
		var json=JSON.parse(data);
		console.log(json);
		var feed=document.getElementById("feedContent");
		var text="";
		for(var i=0;i<json.length;i++){
			text+=formatPost(json[i]);
		}
		text+='<br/><button class="btn btn-primary" id="load">Load More</button>';
		feed.innerHTML=text;
		document.getElementById("load").onclick=function(){
			feedLength+=20;
			getFeed(feedLength);
		};
	});
}

function formatPost(post){
	var postDateString="";
	var formatDate = function (date){
		return (date.getMonth()+1)+"\\"+date.getDate()+"\\"+date.getFullYear().toString().substring(2,4);
	};
	if(post.postDate){
		var postDate=new Date(post.postDate);
		postDateString = formatDate(postDate);
	} else {
		postDateString="A long time ago...";
	}	
	return '<div class="media"> <div class="media-body"> <h4 class="media-heading"><a href="/users/'+post.owner.username+'"> '+post.owner.username+' </a> <small>'+postDateString+' <a href="/posts/'+post._id+'">#</a></small></h4>'+post.content+' </div> </div>';
}
