/* globals describe, before, after, it */
'use strict';

var fs = require('fs');
var path = require('path');

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
        var b = browserify('./test/mock/requires-css');
        b.transform(sassr);
        b.bundle(null, function(error, buffer) {
            if (error) { console.log(error); }
            resultString = buffer.toString();

            var filename = path.resolve(__dirname, '../mock/requires-css.inline.js');
            inlineModule = moduleFromString(resultString, filename);

            done();
        });
    });

    after(function() {
        while (document.head.hasChildNodes()) {
            document.head.removeChild(document.head.firstChild);
        }
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
        var actual = document.head.getElementsByTagName('style')[0].textContent;
        var expected = '.badge{background-color:#999;color:#fe57a1}\n';

        assert.equal(actual, expected);
    });
});
