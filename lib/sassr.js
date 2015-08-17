'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var sass = require('node-sass');
var through = require('through2');

var SASS_EXTENSION_RE = /\.(css|scss)$/;
var SASS_DEFAULTS = {
    includePaths: [],
    outputStyle: 'compressed'
};

var sassrTplPath = path.resolve(__dirname, './templates/sassr.tpl.js');
var sassrModuleFn = _.template(fs.readFileSync(sassrTplPath).toString());

var errorTplPath = path.resolve(__dirname, './templates/error.tpl.js');
var errorModuleFn = _.template(fs.readFileSync(errorTplPath).toString());

function transformSync(opts) {
    var omitFields = ['file', 'success', 'error'];
    opts = _.omit(_.defaults({}, opts, SASS_DEFAULTS), omitFields);

    var compiled;
    try {
        var result = sass.renderSync(opts);
        // JSON.stringify protects the template function from throwing
        // `Unexpected token ILLEGAL`. Slicing the leading and trailing
        // double-quote marks because templates/sassr.tpl.js wraps the
        // string in single-quotes anyway.
        compiled = sassrModuleFn({
            css: JSON.stringify(result.css.toString()).slice(1, -1)
        });
    } catch (e) {
        compiled = errorModuleFn({
            message: e.message
        });
    }

    return compiled;
}

function sassrSync(file, opts) {
    /* jshint validthis: true */
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    var buffers = [];

    function push(chunk, enc, next) {
        buffers.push(chunk);
        next();
    }

    function end(next) {
        var src = Buffer.concat(buffers).toString();
        var paths = [
            path.dirname(file)
        ].concat(opts.includePaths);

        opts = _.defaults({
            data: src,
            includePaths: paths
        }, opts);

        try {
            this.push(transformSync(opts));
        } catch (e) {
            this.emit('error', e);
            return;
        }

        next();
    }

    return through(push, end);
}

function transform(opts, cb) {
    var omitFields = ['file', 'success', 'error'];
    opts = _.omit(_.defaults({}, opts, SASS_DEFAULTS), omitFields);

    sass.render(opts, function(error, result) {
        var module;
        var errMessage = (error) ? error.message : '';

        if (error) {
            module = errorModuleFn({
                message: error.message
            });
        } else {
            // JSON.stringify protects the template function from throwing
            // `Unexpected token ILLEGAL`. Slicing the leading and trailing
            // double-quote marks because templates/sassr.tpl.js wraps the
            // string in single-quotes anyway.
            module = sassrModuleFn({
                css: JSON.stringify(result.css.toString()).slice(1, -1)
            });
        }

        cb(errMessage, module);
    });
}

function sassr(file, opts) {
    /* jshint validthis: true */
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    var buffers = [];

    function push(chunk, enc, next) {
        buffers.push(chunk);
        next();
    }

    function end(next) {
        var self = this;
        var src = Buffer.concat(buffers).toString();
        var paths = [
            path.dirname(file)
        ].concat(opts.includePaths);

        opts = _.defaults({
            data: src,
            includePaths: paths
        }, opts);

        transform(opts, function(errMessage, module) {
            if (errMessage) {
                self.emit('error', errMessage);
            }
            self.push(module);
            next();
        });
    }

    return through(push, end);
}

module.exports = sassr;
module.exports.transform = transform;

module.exports.sync = sassrSync;
module.exports.transformSync = transformSync;
