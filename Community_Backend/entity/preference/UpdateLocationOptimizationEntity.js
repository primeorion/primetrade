"use strict";
var lodash = require("lodash");

var LocationOptimizationPreferenceObj = require('entity/preference/LocationOptimizationPreference');
var locationOptimizationPreference = new LocationOptimizationPreferenceObj();

var LocationOptimizationEntity = function(data) {
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

LocationOptimizationEntity.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, locationOptimizationPreference), lodash.keys(locationOptimizationPreference));
};

module.exports = LocationOptimizationEntity;