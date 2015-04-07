
//  操作用戶數據庫的模型
var mongodb = require('./db');
// user 十一個存放用戶信息的對象
function User(user){
	this.name = user.name;  //用戶名
	this.sex = user.sex;   //性别
	this.password = user.password;  //密碼
	this.grade = user.grade;  //  年級
	this.faculty = user.faculty; // 學院/系別
	this.header = user.header;  //頭像
	this.bg = user.bg;
	this.motto = user.motto;   //座右銘
}

module.exports = User;

User.prototype.save = function(callback){
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
	var user = {
		name :this.name,
		password : this.password,
		sex : this.sex,
		grade : this.grade,
		faculty : this.faculty,
		time : time,
		header : this.header,
		bg : this.bg,
		motto : this.motto
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

// 根據用戶姓名作出響應的修改
User.getUserByName = function(name,callback){
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
			collection.findOne({name : name},function(err,user){
				mongodb.close();
				if(err){
					return callback(err);
				}
				callback(null,user);
			});
		});
	});
};


User.updateName = function(username,name,callback){

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
		//如果是編輯用戶名  則也要去更新books的集合里的用戶名
			collection.findOne({name:name},function(err,user){
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(user){
					mongodb.close();
					return callback(null,user);
				}

				//如果修改的用戶名不存在
				collection.update({name:username},{$set:{name:name}},function(err){
					if(err){
						mongodb.close();
						return callback(err);
					}
					//  如果更名成功 ,將books 集合的 bookusername  也改過來
					db.collection('books',function(err,collection){
						if(err){
							mongodb.close();
							return callback(err);
						}
						collection.update({bookusername:username},{$set:{bookusername:name}},function(err){
							mongodb.close();
							if(err){
								return callback(err);
							}
							 //  books 更新成功
							callback(null);
						});
					});
				});
			});
		});
	});
};

User.update= function(username,faculty,grade,motto,callback){

	var query = {};
	var userquery = {};

	if(faculty){
		query.faculty = faculty;
		userquery.bookuserfaculty = faculty;
	}
	if(grade){
		query.grade = grade;
		userquery.bookuserfaculty = faculty;

	}
	if(motto){
		query.motto = motto;
		userquery.bookusermotto = motto;

	}

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
			collection.update({name:username},{$set:query},function(err){

				if(err){
					mongodb.close();
					return callback(err);
				}
				db.collection('books',function(err,collection){
					if(err){
						mongodb.close();
						return callback(err);
					}
					collection.update({bookusername:username},{$set:userquery},function(err){
						mongodb.close();
						if(err){
							return callback(err);
						}
						callback(null);
					});
				});
			});
		});
	});
};

User.updateHeader = function(username,header,callback){
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
			collection.update({name:username},{$set:{
				header:header
			}},function(err){
				if(err){
					mongodb.close();
					return callback(err);
				}
				db.collection('books',function(err,collection){
					if(err){
						mongodb.close();
						return callback(err);
					}
					collection.update({bookusername:username},{$set:{bookuserheader:header}},function(err){
						mongodb.close();
						if(err){
							return callback(err);
						}
						callback(null);
					});
				});
			});
		});
	});
};

// 更新背景
User.updateBg = function(username,bg,callback){
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
			collection.update({name:username},{$set:{
				bg:bg
			}},function(err){
				if(err){
					mongodb.close();
					return callback(err);
				}
				db.collection('books',function(err,collection){
					if(err){
						mongodb.close();
						return callback(err);
					}
					collection.update({bookusername:username},{$set:{bookuserbg:bg}},function(err){
						mongodb.close();
						if(err){
							return callback(err);
						}
						callback(null);
					});
				});
			});
		});
	});
};


User.updatepassword = function(username,oldpassword,newpassword,callback){
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
			//找到这个人  且 密码正确
			collection.findOne({name:username,password:oldpassword},function(err,user){
				if(err){
					mongodb.close();
					return callback(err);
				}
				if(!user){
					mongodb.close();
					return callback('密码输入错误');
				}
				collection.update({
					name:username
				},{
					$set:{password : newpassword}
				},function(err){
					mongodb.close();
					if(err){
						return callback(err);
					}
				});
				callback(null,user);
			});
		});
	});
};




















