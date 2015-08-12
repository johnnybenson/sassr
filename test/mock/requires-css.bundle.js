(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var style = document.createElement('style');
document.head.appendChild(style);

var inject = style.styleSheet ?
    function(css) {
        style.styleSheet.cssText = css;
    } : function(css) {
        while (style.firstChild) style.removeChild(style.firstChild);
        style.appendChild(document.createTextNode(css));
    };

var eject = function(css) {
    return inject( style.innerHTML.replace(css, '') );
};

module.exports.style = style;
module.exports.inject = inject;
module.exports.eject = eject;

},{}],2:[function(require,module,exports){
'use strict';

var css = require('./style.css');

module.exports = {
    style: css
};

},{"./style.css":3}],3:[function(require,module,exports){
var style = require("sassr/style");
var css = ".badge{background-color:#999;color:#fe57a1}\n";
var appended;
module.exports.getStyleElement = function() {
  return style.style;
};
module.exports.getCSSText = function() {
  return css;
};
module.exports.append = function() {
  if (!appended) style.inject(css);
  appended = true;
  return style.style;
};
module.exports.remove = function() {
  if (appended) style.eject(css);
  appended = false;
  return style.style;
};
},{"sassr/style":1}]},{},[2]);
