/* globals describe, before, it */
'use strict';

var fs = require('fs');
var path = require('path');

var assert = require('chai').assert;
var browserify = require('browserify');

var index = require('../../index');
var bundle = fs.readFileSync(path.resolve(__dirname, '../mock/requires-css.bundle.js')).toString();

describe('index', function() {
    var result;

    before(function(done) {
        var b = browserify('test/mock/requires-css');
        b.transform(index);
        b.bundle(function(error, buffer) {
            result = buffer.toString();
            done();
        });
    });

    it('should create a module', function() {
        var resultLines = result.split('\n');
        var bundleLines = bundle.split('\n');

        resultLines.forEach(function(line, i) {
            assert.equal(line, bundleLines[i]);
        });
    });
});
