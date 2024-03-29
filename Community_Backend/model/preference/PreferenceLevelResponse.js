"use strict";
var lodash = require("lodash");

var PreferenceLevelObj = require('model/preference/PreferenceLevel.js');
var preferenceLevel = new PreferenceLevelObj();

var PreferenceLevelResponse = function(data) {
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

PreferenceLevelResponse.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, preferenceLevel), lodash.keys(preferenceLevel));
};

module.exports = PreferenceLevelResponse;