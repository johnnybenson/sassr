'use strict';

var path = require('path');

var _ = require('lodash');
var sass = require('node-sass');
var through = require('through2');

var SASS_EXTENSION_RE = /\.(css|scss)$/;
var SASS_DEFAULTS = {
    includePaths: [],
    outputStyle: 'compressed'
};

function sassrModuleWith(css) {
    return [
        '\'use strict\';',
        '',
        'var utils = require(\'sassr/lib/utils\');',
        'var css = ' + css + ';',
        'var appended;',
        '',
        'exports.getStyleElement = function() {',
        '    return utils.element;',
        '};',
        '',
        'exports.getCSSText = function() {',
        '    return css;',
        '};',
        '',
        'exports.append = function() {',
        '    if (!appended) {',
        '        utils.inject(css);',
        '        appended = true;',
        '    }',
        '',
        '    return utils.element;',
        '};',
        '',
        'exports.remove = function() {',
        '    if (appended) {',
        '        utils.eject(css);',
        '        appended = false;',
        '    }',
        '',
        '    return utils.element;',
        '};',
        ''
    ].join('\n');
}

function transformSync(opts) {
    opts = _.defaults(opts, SASS_DEFAULTS);

    // JSON.stringify protects against unescaped quotes winding up
    // in the modules that get generated.
    return sassrModuleWith(JSON.stringify(sass.renderSync(opts).css.toString()));
}

function sassrSync(file, opts) {
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    opts = _.extend({}, SASS_DEFAULTS, opts);

    var buffers = [];

    function push(chunk, encoding, next) {
        buffers.push(chunk);
        next();
    }

    function end(next) {
        /* jshint validthis: true */
        var self = this;
        var src = Buffer.concat(buffers).toString();
        var paths = [
            path.dirname(file)
        ].concat(opts.includePaths);

        opts = _.defaults({
            data: src,
            includePaths: paths
        }, opts);

        try {
            self.push(transformSync(opts));
            next();
        } catch (error) {
            self.emit('error', JSON.stringify(error.message));
        }
    }

    return through(push, end);
}

function transform(opts, done) {
    opts = _.extend({}, SASS_DEFAULTS, opts);

    sass.render(opts, function(error, result) {
        if (error) {
            return done(error);
        }

        // JSON.stringify protects against unescaped quotes winding up
        // in the modules that get generated.
        done(error, sassrModuleWith(JSON.stringify(result.css.toString())));
    });
}

function sassr(file, opts) {
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    opts = _.extend({}, SASS_DEFAULTS, opts);

    var buffers = [];

    function push(chunk, encoding, next) {
        buffers.push(chunk);
        next();
    }

    function end(next) {
        /* jshint validthis: true */
        var self = this;
        var src = Buffer.concat(buffers).toString();
        var paths = [
            path.dirname(file)
        ].concat(opts.includePaths);

        opts = _.defaults({
            data: src,
            includePaths: paths
        }, opts);

        transform(opts, function(error, module) {
            self.push(module);
            if (!error) {
                self.push(module);
                next();
            } else {
                self.emit('error', JSON.stringify(error.message));
            }
        });
    }

    return through(push, end);
}

sassr.transform = transform;
sassr.transformSync = transformSync;
sassr.sync = sassrSync;

module.exports = sassr;
