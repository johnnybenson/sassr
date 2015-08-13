/* globals describe, before, beforeEach, after, it */
'use strict';

var assert = require('chai').assert;
var jsdom = require('jsdom').jsdom;

describe('style-element-helper', function() {
    var style;
    var css = 'div{display:block;}';

    before(function() {
        global.document = jsdom('<html><head></head><body></body></html>');
        global.window = global.document.parentWindow;
        global.navigator = global.window.navigator;
    });

    beforeEach(function() {
        var head = document.head;
        while (head.hasChildNodes()) {
            head.removeChild(head.firstChild);
        }

        // Need to delete the module from the cache, so that it's re-evaluated each test.
        var stylePath = '../../lib/style-element-helper';
        delete require.cache[require.resolve(stylePath)];
        style = require(stylePath);
    });

    after(function (done) {
        delete global.document;
        delete global.window;
        delete global.navigator;
        done();
    });

    describe('#element', function() {
        it('should give you an HTMLStyleElement', function() {
            assert.instanceOf(style.element, window.HTMLStyleElement);
        });

        it('should be in the head', function() {
            /**
             * It appears this was implemented incorrectly in jsdom@3 and never back-ported.
             * `Node.contains` should return a `boolean`, but instead returns the expected
             * value of `Node.compareDocumentPosition`.
             *
             * @see: https://github.com/tmpvar/jsdom/issues/777
             * @see: https://developer.mozilla.org/en-US/docs/Web/API/Node/contains
             * @see: https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
             */
            var actual = document.head.contains(style.element);
            var expected = document.DOCUMENT_POSITION_CONTAINED_BY;

            // console.log(document.childNodes[0].outerHTML);
            assert.equal(actual, expected);
        });
    });

    describe('#inject', function() {
        it('should accept one argument', function() {
            assert.equal(style.inject.length, 1);
        });

        it('should inject CSS into the document\'s head', function() {
            style.inject(css);
            assert.equal(style.element.textContent, css);
        });
    });

    describe('#eject', function() {
        it('should accept one argument', function() {
            assert.equal(style.eject.length, 1);
        });

        it('should eject CSS from the document\'s head', function() {
            style.eject(css);
            assert.equal(style.element.textContent, '');
        });
    });
});
