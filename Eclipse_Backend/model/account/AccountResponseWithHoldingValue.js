"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.accountNumber = null;
    this.accountType = null;
	this.value = null;
	this.portfolioId = null;
	this.portfolioName = null;


	return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}