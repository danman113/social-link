window.onload=startFunc;

function startFunc(){
	var names=document.getElementsByName("remove");
	for(var i=0;i<names.length;i++){
		names[i].onclick=function(){removeUser(this);};
	}
}

function removeUser(elem){
	sendHTTP("DELETE","/admin/promote/"+elem.id,{},function(data){
		console.log(data);
		var json=JSON.parse(data);
		if(json.success)
			console.log(elem.parentElement.remove());
	});
}

