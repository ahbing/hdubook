var mongodb = require('./db');

function AdminBook(bookname,bookimg){
	this.bookname = bookname;
	this.bookimg = bookimg;
}

module.exports = AdminBook;

AdminBook.prototype.save = function(callback){
	var book = {
		bookname : this.bookname,
		bookimg : this.bookimg
	};

	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('adminbook',function(err,collection){
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