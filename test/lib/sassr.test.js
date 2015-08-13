/* globals describe, before, after, it */
'use strict';

var fs = require('fs');
var path = require('path');

var jsdom = require('jsdom').jsdom;
var assert = require('chai').assert;
var browserify = require('browserify');

var sassr = require('../../lib/sassr');
var bundleString = fs.readFileSync(path.resolve(__dirname, '../mock/requires-css.bundle.js')).toString();

function moduleFromString(string, filename) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(string, filename);
    return m.exports;
}

describe('sassr', function() {
    var resultString;
    var inlineModule;

    before(function(done) {
        global.document = jsdom('<html><head></head><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;

        var b = browserify('./test/mock/requires-css');
        b.transform(sassr);
        b.bundle(null, function(error, buffer) {
            if (error) { console.log(error); }
            resultString = buffer.toString();
            done();
        });
    });

    after(function (done) {
        delete global.document;
        delete global.window;
        delete global.navigator;
        done();
    });

    it('should create a module', function() {
        var resultLines = resultString.split('\n');
        var bundleLines = bundleString.split('\n');

        // console.log(resultString);
        resultLines.forEach(function(line, i) {
            assert.equal(line, bundleLines[i]);
        });
    });

    it('should append style to the head', function() {
        // Compile the module "inline". Should trigger `css.append();` from `../mock/requires-css.js`.
        var modulePath = '../mock/requires-css.inline.js';
        moduleFromString(resultString, path.resolve(__dirname, modulePath));

        var actual = document.head.getElementsByTagName('style').item(0).textContent;
        var expected = '.badge{background-color:#999;color:#fe57a1}\n';

        assert.equal(actual, expected);
    });
});
