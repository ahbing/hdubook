var mongodb = require('./db');

function Book(bookuser,bookname,bookprice,usetime,usersay){
	this.bookuser = bookuser;
	this.bookname = bookname;
	this.bookprice =  bookprice;
	this.usetime = usetime;
	this.usersay = usersay;
}

module.exports = Book;

Book.prototype.save = function(callback){
	var date = new Date();
	//存儲各種時間格式  方便日後擴展
	var time = {
		date : date,
		year : date.getFullYear(),
		month : date.getFullYear() + '-' +(date.getMonth()+1),
		day : date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDay(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	var book = {
		bookuser : this.bookuser,
		bookname : this.bookname,
		bookprice : this.bookprice,
		usetime : this.usetime,
		usersay :this.usersay,
		time:time
	};

	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('books',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.insert(book,{safe:true},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

//書名參數爲空的時候 返回按時間順序排的所有的書
//如果有書名，就返回按時間排序的該書
//page 是當前顯示的頁數
Book.getBooksByBookName = function(bookname,page,callback){
	var num = 12;  //設置每頁顯示12本書
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('books',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if(bookname){
				query.bookname = bookname;
			}

			collection.count(query,function(err,total){
				if(err){
					mongodb.close();
					callback(err);
				}
				collection.find(query,{
					//跳過page之前的書本
					skip : (page - 1 ) * num,
					//每頁限制num本書
					limit : num
				}).sort({
					//  時間降序
					time:-1
				}).toArray(function(err,books){
					mongodb.close();
					if(err){
						return callback(err);
					}
					callback(null,books,num,total);
				});
			});
		});
	});
};



















