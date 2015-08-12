/* global describe, before, it */
'use strict';

var assert = require('chai').assert;

describe('global', function () {
    before(function (done) {
        delete global.window;
        delete global.document;
        delete global.navigator;
        done();
    });

    it('should *NOT* have a window', function (/*done*/) {
        assert.isUndefined(global.window);
    });

    it('should *NOT* have a document', function (/*done*/) {
        assert.isUndefined(global.document);
    });

    it('should *NOT* have a navigator', function (/*done*/) {
        assert.isUndefined(global.navigator);
    });
});
