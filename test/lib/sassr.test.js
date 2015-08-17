/* globals describe, before, after, it */
'use strict';

var fs = require('fs');
var path = require('path');

var jsdom = require('jsdom').jsdom;
var assert = require('chai').assert;
var browserify = require('browserify');
var template = require('lodash/string/template');

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

    var resultStringSync;
    var inlineModuleSync;

    var cssPath = path.resolve(__dirname, '../mock/style.css');
    var css = fs.readFileSync(cssPath).toString();

    var scssPath = path.resolve(__dirname, '../mock/style.scss');
    var scss = fs.readFileSync(scssPath).toString();

    var modulePath = path.resolve(__dirname, '../../lib/templates/sassr.tpl.js');
    var sassrModuleTpl = fs.readFileSync(modulePath).toString();

    before(function(done) {
        global.document = jsdom('<html><head></head><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;

        (function() {
            var b = browserify('./test/mock/requires-css');
            b.transform(sassr);
            b.bundle(null, function(error, buffer) {
                if (error) { console.log(error); }
                resultString = buffer.toString();

                if (resultString && resultStringSync) {
                    done();
                }
            });
        })();

        (function() {
            var b = browserify('./test/mock/requires-css');
            b.transform(sassr.sync);
            b.bundle(null, function(error, buffer) {
                if (error) { console.log(error); }
                resultStringSync = buffer.toString();

                if (resultString && resultStringSync) {
                    done();
                }
            });
        })();
    });

    after(function (done) {
        delete global.document;
        delete global.window;
        delete global.navigator;
        done();
    });

    it('should export the async version, and a sync version under \'.sync\'', function() {
        assert.instanceOf(sassr, Function);
        assert.equal(sassr.length, 2);

        assert.instanceOf(sassr.sync, Function);
        assert.equal(sassr.sync.length, 2);
    });

    it('should create a module', function() {
        var resultLines = resultString.split('\n');
        var bundleLines = bundleString.split('\n');

        // console.log('\n' + resultString + '\n');
        resultLines.forEach(function(line, i) {
            assert.equal(line, bundleLines[i]);
        });
    });

    it('should create the same module with sync', function() {
        var resultLines = resultStringSync.split('\n');
        var bundleLines = bundleString.split('\n');

        // console.log('\n' + resultString + '\n');
        resultLines.forEach(function(line, i) {
            assert.equal(line, bundleLines[i]);
        });
    });

    it('should append style to the head', function() {
        // Compile the module "inline". Should trigger `css.append();` from `../mock/requires-css.js`.
        var modulePath = '../mock/requires-css.inline.js';
        moduleFromString(resultString, path.resolve(__dirname, modulePath));

        var actual = document.head.getElementsByTagName('style').item(0).textContent;
        var expected = '.badge{background-color:#999;color:#fe57a1;content:"badge";font-family:\'Helvitica\'}\n';

        assert.equal(actual, expected);
    });

    it('should append style to the head with sync', function() {
        // Compile the module "inline". Should trigger `css.append();` from `../mock/requires-css.js`.
        var modulePath = '../mock/requires-css.inline.js';
        moduleFromString(resultStringSync, path.resolve(__dirname, modulePath));

        var actual = document.head.getElementsByTagName('style').item(0).textContent;
        var expected = '.badge{background-color:#999;color:#fe57a1;content:"badge";font-family:\'Helvitica\'}\n';

        assert.equal(actual, expected);
    });

    describe('#transform', function() {
        it('should be a function that accepts 2 arguments (opts, and a callback)', function() {
            assert.instanceOf(sassr.transform, Function);
            assert.equal(sassr.transform.length, 2);
        });

        it('should take some CSS and return CSS', function(done) {
            sassr.transform({ data: css }, function(errMessage, module) {
                var actual = module;
                var expected = template(sassrModuleTpl)({
                    css: '.badge{background-color:#999;color:#fe57a1;content:\\"badge\\";font-family:\'Helvitica\'}\\n'
                });

                var actualLines = actual.split('\n');
                var expectedLines = expected.split('\n');

                actualLines.forEach(function(line, i) {
                    assert.equal(line, expectedLines[i]);
                });

                done();
            });

        });

        it('should take some Sass and return CSS', function(done) {
            sassr.transform({ data: scss }, function(errMessage, module) {
                var actual = module;
                var expected = template(sassrModuleTpl)({
                    css: '.badge{background-color:#b3b3b3;color:#fe2485;content:\\"badge\\";font-family:\'Helvitica\'}\\n'
                });

                var actualLines = actual.split('\n');
                var expectedLines = expected.split('\n');

                actualLines.forEach(function(line, i) {
                    assert.equal(line, expectedLines[i]);
                });

                done();
            });

        });
    });

    describe('#transformSync', function() {
        it('should be a function that accepts 1 argument (opts)', function() {
            assert.instanceOf(sassr.transformSync, Function);
            assert.equal(sassr.transformSync.length, 1);
        });

        it('should take some CSS and return CSS', function() {
            var actual = sassr.transformSync({ data: css });
            var expected = template(sassrModuleTpl)({
                css: '.badge{background-color:#999;color:#fe57a1;content:\\"badge\\";font-family:\'Helvitica\'}\\n'
            });

            var actualLines = actual.split('\n');
            var expectedLines = expected.split('\n');

            actualLines.forEach(function(line, i) {
                assert.equal(line, expectedLines[i]);
            });

        });

        it('should take some Sass and return CSS', function() {
            var actual = sassr.transformSync({ data: scss });
            var expected = template(sassrModuleTpl)({
                css: '.badge{background-color:#b3b3b3;color:#fe2485;content:\\"badge\\";font-family:\'Helvitica\'}\\n'
            });

            var actualLines = actual.split('\n');
            var expectedLines = expected.split('\n');

            actualLines.forEach(function(line, i) {
                assert.equal(line, expectedLines[i]);
            });

        });
    });

});
