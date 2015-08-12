'use strict';

var style = require('sassr/lib/style-element-helper');
var css = '<%= css %>';
var appended;

exports.getStyleElement = function() {
    return style.element;
};

exports.getCSSText = function() {
    return css;
};

exports.append = function() {
    if (!appended) {
        style.inject(css);
        appended = true;
    }

    return style.element;
};

exports.remove = function() {
    if (appended) {
        style.eject(css);
        appended = false;
    }

    return style.element;
};
