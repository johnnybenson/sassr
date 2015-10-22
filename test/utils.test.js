/* globals describe, before, it */
'use strict';

var fs = require('fs');

var assert = require('chai').assert;

var testUtils = require('./utils');

describe('utils', function() {
    var libUtilsPath = require.resolve('../lib/utils');
    var libUtilsSource = fs.readFileSync(libUtilsPath);
    var libUtils;

    var css = '.badge{background-color:#999;color:#fe57a1;}';

    var url = '.abs{background-image:url(\'http://lazy.xxx/path/to/thing\');}.root{background-image:url(\'/path/to/thing\');.rel{background-image:url(\'path/to/thing\');}';
    var urlTransformed = '.abs{background-image:url(\'http://lazy.xxx/path/to/thing\');}.root{background-image:url("http://lazy.xxx/path/to/thing");.rel{background-image:url("http://lazy.xxx/path/to/thing");}';

    describe('old ie context', function() {
        var OLD_IE_CONTEXT = {
            document: {
                head: {
                    appendChild: function() {}
                },
                createElement: function() {
                    return {
                        innerHTML: '',
                        styleSheet: { cssText: '' }
                    };
                }
            },
            module: { exports: {} }
        };

        before(function() {
            libUtils = testUtils.loadAsModule(libUtilsSource, OLD_IE_CONTEXT);
        });

        it('should load and export element, insertHost, inject, and eject', function() {
            assert.isDefined(libUtils.element);
            assert.isFunction(libUtils.insertHost);
            assert.isFunction(libUtils.inject);
            assert.isFunction(libUtils.eject);
        });

        it('should update url with insertHost', function() {
            assert.equal(libUtils.insertHost(url, 'http://lazy.xxx'), urlTransformed);
        });

        it('should inject', function() {
            libUtils.inject(css);
            assert.equal(libUtils.element.styleSheet.cssText, css);
        });

        it('should eject', function() {
            libUtils.eject(css);
            assert.equal(libUtils.element.styleSheet.cssText, '');
        });
    });

    describe('standard context', function() {
        var hasChildNodes = false;
        var STANDARD_CONTEXT = {
            document: {
                head: {
                    appendChild: function() {}
                },
                createElement: function() {
                    return {
                        appendChild: function(text) { this.innerHTML = text; },
                        firstChild: {},
                        hasChildNodes: function() {
                            hasChildNodes = !hasChildNodes;
                            return hasChildNodes;
                        },
                        innerHTML: '',
                        removeChild: function() {}
                    };
                },
                createTextNode: function(text) { return text; }
            },
            module: { exports: {} }
        };

        before(function() {
            libUtils = testUtils.loadAsModule(libUtilsSource, STANDARD_CONTEXT);
        });

        it('should load and export element, inject, and eject', function() {
            assert.isDefined(libUtils.element);
            assert.isFunction(libUtils.inject);
            assert.isFunction(libUtils.eject);
        });

        it('should inject', function() {
            libUtils.inject(css);
            assert.equal(libUtils.element.innerHTML, css);
        });

        it('should eject', function() {
            libUtils.eject(css);
            assert.equal(libUtils.element.innerHTML, '');
        });
    });
});
