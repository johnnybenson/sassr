'use strict';

var path = require('path');

var _ = require('lodash');
var sass = require('node-sass');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var through = require('through2');

var SASS_EXTENSION_RE = /\.(css|scss)$/;
var SASS_DEFAULTS = {
    includePaths: [],
    outputStyle: 'compressed'
};
var AUTOPREFIXER_DEFAULTS = {};

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

function transformSync(sassOpts, autoprefixerOpts) {
    sassOpts = _.extend({}, SASS_DEFAULTS, sassOpts);
    autoprefixerOpts = _.extend({}, AUTOPREFIXER_DEFAULTS, autoprefixerOpts);

    var result = sass.renderSync(sassOpts);
    var css = result.css.toString();
    css = postcss( [autoprefixer(autoprefixerOpts)] ).process(css).css;

    // JSON.stringify protects against unescaped quotes winding up
    // in the modules that get generated.
    return sassrModuleWith(JSON.stringify(css));
}

function sassrSync(file, opts) {
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    opts = opts || {};
    var sassOpts = _.extend({}, SASS_DEFAULTS, opts.sass);
    var autoprefixerOpts = _.extend({}, AUTOPREFIXER_DEFAULTS, opts.autoprefixer);

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
        ].concat(sassOpts.includePaths);

        sassOpts = _.defaults({
            data: src,
            includePaths: paths
        }, opts);

        try {
            self.push(transformSync(sassOpts, autoprefixerOpts));
            next();
        } catch (error) {
            self.emit('error', JSON.stringify(error.message));
        }
    }

    return through(push, end);
}

function transform(sassOpts, autoprefixerOpts, done) {
    sassOpts = _.extend({}, SASS_DEFAULTS, sassOpts);
    autoprefixerOpts = _.defaults({}, AUTOPREFIXER_DEFAULTS, autoprefixerOpts);

    sass.render(sassOpts, function(error, result) {
        if (error) {
            return done(error);
        }

        postcss( [autoprefixer(autoprefixerOpts)] )
            .process(result.css.toString())
            .then(function(result) {
                // JSON.stringify protects against unescaped quotes winding up
                // in the modules that get generated.
                done(error, sassrModuleWith(JSON.stringify(result.css)));
            });
    });
}

function sassr(file, opts) {
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    opts = opts || {};
    var sassOpts = _.extend({}, SASS_DEFAULTS, opts.sass);
    var autoprefixerOpts = _.extend({}, AUTOPREFIXER_DEFAULTS, opts.autoprefixer);

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
        ].concat(sassOpts.includePaths);

        sassOpts = _.defaults({
            data: src,
            includePaths: paths
        }, sassOpts);

        transform(sassOpts, autoprefixerOpts, function(error, module) {
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
