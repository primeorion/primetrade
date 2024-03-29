"use strict";

var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var moduleName = __filename;
var cache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao.js');
var logger = require('helper/Logger.js')(moduleName);
var utilService = new (require('service/util/UtilService'))();
var baseDao = require('dao/BaseDao');
var enums = require('config/constants/ApplicationEnum.js');

var userEntity = require("entity/user/User.js");
var roleEntity = require('entity/role/Role.js'); 
var roleTypeEntity = require('entity/role/RoleType.js'); 
var rolePrivilegeEntity = require('entity/role/RolePrivilege.js'); 
var roleTypePrivilegeEntity = require('entity/role/RoleTypePrivilege.js'); 
var privilegeEntity = require('entity/privilege/Privilege.js'); 

var RoleDao = function(){};

RoleDao.prototype.add =  function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	logger.debug("Role object", data);
	
	var queryData = {};
	queryData[roleEntity.columns.id] = data.id,
	queryData[roleEntity.columns.name] = data.name;
	queryData[roleEntity.columns.status] = data.status;
	queryData[roleEntity.columns.isDeleted] = data.isDeleted ? isDeleted : 0;
	queryData[roleEntity.columns.roleTypeId] = data.roleTypeId;
	queryData[roleEntity.columns.createdDate] = utilDao.getSystemDateTime(null);
	queryData[roleEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
	queryData[roleEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
	queryData[roleEntity.columns.editedBy] = utilService.getAuditUserId(data.user);	

	if (data.startDate) {
        queryData[roleEntity.columns.startDate] = data.startDate;
    }
    if (data.expireDate) {
        queryData[roleEntity.columns.expireDate] = data.expireDate;
    }

	var query = 'INSERT INTO '+roleEntity.tableName+' SET ?';

	logger.debug("Insert role Query"+query);
	firmConnection.query(query, [queryData], function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

RoleDao.prototype.getDetail = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	
	var isDeleted = data.isDeleted;
	var roleId = data.user.roleId;
	var roleTypeId = data.user.roleTypeId;
	logger.debug("role type id is"+roleTypeId);
	var privilegeQuery = squel.select()
		.field(rolePrivilegeEntity.columns.privilegeId,'privilegeId')
		.from(rolePrivilegeEntity.tableName)
		.where(
	        squel.expr()
	        .and(squelUtils.joinEql(rolePrivilegeEntity.columns.roleId,roleEntity.columns.id))
	        .and(squelUtils.eql(rolePrivilegeEntity.columns.isDeleted,0))
	    );


	var query = squel.select()
    .field(roleEntity.columns.id,'roleId')
    .field(roleEntity.columns.roleTypeId,'roleType')
    .field(roleEntity.columns.status,'status')
    .field(roleEntity.columns.startDate,'startDate')
    .field(roleEntity.columns.expireDate,'expireDate')
    .field(roleTypeEntity.columns.roleType,'roleTypeName')
    .field(roleEntity.columns.name,'roleName')
    .field(roleEntity.columns.isDeleted,'roleIsDeleted')
    .field(userEntity.usCreated.userLoginId,'roleCreatedBy')
    .field(userEntity.usEdited.userLoginId,'roleEditedBy')
    .field(roleEntity.columns.createdDate,'roleCreatedOn')
    .field(roleEntity.columns.editedDate,'roleEditedOn')
    .field(privilegeEntity.columns.id,'privilegeId')
    .field(" COALESCE("+rolePrivilegeEntity.columns.canAdd+",0)",'canAdd')
    .field(" COALESCE("+rolePrivilegeEntity.columns.canUpdate+",0)",'canUpdate')
    .field(" COALESCE("+rolePrivilegeEntity.columns.canDelete+",0)",'canDelete')
    .field(" COALESCE("+rolePrivilegeEntity.columns.canRead+",0)",'canRead')
    .field(roleTypePrivilegeEntity.columns.addDisabled,'addDisabled')
    .field(roleTypePrivilegeEntity.columns.updateDisabled,'updateDisabled')
    .field(roleTypePrivilegeEntity.columns.deleteDisabled,'deleteDisabled')
    .field(roleTypePrivilegeEntity.columns.readDisabled,'readDisabled')
    .field(" COALESCE("+rolePrivilegeEntity.columns.isDeleted+",0)",'privilegeIsDeleted')
    .field(privilegeEntity.columns.type,'privilegeType')
    .field(privilegeEntity.columns.code,'privilegeCode')
    .field(privilegeEntity.columns.name,'privilegeName')
    .field(privilegeEntity.columns.category,'privilegeCategory')
    .from(roleEntity.tableName)
    .join(rolePrivilegeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,rolePrivilegeEntity.columns.roleId))
                .and(squelUtils.joinEql(rolePrivilegeEntity.columns.isDeleted,0))
              )
    .join(privilegeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(privilegeEntity.columns.id,rolePrivilegeEntity.columns.privilegeId))
                .and(squelUtils.joinEql(privilegeEntity.columns.isDeleted,0))
              )
    .join(roleTypeEntity.tableName, null, 
    	squelUtils.joinEql(roleTypeEntity.columns.id,roleEntity.columns.roleTypeId)
              )
    .join(roleTypePrivilegeEntity.tableName, null,  squel.expr()
            .and(squelUtils.joinEql(roleTypeEntity.columns.id,roleTypePrivilegeEntity.columns.roleTypeId))
            .and(squelUtils.joinEql(privilegeEntity.columns.id,roleTypePrivilegeEntity.columns.privilegeId))
              )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,roleEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,roleEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(roleEntity.columns.id,data.id))
        			.and(squelUtils.eql(roleEntity.columns.isDeleted,0))
    );
    if(roleTypeId !== enums.roleType.FIRMADMIN){
    	query.where(
            squel.expr().and(squelUtils.eql(data.id,data.user.roleId))
        )
    }
    if(isDeleted !=undefined && typeof isDeletd === "string" && isDeleted.match('^(true|false|1|0)$')){
    	query.where(
            squel.expr().and(squelUtils.eql(rolePrivilegeEntity.columns.isDeleted,isDeleted))
        )
    }
    var tempQuery = squel.select()
    .field(roleEntity.columns.id,'roleId')
    .field(roleEntity.columns.roleTypeId,'roleType')
    .field(roleEntity.columns.status,'status')
    .field(roleEntity.columns.startDate,'startDate')
    .field(roleEntity.columns.expireDate,'expireDate')
    .field(roleTypeEntity.columns.roleType,'roleTypeName')
    .field(roleEntity.columns.name,'roleName')
    .field(roleEntity.columns.isDeleted,'roleIsDeleted')
    .field(userEntity.usCreated.userLoginId,'roleCreatedBy')
    .field(userEntity.usEdited.userLoginId,'roleEditedBy')
    .field(roleEntity.columns.createdDate,'roleCreatedOn')
    .field(roleEntity.columns.editedDate,'roleEditedOn')
    .field(privilegeEntity.columns.id,'privilegeId')
    .field('0','canAdd')
    .field('0','canUpdate')
    .field('0','canDelete')
    .field('0','canRead')
    .field(roleTypePrivilegeEntity.columns.addDisabled,'addDisabled')
    .field(roleTypePrivilegeEntity.columns.updateDisabled,'updateDisabled')
    .field(roleTypePrivilegeEntity.columns.deleteDisabled,'deleteDisabled')
    .field(roleTypePrivilegeEntity.columns.readDisabled,'readDisabled')
    .field(" COALESCE("+rolePrivilegeEntity.columns.isDeleted+",0)",'privilegeIsDeleted')
    .field(privilegeEntity.columns.type,'privilegeType')
    .field(privilegeEntity.columns.code,'privilegeCode')
    .field(privilegeEntity.columns.name,'privilegeName')
    .field(privilegeEntity.columns.category,'privilegeCategory')
    .from(roleEntity.tableName)
    .join(roleTypeEntity.tableName, null,
        squelUtils.joinEql(roleTypeEntity.columns.id,roleEntity.columns.roleTypeId)
      )
    .join(privilegeEntity.tableName, null,squel.expr()
        .and(squelUtils.joinEql("(("+privilegeEntity.columns.userLevel+")& "+roleTypeEntity.columns.bitValue+")",roleTypeEntity.columns.bitValue))
        .and(squelUtils.joinEql(privilegeEntity.columns.isDeleted,0))
      )
    .join(roleTypePrivilegeEntity.tableName, null,  squel.expr()
        .and(squelUtils.joinEql(roleTypeEntity.columns.id,roleTypePrivilegeEntity.columns.roleTypeId))
        .and(squelUtils.joinEql(privilegeEntity.columns.id,roleTypePrivilegeEntity.columns.privilegeId))
    )
    .left_join(rolePrivilegeEntity.tableName, null,squel.expr()
       .and(squelUtils.joinEql(roleEntity.columns.id,rolePrivilegeEntity.columns.roleId))
       .and(squelUtils.joinEql(rolePrivilegeEntity.columns.isDeleted,0))
      )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,roleEntity.columns.createdBy)
      )
	.left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,roleEntity.columns.editedBy)
      )
	.where(
        squel.expr().and(squelUtils.eql(roleEntity.columns.id,data.id))
		.and(squelUtils.notIn(privilegeEntity.columns.id,privilegeQuery))
		.and(squelUtils.eql(roleEntity.columns.isDeleted,0))
    );
    if(roleTypeId !== enums.roleType.FIRMADMIN){
    	tempQuery.where(
            squel.expr().and(squelUtils.eql(data.id,data.user.roleId))
        )
    }
    tempQuery.order(privilegeEntity.columns.id);
	tempQuery.order(privilegeEntity.columns.category);
    query.union(tempQuery);
    
    /*if(roleTypeId !== enums.roleType.FIRMADMIN && data.user.roleId !== data.id){
    	query.where(
            squel.expr().and(squelUtils.in(roleEntity.columns.id,data.user.roleId))
        )
	}*/
	query = query.toString();

	logger.debug("Select Role query", query);
	

	firmConnection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}

		return cb(null, data);
	});
};

