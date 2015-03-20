//安全模塊
var crypto = require('crypto'),
		fs = require('fs');

//用戶model
var User = require('../models/user.js');


module.exports = function(app){

	//主頁 顯示 最新上傳的書籍  和一個 input 搜索
	app.get('/',function(req,res){
		res.render('index',{
			title:'主頁',
		});
	});
	//註冊頁面
	app.get('/reg',checkNotLogin);
	app.get('/reg',function(req,res){
		res.render('reg',{
			title:'註冊'
		});
	});
	//提交註冊信息
	app.post('/reg',checkNotLogin);
	app.post('/reg',function(req,res){

	});
	//登錄頁面
	//app.get('/login',checkNotLogin);
	app.get('/login',function(req,res){
		res.render('login',{
			title:'登錄'
		});
	});
	//提交登錄
	//app.post('/login',checkNotLogin);
	app.post('/login',function(req,res){
		//登錄檢測
	});

	//app.get('logout',checkLogin);
	app.get('/logout',function(req,res){
		req.session.user = null;  //將session清空
		//req.flash('sussecc','登出成功')；
		res.redirect('/');
	});




	function checkLogin(req,res,next){
		if(!req.session.user){
			//不存在用戶信息
			req.flash('error','您還沒有登錄');
			res.redirect('/login');
		}
		next();
	}
	function checkNotLogin(req,res,next){
		if(req.session.user){
			//已經存在用戶信息
			req.flsah('error','你已經登錄，不能執行當前操作');
			req.redirect('back'); //放回
		}
		next();
	};
};
