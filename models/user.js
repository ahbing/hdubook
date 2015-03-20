
//  操作用戶數據庫的模型
var mongodb = require('./db');
// user 十一個存放用戶信息的對象
function User(user){
	this.name = user.name;  //用戶名
	this.password = user.password;  //密碼
	this.grade = user.grade;  //  年級
	this.faculty = user.faculty // 學院/系別
}

module.exports = User;

User.prototype.save = function(callback){
	var data = new Data();
	//存儲各種時間格式  方便日後擴展
	var time = {
		data : data,
		year : data.getFullYear(),
		month : data.getFullYear() + '-' +(data.getMonth()+1),
		day : data.getFullYear() + '-' + (data.getMonth()+1) + '-' +data.getDay(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	};
	var user = {
		name :this.name,
		password : this.password,
		grade : this.grade,
		faculty : this.faculty,
		time : time

		//  用戶存儲擴展

	};

	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//將要儲存的信息 插入 users 集合
			collection.insert(user,{safe:true},function(err){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null);
			});
		});
	});
};
//根據用戶名查找用戶
User.get = function(name, callback){
	mongodb.open(function(err,db){
		if(err){
			mongodb.close();
			return callback(err);
		}
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			collection.findOne({name:name},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};






















