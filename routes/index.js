//安全模塊
var crypto = require('crypto'),
		fs = require('fs');

//用戶model
var User = require('../models/user.js');
var Book = require('../models/book.js');
module.exports = function(app){

	//主頁 顯示 最新上傳的書籍  和一個 input 搜索
	app.get('/',function(req,res){
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 返回的參數分別是  book 數組  每頁顯示的書本數  總共的書本數
		//参数 用户名 书名 页数 回调
		Book.getBooksByBookName(null,null,page,function(err,books,num,total){
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

  app.get('/user/:name',checkLogin);
  app.get('/user/:name',function(req,res){
  	var userName = req.params.name;
  	var curName = req.session.user.name;
  	if(userName == curName){
  		//访问 个人主頁
  		var page = req.query.p ? parseInt(req.query.p) :1;
  		Book.getBooksByBookName(curName,null,page,function(err,books,num,total){
  			res.render('person',{
  				title:'个人中心',
  				userName:userName,
  				books:books,
  				user:req.session.user,
  				page:page,
					total:total,
					isFirstPage : (page-1) == 0,
				  isLastPage : ((page-1)*num+books.length) == total,
					success : req.flash('success').toString(),
					error : req.flash('error').toString()
  			});
  		});
  	}else{
  		var page = req.query.p ? parseInt(req.query.p) :1;
  		Book.getBooksByBookName(userName,null,page,function(err,books,num,total){
  			res.render('user',{
  				title:'个人中心',
  				userName:userName,
  				books:books,
  				user:req.session.user,
  				page:page,
					total:total,
					isFirstPage : (page-1) == 0,
				  isLastPage : ((page-1)*num+books.length) == total,
					success : req.flash('success').toString(),
					error : req.flash('error').toString()
  			});
  		});
  	}
  });

	app.get('/book/:bookid',checkLogin);
	app.get('/book/:bookid',function(req,res){
		var bookid = req.params.bookid;
		Book.getBookById(bookid,function(err,book){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			console.log(book);
			res.render('book',{
				title:'書本詳情',
				book:book,
				user:req.session.user,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});

	app.get('/search',function(req,res){
		var bookname = req.query.search;
		var page = req.query.p? parseInt(req.query.p):1;
		Book.getBooksByBookName(null,bookname,page,function(err,books,num,total){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('search',{
				title:'搜索結果',
				books:books,
				user:req.session.user,
				page:page,
				total:total,
				isFirstPage : (page-1) == 0,
			  isLastPage : ((page-1)*num+books.length) == total,
				success : req.flash('success').toString(),
				error : req.flash('error').toString()
			});
		});
	});


	app.get('/user/edit/:bookid',checkLogin);
	app.get('/user/edit/:bookid',function(req,res){
		var bookid = req.params.bookid;
		Book.getBookById(bookid,function(err,book){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			res.render('edit',{
				title:'編輯',
				book:book,
				user:req.session.user,
				success:req.flash('success').toString(),
				error:req.flash('error').toString()
			});
		});
	});

	app.post('/user/edit/:bookid',checkLogin);
	app.post('/user/edit/:bookid',function(req,res){
		var bookid = req.body.bookid;
		var url = encodeURI('/user/'+req.body.bookusername);
		var book = {
			bookuser:req.body.bookuser,
			bookusername : req.body.bookusername,
			bookname:req.body.bookname,
			bookprice:req.body.bookprice,
			usetime:req.body.usetime,
			usersay:req.body.usersay
		}
		Book.update(bookid,book,function(err){
			if(err){
				req.flash('error',err);
				return res.direct('/edit/'+bookid);
			}
			res.redirect(url);
		});
	});

	app.get('/user/delete/:bookid',checkLogin);
	app.get('/user/delete/:bookid',function(req,res){
		var bookid = req.params.bookid;

		Book.delete(bookid,function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			req.flash('success','刪除成功了噢');
			res.redirect('back');
		});
	});

	app.get('/user/sold/:bookid',checkLogin);
	app.get('/user/sold/:bookid',function(req,res){
		var bookid = req.params.bookid;
		Book.sold(bookid,function(err){
			if(err){
				req.flash('error',err);
				res.redirect('back');
			}
			req.flash('success','恭喜你賣掉啦自己的書')	;
			res.redirect('back');
		});
	});


	//顯示被賣掉的書
	app.get('/sold/:username',checkLogin);
	app.get('/sold/:username',function(req,res){
		var curname = req.session.user.name;
		var username = req.params.username;
		console.log(curname);
		console.log(username);
		var page = req.query.p ? parseInt(req.query.p) : 1;
		Book.getBooksByBookName(username,null,page,function(err,books,num,total){
			if(err){
				req.flash('error',err);
				return res.redirect('back');
			}
			if(curname == username){
				res.render('sold',{
					title:'我已經賣掉的書',
					books:books,
					user:req.session.user,
					page:page,
					total:total,
					isFirstPage : (page-1) == 0,
				  isLastPage : ((page-1)*num+books.length) == total,
					success : req.flash('success').toString(),
					error : req.flash('error').toString()
				});
			}else{
				req.flash('error','抱歉你沒有權限訪問');
				res.redirect('back');
			}
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