RoleDao.prototype.get = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	
	var query = squel.select()
    .field(roleEntity.columns.id,'id')
    .field(roleEntity.columns.status,'status')
    .field(roleEntity.columns.name,'name')
    .field(roleEntity.columns.roleTypeId,'roleType')
    .field(roleEntity.columns.isDeleted,'isDeleted')
    .field(roleEntity.columns.createdDate,'createdDate')
    .field(roleEntity.columns.editedDate,'editedDate')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(roleEntity.tableName)
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,roleEntity.columns.createdBy)
      )
	.left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,roleEntity.columns.editedBy)
      )
	.where(squel.expr()
		.and(squel.expr()
		.or(squelUtils.eql(roleEntity.columns.id,data.id))
        .or(squelUtils.eql(roleEntity.columns.name,data.name)))
        .and(squelUtils.eql(roleEntity.columns.isDeleted,0))
    );
    query = query.toString();

	logger.debug("get Role query", query);
	firmConnection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}

		return cb(null, data);
	});
};

RoleDao.prototype.update = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	logger.debug("Role Object",  data);

	var queryData = {};
	queryData[roleEntity.columns.id] = data.id;
	queryData[roleEntity.columns.status] = data.status;
	queryData[roleEntity.columns.startDate] = data.startDate;
	queryData[roleEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
	queryData[roleEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
	if (data.expireDate) {
        queryData[roleEntity.columns.expireDate] = data.expireDate;
    }
	if(data.name){
		queryData[roleEntity.columns.name] = data.name;
	}
	var query = [];
	query.push(' UPDATE '+roleEntity.tableName);
	query.push(' SET ? WHERE '+roleEntity.columns.id+' = ? ');
	query = query.join(" ");

	logger.debug("Update role Query"+query);
	firmConnection.query(query, [queryData, data.id], function (err, updated) {
		if (err) {
			return cb(err);
		}
		return cb(null, updated);
	});
};

RoleDao.prototype.getRoleUser = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);

	var query = squel.select()
	.field("count("+userEntity.columns.id+")",userCount)
	.from(userEntity.tableName)
	.where(squel.expr()
		.and(squelUtils.eql(roleEntity.columns.roleId,data.id))
		);
	query = query.toString();

	logger.debug("Get role user Query "+query);
	firmConnection.query(query, function (err, users) {
		if (err) {
			return cb(err);
		}
		return cb(null, users[0].userCount);
	});
};

