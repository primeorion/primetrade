"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
 	this.communityStrategistId = null;
     
    return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}