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
    opts = _.extend({}, SASS_DEFAULTS, opts);

    var css = sass.renderSync(opts).css.toString();

    if (_.isFunction(opts.transformCSS)) {
        css = opts.transformCSS(css);

        if (!_.isString(css)) {
            throw new Error('To use transformCSS synchronously, you must return a string, NOT provide a callback!');
        }
    }

    // JSON.stringify protects against unescaped quotes winding up
    // in the modules that get generated.
    return sassrModuleWith(JSON.stringify(css));
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
        // jshint validthis: true
        var self = this;

        opts.includePaths.unshift(path.dirname(file));
        opts.data = Buffer.concat(buffers).toString();

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
            done(error);
            return;
        }

        var onDoneCallback = function(error, css) {
            if (error) {
                done(error);
                return;
            }

            // JSON.stringify protects against unescaped quotes winding up
            // in the modules that get generated.
            done(error, sassrModuleWith(JSON.stringify(css)));
        };

        var css = result.css.toString();
        if (_.isFunction(opts.transformCSS)) {
            opts.transformCSS(css, onDoneCallback);
        } else {
            onDoneCallback(error, css);
        }
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
        // jshint validthis: true
        var self = this;

        opts.includePaths.unshift(path.dirname(file));
        opts.data = Buffer.concat(buffers).toString();

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
