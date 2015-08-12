/* global describe, it, window, document, navigator */
'use strict';

var assert = require('chai').assert;
var jsdom = require('jsdom').jsdom;

global.document = jsdom('<html><head></head><body></body></html>');
global.window = global.document.parentWindow;
global.navigator = global.window.navigator;

describe('global', function () {
    it('should have a window', function (/*done*/) {
        assert.isDefined(window);
    });

    it('should have a document', function (/*done*/) {
        assert.isDefined(document);
    });

    it('should have a navigator', function (/*done*/) {
        assert.isDefined(navigator);
    });
});
