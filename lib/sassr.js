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

function compile(opts) {
    var omitFields = ['file', 'success', 'error'];
    opts = _.omit(_.defaults({}, opts, SASS_DEFAULTS), omitFields);

    var css = sass.renderSync(opts).css.toString();

    return css;
}

function transform(src, opts) {
    if (!opts) { opts = {}; }

    var compiled;
    try {
        // JSON.stringify protects the template function from throwing
        // `Unexpected token ILLEGAL`. Slicing the leading and trailing
        // double-quote marks because templates/sassr.tpl.js wraps the
        // string in single-quotes anyway.
        compiled = sassrModuleFn({
            css: JSON.stringify(compile(src, opts)).slice(1, -1)
        });
    } catch (e) {
        compiled = errorModuleFn({
            message: e.message
        });
    }

    return compiled;
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
        var src = Buffer.concat(buffers).toString();

        try {
            this.push(transform(_.defaults({
                data: src,
                includePaths: [
                    path.dirname(file)
                ].concat(opts.includePaths)
            }, opts)));
        } catch (e) {
            this.emit('error', e);
            return;
        }

        next();
    }

    return through(push, end);
}

// function transform(file, opts) {
//     if (!/\.(scss|css)$/.test(file)) {
//         return through();
//     }

//     var omitFields = ['file', 'data', 'success', 'error'];
//     opts = _.omit(_.defaults({}, opts, sassDefaults), omitFields);

//     var buffer = '';

//     var push = function(chunk, enc, cb) {
//         buffer += chunk;
//         cb();
//     };

//     var end = function(cb) {
//         var stream = this;
//         sass.render(_.defaults({
//             data: buffer,
//             includePaths: [
//                 path.dirname(file)
//             ].concat(opts.includePaths)
//         }, opts), function(err, result) {
//             if (err) {
//                 var message = 'sassr: ' + err + ' in ' + file;

//                 stream.push(errorModuleFn({
//                     message: message
//                 }));

//                 stream.emit('error', message);
//             } else {
//                 // JSON.stringify protects the template function from throwing
//                 // `Unexpected token ILLEGAL`. Slicing the leading and trailing
//                 // double-quote marks because templates/sassr.tpl.js wraps the
//                 // string in single-quotes anyway.
//                 var css = JSON.stringify(result.css.toString()).slice(1, -1);

//                 stream.push(sassrModuleFn({
//                     css: css
//                 }));
//             }

//             cb();
//         });
//     };

//     return through(push, end);
// }

module.exports = sassr;
module.exports.compile = compile;
module.exports.transform = transform;
