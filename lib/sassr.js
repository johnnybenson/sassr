'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var sass = require('node-sass');
var through = require('through2');

var sassDefaults = {
    includePaths: [],
    outputStyle: 'compressed'
};

var sassrTplPath = path.resolve(__dirname, './templates/sassr.tpl.js');
var sassrModuleFn = _.template(fs.readFileSync(sassrTplPath).toString());

var errorTplPath = path.resolve(__dirname, './templates/error.tpl.js');
var errorModuleFn = _.template(fs.readFileSync(errorTplPath).toString());

function transform(file, opts) {
    if (!/\.(scss|css)$/.test(file)) {
        return through();
    }

    var omitFields = ['file', 'data', 'success', 'error'];
    opts = _.omit(_.defaults({}, opts, sassDefaults), omitFields);

    var buffer = '';

    var push = function(chunk, enc, cb) {
        buffer += chunk;
        cb();
    };

    var end = function(cb) {
        var stream = this;
        sass.render(_.defaults({
            data: buffer,
            includePaths: [
                path.dirname(file)
            ].concat(opts.includePaths)
        }, opts), function(err, result) {
            if (err) {
                var message = 'sassr: ' + err + ' in ' + file;

                stream.push(errorModuleFn({
                    message: message
                }));

                stream.emit('error', message);
            } else {
                // JSON.stringify protects the template function from throwing
                // `Unexpected token ILLEGAL`. Slicing the leading and trailing
                // double-quote marks because templates/sassr.tpl.js wraps the
                // string in single-quotes anyway.
                var css = JSON.stringify(result.css.toString()).slice(1, -1);

                stream.push(sassrModuleFn({
                    css: css
                }));
            }

            cb();
        });
    };

    return through(push, end);
}

module.exports = transform;
