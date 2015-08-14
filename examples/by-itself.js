'use strict';

// Simulate a document with JsDom.
var jsdom = require('jsdom').jsdom;

global.document = jsdom('<html><head></head><body></body></html>');
global.window = global.document.parentWindow;
global.navigator = global.window.navigator;

// Register the 'require hook'.
require('../register')();

// Require '.css', or '.scss' files at will.
var cssModule = require('./style.css');
var cssString = cssModule.getCSSText();

var scssModule = require('./style.scss');
var scssString = scssModule.getCSSText();

console.log('css:\t%sscss:\t%s', cssString, scssString);
