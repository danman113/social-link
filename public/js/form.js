function sendHTTP(method,url,postdata,callback){
	var httpRequest;
	if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
		httpRequest = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // IE 6 and older
		httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
	}
	httpRequest.onreadystatechange = function(){
		if(httpRequest.readyState === 4){
			if(httpRequest.status === 200){
				callback(httpRequest.responseText);
			} else {
				console.log("Error "+httpRequest.status);	
			}
			
		}
	};
	var post=method.toLowerCase()=="get"?null:JSON.stringify(postdata);
	httpRequest.open(method, url);
	httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	httpRequest.send(post);
}

function getInfo(){
	var elements=document.getElementById("form").children;
	var obj={};
	for(var i=0;i<elements.length;i++){
		if(elements[i].name){
			obj[elements[i].name]=elements[i].type=="checkbox" || elements[i].type=="radio"?elements[i].checked:elements[i].value;
		}
	}
	return obj;
}