RoleDao.prototype.delete = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	
	var queryData = {};
	queryData[roleEntity.columns.id] = data.id;
	queryData[roleEntity.columns.isDeleted] = 1;
	queryData[roleEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
	queryData[roleEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

	var query = [];
	query.push(' UPDATE '+roleEntity.tableName);
	query.push(' SET ? where '+roleEntity.columns.id);
	query.push(' = ? AND '+roleEntity.columns.isDeleted+' = 0 ');
	query = query.join(" ");

	logger.debug("Delete role Query "+query);
	firmConnection.query(query, [queryData, data.id], function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};
RoleDao.prototype.inActiveUser = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	
	var query = [];
	query.push(' UPDATE '+userEntity.tableName);
	query.push(' SET '+userEntity.columns.status+' = 0 ');
	query.push(' where '+userEntity.columns.roleId+' = ? ');
	query.push(' AND '+userEntity.columns.isDeleted+' = 0 ');
	query = query.join(" ");

	logger.debug("In active user Query"+query);
	firmConnection.query(query, [data.id], function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
}; 

RoleDao.prototype.getList = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	var isDeleted = data.isDeleted;
	var roleId = data.user.roleId;
	var roleTypeId = data.user.roleTypeId;

	var query = squel.select()
	.field(roleEntity.columns.id,"id")
	.field(roleEntity.columns.name,"name")
	.field(roleEntity.columns.status,"status")
	.field(roleEntity.columns.startDate,"startDate")
	.field(roleEntity.columns.expireDate,"expireDate")
	.field(roleEntity.columns.isDeleted,"isDeleted")
	.field(roleEntity.columns.createdDate,"createdOn")
	.field(roleEntity.columns.editedDate,"editedOn")
	.field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
	.field(roleTypeEntity.columns.roleType,"roleType")
	.field("count("+userEntity.columns.id+")","numberOfUsers")
	.from(roleEntity.tableName)
    .left_join(roleTypeEntity.tableName, null, 
    	squelUtils.joinEql(roleTypeEntity.columns.id,roleEntity.columns.roleTypeId)
    )
    .left_join(userEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
                .and(squelUtils.joinEql(userEntity.columns.isDeleted,0))
              )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,roleEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,roleEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(roleEntity.columns.isDeleted,0))
    );
    if(roleTypeId !== enums.roleType.FIRMADMIN){
		query.where(
            squel.expr().and(squelUtils.eql(roleEntity.columns.id,roleId))
        )
	}
    if(data.roleType){
        query.where(
            squel.expr().and(squelUtils.like(roleTypeEntity.columns.roleType,data.roleType))
        )
    }

    if(isDeleted !=undefined && isDeleted.match('^(true|false|1|0)$')){
    	query.where(
            squel.expr().and(squelUtils.eql(roleEntity.columns.isDeleted,isDeleted))
        )
	}
	if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                    .or(squelUtils.eql(roleEntity.columns.id,data.search))
                    .or(squelUtils.like(roleEntity.columns.name,data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(roleEntity.columns.name,data.search)
                )
            )
        }
    }
    if (data.exactSearch) {
        query.where(
            squel.expr().and(
                squelUtils.eql(roleEntity.columns.name,data.search)
            )
        )
    }
    query.group(roleEntity.columns.id)
