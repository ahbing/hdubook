var mongodb = require('./db');
//  mongodb 的id
var ObjectID = require('mongodb').ObjectID;
function Book(bookuser,bookname,bookprice,usetime,usersay){
	this.bookuser = bookuser;
	this.bookusername = bookuser.name;  //用戶名字 單獨拿出來
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
		day : date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	var book = {
		bookuser : this.bookuser,
		bookusername :this.bookusername,
		bookname : this.bookname,
		bookprice : this.bookprice,
		usetime : this.usetime,
		usersay :this.usersay,
		time:time,
		sold:0  // 0 表示正在賣
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
Book.getBooksByBookName = function(username,bookname,page,callback){
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

			if(bookname && !username){
				query.bookname = bookname;
			}
			if(username && !bookname){

				query.bookusername = username;
			}
			if( username && bookname){
				query.bookname = bookname;
				query.bookusername = username;
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

Book.getBookById = function(bookId,callback){
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('books',function(err,collection){
			if(err){
				mongodb.close();
				callback(err);
			}
			collection.findOne({_id:new ObjectID(bookId)},function(err,book){
				mongodb.close();
				if(err){
					callback(err);
				}
				callback(null,book);
			});
		});
	});
};

//參數book的屬性的對象
Book.update = function(bookId,book,callback){
		var date = new Date();
	//存儲各種時間格式  方便日後擴展
	var updatetime = {
		date : date,
		year : date.getFullYear(),
		month : date.getFullYear() + '-' +(date.getMonth()+1),
		day : date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
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
			collection.update({_id:new ObjectID(bookId)},{$set:{
				bookuser:book.bookuser,
				bookusername:book.bookusername,
				bookname:book.bookname,
				bookprice:book.bookprice,
				usetime:book.usetime,
				usersay:book.usersay,
				updatetime:updatetime  //如果沒有這個選項就創建updatetime
			}},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};

Book.delete = function(bookid,callback){
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
			collection.remove({_id: new ObjectID(bookid)},1,function(err){
				mongodb.close();
				if(err){
					callback(err);
				}
				callback(null);
			});
		});
	});
};

Book.sold = function(bookid,callback){
	var date = new Date();
	var soldtime = {
		date : date,
		year : date.getFullYear(),
		month : date.getFullYear() + '-' +(date.getMonth()+1),
		day : date.getFullYear() + '-' + (date.getMonth()+1) + '-' +date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
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
			collection.update({_id:new ObjectID(bookid)},{$set:{
				//將狀態改成被賣掉
				sold:1,
				//存儲被賣掉的時間
				soldtime:soldtime
			}},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};


















