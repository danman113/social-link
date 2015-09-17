window.onload=feedLoad;

function feedLoad(){
	var adds=document.getElementsByClassName("add");
	var remove=document.getElementsByClassName("remove");
	for(var i=0;i<adds.length;i++){
		adds[i].onclick=function(){addUser(this);};
	}
	for(var i=0;i<remove.length;i++){
		remove[i].onclick=function(){removeRequest(this);};
	}
}

function addUser(elem){
	sendHTTP("POST","/users/",{id:elem.name},function(data){
		console.log(data);
		var json=JSON.parse(data);
		if(json.success){
			var name = elem.parentElement.children[2].innerHTML;
			removeRequestDom(elem);
			var id=(new Date).getTime();
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