"use strict";

var shared = require('./redis/RedisService.js');

module.exports = {
		'get' : function(key, cb){
			shared.get(key, cb);
		},'put' : function(key, value, cb, expireTime){
			shared.put(key, value, cb, expireTime);
		},'has' : function(key, cb){
			shared.get(key,cb);
		},'del' :  function(key, cb){
			shared.del(key,cb);
		},'update' : function(key,value, cb){
			shared.update(key,value, cb);
		},'mput' : function(baseKey, objectKey, objectValue, cb ){
			shared.mput(baseKey, objectKey, objectValue,cb);
		},'mget' : function(baseKey, objectKey,  cb ){
			shared.mget(baseKey, objectKey, cb);
		}
};
