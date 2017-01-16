"use strict";
var lodash = require("lodash");

var preferenceLevel = new function () {
	this.id = null;
	this.name = null;
}

var PreferenceLevelRecordEntity = function(data) {
    var self = this;
    if (data instanceof Array) {
        var levels = [];

        data.forEach(function(level) {
            var sanitizedObj = self.sanitize(level);
            levels.push(sanitizedObj);
        });

        return levels;
    } else if (data instanceof Object) {

        return self.data = self.sanitize(data);
    }
};

PreferenceLevelRecordEntity.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, preferenceLevel), lodash.keys(preferenceLevel));
};

module.exports = PreferenceLevelRecordEntity;