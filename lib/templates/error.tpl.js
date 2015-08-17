'use strict';

exports.getStyleElement = function() {
    return null;
};

exports.getCSSText = function() {
    return '';
};

exports.append = exports.remove = function() {
    console.error("<%= message %>");
    return null;
};
