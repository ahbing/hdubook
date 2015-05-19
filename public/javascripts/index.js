// admin

window.onload = function(){
	// document.addEventListener('keyup',ajaxUpload,false);
	ajaxUpload();
};


var xmlHttp;
var upBookname;
var targetElem;  //当前选中的值
var showMore = false; // 默认不显示全部
function ajaxFunction(){
	try{
		xmlHttp = new XMLHttpRequest();
	}catch(e){
		try{
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		}catch(e){
			try{
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			}catch(e){
				alert('你的浏览器不支持ajax');
				return false;
			}
		}
	}
}


function ajaxUpload(){
	ajaxFunction();
	if(!upBookname){
		upBookname = document.getElementById('up-bookname');
	}
	var startStr = '';
	if(upBookname){
		upBookname.addEventListener('keydown',function(e){
			if(e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13){
				var oBox = document.getElementById('bookname-box');
		    if(!!oBox.childNodes){
		    	oBox.innerHTML ='';
		    }
				var ajaxUrl = '/ajax?bookname='+this.value;
				xmlHttp.onreadystatechange = processRequest;
				xmlHttp.open('GET',ajaxUrl,true);
				xmlHttp.send(null);
			}else if(e.keyCode == 38){
				//向上找
				startStr = upBookname.value;
				console.log("向上开始时的str"+startStr);
				xmlHttp.abort()
				var targetElem = document.getElementById('theTarget');
				if(targetElem){
					console.log(targetElem);
					prev(targetElem);
				}
			}else if(e.keyCode == 40){
				//向下找
				startStr = upBookname.value;
				console.log("向下开始时的str"+startStr);
				xmlHttp.abort()
				var targetElem = document.getElementById('theTarget');
				if(targetElem){
					console.log(targetElem);
					next(targetElem);
				}
			}else{
				//e.keyCode == 13
				//回车输入
				//当前选中的值
				var upBtn = document.getElementById('up-btn');
				//阻止表单回车默认submit行为
				upBtn.onclick = function(){
					return false;
				}
				var targetElem = document.getElementById('theTarget');
				if(targetElem.title && targetElem.title == 'more'){
					//查看更多
					upBookname.value = startStr;
					showMore = true;
					ajaxUpload();
				}else if(targetElem.firstChild.nodeValue){
					enterTxt(targetElem.firstChild.nodeValue);
				}

			}
		},false);
	}
}

function processRequest(){
	if(xmlHttp.readyState == 4 && xmlHttp.status==200){
		var booknames = xmlHttp.responseText.split(',');
		if(booknames){
			showSelect(booknames);
		}
		xmlHttp.abort();  // 获取数据之后取消请求
	}
}

function showSelect(booknames){
	var oBox = document.getElementById('bookname-box');
	var oUl = document.createElement('ul');
	oUl.className = 'booknames';
	// 最后一个是空格
	var len;
	if(booknames.length-1 > 4){
		len = 4;
	}else{
		len = booknames.length-1;
	}
	for(var i = 0; i <len; i++){
		var oLi = document.createElement('li');
		oUl.appendChild(oLi);
		oLi.className = 'bookname';
		var txt = document.createTextNode(booknames[i]);
		oLi.appendChild(txt);
	}
	if(booknames.length-1 >4 && !showMore){
		var lastLi = document.createElement('li');
		lastLi.innerText = '查看更多';
		lastLi.className = 'bookname';
		lastLi.title = 'more';
		oUl.appendChild(lastLi);
	}
	oBox.appendChild(oUl);
	if(oUl.children[0]){
		var targetElem;  //当前选中的值
		targetElem = oUl.children[0];
		targetElem.style.background = 'red';
		targetElem.id = 'theTarget';
	}
}


function changeBg(targetElem){
	targetElem.style.background = '';
	targetElem.id = '';  //设置id
}

function enterTxt(txt){
	var booknameInput = document.getElementById('up-bookname');
	if(txt){
		booknameInput.value = txt;
		var oBox = document.getElementById('bookname-box');
		oBox.style.display = 'none';
	}
}

function next(targetElem){
	changeBg(targetElem);
	// 更新targetElem
	if(targetElem.nextElementSibling){
		targetElem = targetElem.nextElementSibling;
		console.log(targetElem.title);
	}else{
		targetElem = targetElem.parentNode.children[0];
	}
	targetElem.style.background ='red';
	targetElem.id = 'theTarget';
}

function prev(targetElem){
	changeBg(targetElem);
	if(targetElem.previousElementSibling){
		targetElem = targetElem.previousElementSibling;

	}else{
		targetElem = targetElem.parentNode.children[0];
	}
	targetElem.style.background ='red';
	targetElem.id ='theTarget';
}









