window.onload = function(){
	checkReg();  //注册检测
	// checkEdit();  // 修改信息的检测
};

// reg
var nLength = /^\w{2,8}$/g; //  用户名长度控制在 2，8 之间
var nSpace = /\b\s+\b/g;  //  用户名空白格
var pLength = /^\w{6,}$/g  // 密码长度大于六位

function checkReg(){
	var regName = document.getElementById('reg-name');
	var regPsw = document.getElementById('reg-psw');
	var reRegPsw = document.getElementById('re-reg-psw');

	if(regName || regPsw || reRegPsw){
		regName.addEventListener('blur',function(){
				// 正则去前后空格
				if(this.value.match(nSpace)){
					//用户名中间有空格
					console.log('用户名不能包含空格,系统帮你去除了空格');
					var name = this.value.replace(nSpace,'');
					regName.focus();
					regName.value = name;
					return;
				}else if(!this.value.match(nLength)){
					//控制用户名长度
					console.log('用户名称控制在2-8个字符之间');
					regName.focus();
					return;
				}else{
					console.log('用户名格式正确，但不一定能用，因为可能已经有人注册了');
				}
		},false);

		regPsw.addEventListener('blur',function(){
			if(!this.value.match(pLength)){
				console.log('密码长度不能低于六位');
				regPsw.focus();
				return;
			}else{
				console.log('密码可用');
			}
		},false);

		reRegPsw.addEventListener('blur',function(){
			console.log(regPsw.value);
			console.log(reRegPsw.value);
			if(regPsw.value !== reRegPsw.value){
				console.log('两次输入密码不一样');
				regPsw.focus();
				return;
			}else{
				console.log('密码通过');
			}
		},false);
	}
}





