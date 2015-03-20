//安全模塊
var crypto = require('crypto'),
		fs = require('fs');

//用戶model
var User = require('../models/user.js');
var Book = require('../models/book.js');
module.exports = function(app){

	//主頁 顯示 最新上傳的書籍  和一個 input 搜索
	app.get('/',function(req,res){
		var page = req.body.p ? req.body.p : 1;
		// 返回的參數分別是  book 數組  每頁顯示的書本數  總共的書本數
		Book.getBooksByBookName(null,page,function(err,books,num,total){
			res.render('index',{
				title:'主頁',
				page:page,
				books:books,
				total:total,
				isFirstPage : (page-1) == 0,
				isLastPage : ((page-1)*num+books.length) == total,
				user:req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});
	//註冊頁面
	app.get('/reg',checkNotLogin);
	app.get('/reg',function(req,res){
		res.render('reg',{
			title:'註冊',
			user:req.session.user,
			// 顯示post 提交後的提示內容
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
	//提交註冊信息
	app.post('/reg',checkNotLogin);
	app.post('/reg',function(req,res){
		console.log(req.body);
		var name = req.body.name;
		var password = req.body.password;
		var re_password = req.body['re-password'];
		if(password !== re_password){
			req.flash('error','兩次輸入的密碼不一致 :-)');
			return res.redirect('/reg');
		}
		// 加密密碼
		var md5 = crypto.createHash('md5'),
				password = md5.update(req.body.password).digest('hex');
		var newUser = new User({
			name:req.body.name,
			password:password,  //加密過的密碼
			grade:req.body.grade,
			faculty:req.body.faculty
		});
		// 檢驗用戶名稱是否已經存在
		User.get(newUser.name,function(err,user){
			if(user){
				req.flash('error','用戶名已經存在 :-)');
				return res.redirect('/reg');
			}
			//save方法寫在原型上 通過實例調用
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('/reg');
				}
				//沒有錯誤 就將用戶信息寫入session
				req.session.user = user;
				req.flash('success','歡迎你 :-)');
				res.redirect('/');   //註冊成功返回主頁
			});
		});
	});
	//登錄頁面
	app.get('/login',checkNotLogin);
	app.get('/login',function(req,res){
		res.render('login',{
			title:'登錄',
			user:req.session.user,
			success : req.flash('success').toString(),
			error : req.flash('error').toString()
		});
	});
	//提交登錄
	app.post('/login',checkNotLogin);
	app.post('/login',function(req,res){
		//登錄檢測
		var md5 = crypto.createHash('md5');

		var name = req.body.name;
		var password = md5.update(req.body.password).digest('hex');

		User.get(name,function(err,user){
			if(err){
				req.flash('error',err);
				return res.redirect('/login');
			}
			if(!user){
				req.flash('error','抱歉，你輸入了一個還沒有註冊的名稱 :-)');
				return res.redirect('/login');
			}
			if(user.password !== password){
				req.flash('error','我們檢測到你應該書錯了密碼 :-)');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success','登錄成功,歡迎你 :-)');
			res.redirect('/');
		});
	});

	app.get('/logout',checkLogin);
	app.get('/logout',function(req,res){
		req.session.user = null;  //將session清空
		req.flash('success','登出成功,再見 :-)');
		res.redirect('/');
	});


	app.get('/upload',checkLogin);
	app.get('/upload',function(req,res){
		res.render('upload',{
			title:'上傳書籍',
			user:req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});

	app.post('/upload',checkLogin);
	app.post('/upload',function(req,res){
		var bookuser = req.session.user, // 用戶信息 與書本綁定包括作者名字、專業、年級
				bookname = req.body.bookname,
				bookprice = req.body.bookprice,
				usetime = req.body.usetime,
				usersay = req.body.usersay;

		var newBook = new Book(bookuser,bookname,bookprice,usetime,usersay);

		newBook.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/upload');
			}
			req.flash('success','恭喜恭喜，上傳成功了 :-)');
			res.redirect('/');  //暫時先連到主頁上去

		});

	});



	function checkLogin(req,res,next){
		if(!req.session.user){
			//不存在用戶信息
			req.flash('error','您還沒有登錄 :-)');
			res.redirect('/login');
		}
		next();
	}
	function checkNotLogin(req,res,next){
		if(req.session.user){
			//已經存在用戶信息
			req.flash('error','你已經登錄，不能執行當前操作 :-)');
			req.redirect('back'); //放回
		}
		next();
	};
};
