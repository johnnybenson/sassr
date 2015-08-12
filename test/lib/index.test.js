/* globals describe, before, it */
'use strict';

var fs = require('fs');
var path = require('path');

var assert = require('chai').assert;
var browserify = require('browserify');

var index = require('../../index');
var bundleString = fs.readFileSync(path.resolve(__dirname, '../mock/requires-css.bundle.js')).toString();

function moduleFromString(string, filename) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(string, filename);
    return m.exports;
}

describe('index', function() {
    var resultString;
    var inlineModule;

    before(function(done) {
        var b = browserify('./test/mock/requires-css');
        b.transform(index);
        b.bundle(null, function(error, buffer) {
            resultString = buffer.toString();
            inlineModule = moduleFromString(resultString, path.resolve('../mock/requires-css.inline.js'));
            done();
        });
    });

    it('should create a module', function() {
        var resultLines = resultString.split('\n');
        var bundleLines = bundleString.split('\n');

        resultLines.forEach(function(line, i) {
            assert.equal(line, bundleLines[i]);
        });
    });

    it('should expose the right stuff', function() {
        assert.isTrue(true);
        console.log(JSON.stringify(inlineModule, null, 2));
    });
});
