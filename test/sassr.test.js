/* globals describe, it */
'use strict';

var fs = require('fs');
var path = require('path');

var assert = require('chai').assert;
var concatStream = require('concat-stream');

var testUtils = require('./utils');

var sassr = require('../');

var EXPECTED_GOOD_CSS = '.badge{background-color:#999;color:#fe57a1}\n';
var EXPECTED_GOOD_SCSS = '.badge{background-color:#b3b3b3;color:#fe2485}.badge.police{content:\'I AM A COP! SHUTUP!\'}\n';
var EXPECTED_ERROR = '"property \\"We\\" must be followed by a \':\'"';

describe('sassr', function() {
    var cssPaths = {
        good: require.resolve('./fixtures/good.css'),
        bad: require.resolve('./fixtures/bad.css'),
    };
    var cssSources = {
        good: fs.readFileSync(cssPaths.good).toString(),
        bad: fs.readFileSync(cssPaths.bad).toString(),
    };

    var scssPaths = {
        good: require.resolve('./fixtures/good.scss'),
        bad: require.resolve('./fixtures/bad.scss'),
    };
    var scssSources = {
        good: fs.readFileSync(scssPaths.good).toString(),
        bad: fs.readFileSync(scssPaths.bad).toString(),
    };

    var txtPath = require.resolve('./fixtures/not-css.txt');

    function assertCSSText(source, cssText, callback) {
        callback = callback || function() {};
        var module = testUtils.loadAsModule(source);
        assert.equal(module.getCSSText(), cssText);
        try {
            assert.equal(module.getCSSText(), cssText);
            callback();
        } catch (error) {
            callback(error);
        }
    }

    it('should load and export sync, transform, and transformSync', function() {
        assert.isFunction(sassr);
        assert.isFunction(sassr.sync);
        assert.isFunction(sassr.transform);
        assert.isFunction(sassr.transformSync);
    });

    describe('sassr', function() {
        function sassrize(path, opts, done) {
            return fs.createReadStream(path)
                .pipe(sassr(path, opts))
                .on('error', function(error) {
                    done(error);
                })
                .pipe(concatStream({
                    encoding: 'string'
                }, done));
        }

        it('should transform CSS', function(done) {
            sassrize(cssPaths.good, {}, function(module) {
                assertCSSText(module, EXPECTED_GOOD_CSS, done);
            });
        });

        it('should transform CSS', function(done) {
            sassrize(scssPaths.good, {}, function(module) {
                assertCSSText(module, EXPECTED_GOOD_SCSS, done);
            });
        });

        it('should ignore non-[S]CSS files', function(done) {
            sassrize(txtPath, {}, function(module) {
                assert.equal(module, 'This is not CSS.\n');
                done();
            });
        });

        it('should error on bad CSS', function(done) {
            sassrize(cssPaths.bad, {}, function(error) {
                assert.equal(error, EXPECTED_ERROR);
                done();
            });
        });

        it('should error on bad SCSS', function(done) {
            sassrize(scssPaths.bad, {}, function(error) {
                assert.equal(error, EXPECTED_ERROR);
                done();
            });
        });
    });

    describe('sassr.sync', function() {
        function sassrizeSync(path, opts, done) {
            fs.createReadStream(path)
                .pipe(sassr.sync(path, opts))
                .on('error', function(error) {
                    done(error);
                })
                .pipe(concatStream({
                    encoding: 'string'
                }, done));
        }

        it('should transform CSS', function(done) {
            sassrizeSync(cssPaths.good, {}, function(module) {
                assertCSSText(module, EXPECTED_GOOD_CSS, done);
            });
        });

        it('should transform CSS', function(done) {
            sassrizeSync(scssPaths.good, {}, function(module) {
                assertCSSText(module, EXPECTED_GOOD_SCSS, done);
            });
        });

        it('should ignore non-[S]CSS files', function(done) {
            sassrizeSync(txtPath, {}, function(module) {
                assert.equal(module, 'This is not CSS.\n');
                done();
            });
        });

        it('should error on bad CSS', function(done) {
            sassrizeSync(cssPaths.bad, {}, function(error) {
                assert.equal(error, EXPECTED_ERROR);
                done();
            });
        });

        it('should error on bad SCSS', function(done) {
            sassrizeSync(scssPaths.bad, {}, function(error) {
                assert.equal(error, EXPECTED_ERROR);
                done();
            });
        });
    });

    describe('sassr.transform', function() {
        it('should transform CSS', function(done) {
            sassr.transform({
                data: cssSources.good,
                includePaths: [
                    path.dirname(cssPaths.good)
                ]
            }, function(error, module) {
                assertCSSText(module, EXPECTED_GOOD_CSS, done);
            });
        });

        it('should transform SCSS', function(done) {
            sassr.transform({
                data: scssSources.good,
                includePaths: [
                    path.dirname(scssPaths.good)
                ]
            }, function(error, module) {
                assertCSSText(module, EXPECTED_GOOD_SCSS, done);
            });
        });

        it('should error on bad CSS', function(done) {
            sassr.transform({
                data: cssSources.bad,
                includePaths: [
                    path.dirname(cssPaths.bad)
                ]
            }, function(error, module) {
                assert.instanceOf(error, Error);
                assert.isUndefined(module);
                done();
            });
        });

        it('should error on bad SCSS', function(done) {
            sassr.transform({
                data: scssSources.bad,
                includePaths: [
                    path.dirname(scssPaths.bad)
                ]
            }, function(error, module) {
                assert.instanceOf(error, Error);
                assert.isUndefined(module);
                done();
            });
        });
    });

    describe('sassr.transformSync', function() {
        it('should transform CSS', function() {
            var module = sassr.transformSync({
                data: cssSources.good,
                includePaths: [
                    path.dirname(cssPaths.good)
                ]
            });

            assertCSSText(module, EXPECTED_GOOD_CSS);
        });

        it('should transform SCSS', function() {
            var module = sassr.transformSync({
                data: scssSources.good,
                includePaths: [
                    path.dirname(scssPaths.good)
                ]
            });

            assertCSSText(module, EXPECTED_GOOD_SCSS);
        });

        it('should error on bad CSS', function() {
            assert.throws(function() {
                sassr.transformSync({
                    data: cssSources.bad,
                    includePaths: [
                        path.dirname(cssPaths.bad)
                    ]
                }, {});
            });
        });

        it('should error on bad SCSS', function() {
            assert.throws(function() {
                sassr.transformSync({
                    data: scssSources.bad,
                    includePaths: [
                        path.dirname(scssPaths.bad)
                    ]
                }, {});
            });
        });
    });

});