//    if (data.search) {
    	query.order(roleEntity.columns.name);
//    }
	query = query.toString();
	
	logger.debug(" Select Roles query", query);
	firmConnection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

RoleDao.prototype.addRolePrivilege = function (data, cb) {

	var firmConnection = null;
	
	if(data.privileges && data.privileges.length > 0){
		firmConnection = baseDao.getConnection(data);		
		var privilegeEntityList = data.privileges;
		
		var query = [];
		query.push(" INSERT INTO "+rolePrivilegeEntity.tableName);
		query.push(" ("+rolePrivilegeEntity.columns.roleId+", "+rolePrivilegeEntity.columns.privilegeId+", ");
		query.push(" "+rolePrivilegeEntity.columns.canAdd+", "+rolePrivilegeEntity.columns.canDelete+", ");
		query.push(" "+rolePrivilegeEntity.columns.canUpdate+", "+rolePrivilegeEntity.columns.canRead+", ");
		query.push(" "+rolePrivilegeEntity.columns.isDeleted+", "+rolePrivilegeEntity.columns.createdDate+", ");
		query.push(" "+rolePrivilegeEntity.columns.createdBy+", "+rolePrivilegeEntity.columns.editedDate+", ");
		query.push(" "+rolePrivilegeEntity.columns.editedBy+") VALUES ? " );
		query.push(" ON DUPLICATE KEY UPDATE ");
		query.push(" "+rolePrivilegeEntity.columns.canAdd+"=VALUES("+rolePrivilegeEntity.columns.canAdd+"), ");
		query.push(" "+rolePrivilegeEntity.columns.canRead+"=VALUES("+rolePrivilegeEntity.columns.canRead+"), ");
		query.push(" "+rolePrivilegeEntity.columns.canUpdate+"=VALUES("+rolePrivilegeEntity.columns.canUpdate+"), ");
		query.push(" "+rolePrivilegeEntity.columns.canDelete+"=VALUES("+rolePrivilegeEntity.columns.canDelete+"), ");
		query.push(" "+rolePrivilegeEntity.columns.isDeleted+"=VALUES("+rolePrivilegeEntity.columns.isDeleted+"), ");
		query.push(" "+rolePrivilegeEntity.columns.createdDate+"=VALUES("+rolePrivilegeEntity.columns.createdDate+"), ");
		query.push(" "+rolePrivilegeEntity.columns.createdBy+"=VALUES("+rolePrivilegeEntity.columns.createdBy+"), ");
		query.push(" "+rolePrivilegeEntity.columns.editedDate+"=VALUES("+rolePrivilegeEntity.columns.editedDate+"), ");
		query.push(" "+rolePrivilegeEntity.columns.editedBy+"=VALUES("+rolePrivilegeEntity.columns.editedBy+") ");
		query = query.join(" ");

		var rolePrivileges = [];
		var updateRolePrivileges = [];
		
		(privilegeEntityList).forEach(function (privilege) {
			var rolePrivilege = [];
			rolePrivilege.push(data.id);
			rolePrivilege.push(privilege.id);
			rolePrivilege.push(privilege.canAdd);
			rolePrivilege.push(privilege.canDelete);
			rolePrivilege.push(privilege.canUpdate);
			rolePrivilege.push(privilege.canRead);
			rolePrivilege.push(privilege.isDeleted||0);
			rolePrivilege.push(utilDao.getSystemDateTime(null));
			rolePrivilege.push(utilService.getAuditUserId(data.user));
			rolePrivilege.push(utilDao.getSystemDateTime(null));
			rolePrivilege.push(utilService.getAuditUserId(data.user));
			rolePrivileges.push(rolePrivilege);

			var updateData = [];
			updateData.push(privilege.canAdd);
			updateData.push(privilege.canRead);
			updateData.push(privilege.canUpdate);
			updateData.push(privilege.canDelete);
			updateData.push(privilege.isDeleted||0);
			updateData.push(utilDao.getSystemDateTime(null));
			updateData.push(utilService.getAuditUserId(data.user));
			updateData.push(utilDao.getSystemDateTime(null));
			updateData.push(utilService.getAuditUserId(data.user));
			updateRolePrivileges.push(updateData);

		});
		

		logger.debug("Set Roles Privileges query", query);
		var queryString = firmConnection.query(query, [rolePrivileges], function (err, data) {
			if (err) {
				return cb(err);
			}
			return cb(null, data);
		});
	}else{
		cb(null, null);
	}
	
};

