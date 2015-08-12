/* globals describe, before, it */
'use strict';

var fs = require('fs');
var path = require('path');

var assert = require('chai').assert;
var browserify = require('browserify');

var index = require('../../index');
var bundleString = fs.readFileSync(path.resolve(__dirname, '../mock/requires-css.bundle.js')).toString();

describe('index', function() {
    var resultString;

    before(function(done) {
        var b = browserify('./test/mock/requires-css');
        b.transform(index);
        b.bundle(null, function(error, buffer) {
            resultString = buffer.toString();
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
});
