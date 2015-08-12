(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var element = document.createElement('style');
document.head.appendChild(element);

var inject;
var eject;

function injectIe(css) {
    element.styleSheet.cssText = css;
}

function injectStandard(css) {
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }

    element.appendChild(document.createTextNode(css));
}

inject = element.styleSheet ? injectIe : injectStandard;
eject = function(css) {
    return inject(element.innerHTML.replace(css, ''));
};

exports.element = element;
exports.inject = inject;
exports.eject = eject;

},{}],2:[function(require,module,exports){
'use strict';

var css = require('./style.css');
css.append();

},{"./style.css":3}],3:[function(require,module,exports){
'use strict';

var style = require('sassr/lib/style-element-helper');
var css = '.badge{background-color:#999;color:#fe57a1}\n';
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

},{"sassr/lib/style-element-helper":1}]},{},[2])