RoleDao.prototype.updateRolePrivilege = function (data, cb) {
	
	var self = this;	
	var firmConnection = baseDao.getConnection(data);
	var rolePrivilegeQuery = [];
	rolePrivilegeQuery.push(' INSERT INTO '+rolePrivilegeEntity.tableName+' SET  ?  ');
	rolePrivilegeQuery.push(' ON DUPLICATE KEY UPDATE ? ');
	rolePrivilegeQuery = rolePrivilegeQuery.join(" ");

	var rolePrivileges = [];
	var roleKeys = [];
	var privilegeKeys = [];
	var counter = 0;
	var error = null;
	var privilegeEntityToAdd = [];
	data.roleId = data.id;
	self.deletedRolePrivileges(data, function(err, rs){
		if(err){
			return cb(err);
		}
		(data.privileges).forEach(function (privilege) {
			var rolePrivilege = {};
			var rolePrivilegeData = {};
			var privilegeId = privilege.id;
			logger.debug("The privilege we add is"+JSON.stringify(privilege));
			if(privilegeId){
				if (privilege.canAdd !== null) {
					rolePrivilegeData[rolePrivilegeEntity.columns.canAdd] = privilege.canAdd;
				}
				if (privilege.canUpdate !== null) {
					rolePrivilegeData[rolePrivilegeEntity.columns.canUpdate] = privilege.canUpdate;
				}
				if (privilege.canDelete !== null) {
					rolePrivilegeData[rolePrivilegeEntity.columns.canDelete] = privilege.canDelete;
				}
				if (privilege.canRead !== null) {
					rolePrivilegeData[rolePrivilegeEntity.columns.canRead] = privilege.canRead;
				}
				rolePrivilegeData[rolePrivilegeEntity.columns.privilegeId] = privilegeId;
				rolePrivilegeData[rolePrivilegeEntity.columns.roleId] = data.roleId;
				rolePrivilegeData[rolePrivilegeEntity.columns.isDeleted] = 0;
				
				var rolePrivilegeCreateData = rolePrivilegeData;
				if(rs.indexOf(privilegeId) >= 0){
					rolePrivilegeData[rolePrivilegeEntity.columns.createdDate] = utilDao.getSystemDateTime(null);
					rolePrivilegeData[rolePrivilegeEntity.columns.createdBy] = utilService.getAuditUserId(data.user);						
				}
				rolePrivilegeCreateData[rolePrivilegeEntity.columns.createdDate] = utilDao.getSystemDateTime(null);
				rolePrivilegeCreateData[rolePrivilegeEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
				rolePrivilegeCreateData[rolePrivilegeEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
				rolePrivilegeCreateData[rolePrivilegeEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

				rolePrivilegeData[rolePrivilegeEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
				rolePrivilegeData[rolePrivilegeEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
				logger.debug("privelege data is"+JSON.stringify(rolePrivilegeData));
				logger.debug("Update Roles Privileges query",  rolePrivilegeQuery);
				var quer = firmConnection.query(rolePrivilegeQuery, [rolePrivilegeCreateData,rolePrivilegeData], function (err, result) {
					counter ++;
					if (err) {
						logger.info(err);
						error = err;
					}
					if(counter === data.privileges.length){
						if(error){
							return cb(error, "success");
						}else{
							return cb(null, "success");
						}   		
					}
				});
				logger.debug("Update Roles Privileges query",  quer.sql);
			}
		});
	});
};

RoleDao.prototype.getRoleTypeList = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	
	var query = squel.select()
	.from(roleTypeEntity.tableName);
	 query.order(roleTypeEntity.columns.roleType);
	query = query.toString();

	logger.debug("Get role type list Query"+query);
	firmConnection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

RoleDao.prototype.getRoleType = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	
	var query = squel.select()
	.from(roleTypeEntity.tableName)
	.where(squel.expr()
		.and(squelUtils.eql(roleTypeEntity.columns.id,data.roleType))
		);
	query = query.toString();

	logger.debug("roleType Query"+query);
	firmConnection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

RoleDao.prototype.reassignRole = function (data, cb) {
	
	var firmConnection = baseDao.getConnection(data);
	var queryData = {};
	queryData[userEntity.columns.roleId] = data.newRoleId;
	queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
	queryData[userEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

	var query = [];
	query.push(" UPDATE "+userEntity.tableName+" SET ? ");
	query.push(" where "+userEntity.columns.roleId+" = ? ");
	query = query.join(" ");

	logger.debug("Reassign role Query",query);
	firmConnection.query(query, [queryData, data.oldRoleId], function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

RoleDao.prototype.removeRolePrivileges = function (data, cb) {
	logger.debug("the data i got in dao is"+JSON.stringify(data));
	var firmConnection = baseDao.getConnection(data);
		var privilegeIds = [];
		var roleId = data.id;

		(data.privileges).forEach(function (privilege) {
			var privilegeId = privilege.id;
			if(privilegeId){
				privilegeIds.push(privilegeId);
			}
		});
		var queryData = {}
		queryData[rolePrivilegeEntity.columns.isDeleted] = 1;

		var deleteUserTeamQuery = [];
		deleteUserTeamQuery.push(' UPDATE '+rolePrivilegeEntity.tableName+' SET ? ');
		deleteUserTeamQuery.push(' WHERE '+rolePrivilegeEntity.columns.roleId+' = ? ');
		deleteUserTeamQuery = deleteUserTeamQuery.join(" ");
		if(privilegeIds.length > 0){
			deleteUserTeamQuery = [];
			deleteUserTeamQuery.push(' UPDATE '+rolePrivilegeEntity.tableName+' SET ? ');
			deleteUserTeamQuery.push(' WHERE '+rolePrivilegeEntity.columns.roleId+' = ? AND ');
			deleteUserTeamQuery.push(' '+rolePrivilegeEntity.columns.privilegeId+' NOT IN(?) ');
			deleteUserTeamQuery = deleteUserTeamQuery.join(" ");
		}
			firmConnection.query(deleteUserTeamQuery, [queryData, roleId, privilegeIds], function (err, data) {
				if (err) {
					return cb(err);
				}
				return cb(null, data);
			}); 
	
}

RoleDao.prototype.deletedRolePrivileges = function (data, cb) {
	var connection =  baseDao.getConnection(data);
	var roleId = data.roleId;
	
	var query = squel.select()
	.field(rolePrivilegeEntity.columns.privilegeId,"privilegeId")
	.from(rolePrivilegeEntity.tableName)
	.where(squel.expr()
		.and(squelUtils.eql(rolePrivilegeEntity.columns.roleId,roleId))
		.and(squelUtils.eql(rolePrivilegeEntity.columns.isDeleted,1))
    );
    query = query.toString();
	
	logger.debug("deleted role privilege Query"+query);
	connection.query(query, roleId, function(err, rs){
		var array = [];
		rs.forEach(function(value, id){
			array.push(value.privilegeId);
		})
		cb(err, array);
	});
};
RoleDao.prototype.changeStatusToActive  = function(data,cb){
	var connection = baseDao.getConnection(data);

	var query = [];
	query.push(' UPDATE '+roleEntity.tableName+' SET '+roleEntity.columns.status+' = 1 ');
	query.push(' WHERE ('+roleEntity.columns.startDate+' <= NOW() ');
	query.push(' OR '+roleEntity.columns.startDate+' IS NULL) ');
	query.push(' AND '+roleEntity.columns.expireDate+' > NOW() ');
	query = query.join(" ");

	logger.debug("change status to active Query"+query);
	connection.query(query, function (err, updated) {
		if (err) {
			return cb(err);
		}
		return cb(null, updated);

	});
};
RoleDao.prototype.changeStatusToInActive  = function(data,cb){
	var connection = baseDao.getConnection(data);

	var query = [];
	query.push(' UPDATE '+roleEntity.tableName+' SET '+roleEntity.columns.status+' = 0 ');
	query.push(' WHERE ('+roleEntity.columns.startDate+' > NOW()) ');
	query.push(' OR '+roleEntity.columns.expireDate+' <= NOW() ');
	query = query.join(" ");

	logger.debug("change status to in active Query"+query);
	connection.query(query, function (err, updated) {
		if (err) {
			return cb(err);
		}
		return cb(null, updated);

	});
};
RoleDao.prototype.getRoleSummary  = function(data,cb){
	var connection = baseDao.getConnection(data);
	var query = "CALL getDashboardSummaryRoles(?)" ;
	var currentUserId =data.user.userId;
	connection.query(query,[currentUserId], function (err, resultSet) {
		if (err) {
			return cb(err);
		}
		return cb(null, resultSet[0][0]);

	});
};
RoleDao.prototype.getRoleUsers  = function(data,cb){
	var connection = baseDao.getConnection(data);

	var query = squel.select()
	.field(userEntity.columns.id,"id")
	.field("CONCAT_WS(' ',"+userEntity.columns.firstName+","+userEntity.columns.lastName+")","name")
	.field(userEntity.columns.status,"status")
	.field(userEntity.columns.email,"email")
	.field(userEntity.columns.startDate,"startDate")
	.field(userEntity.columns.expireDate,"expireDate")
	.field(userEntity.columns.isDeleted,"isDeleted")
	.field(userEntity.columns.createdDate,"createdOn")
	.field(userEntity.columns.createdBy,"createdBy")
	.field(userEntity.columns.editedDate,"editedOn")
	.field(userEntity.columns.editedBy,"editedBy")
	.from(userEntity.tableName)
	.join(roleEntity.tableName, null, 
    	squelUtils.joinEql(userEntity.columns.roleId,roleEntity.columns.id)
    )
    .where(squel.expr()
    	.and(squelUtils.eql(roleEntity.columns.id,data.id))
    	.and(squelUtils.eql(roleEntity.columns.isDeleted,0))
    	.and(squelUtils.eql(userEntity.columns.isDeleted,0))
    )
	query = query.toString();

	logger.debug("Get role user Query"+query);
	connection.query(query, function (err, resultSet) {
		if (err) {
			return cb(err);
		}
		return cb(null, resultSet);

	});
};

module.exports = RoleDao;
