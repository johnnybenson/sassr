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
var OMIT_FIELDS = ['file', 'success', 'error'];
var ERROR_RE = /console\.error\((.*?)\)/;

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

function errorModuleWith(message) {
    return [
        '\'use strict\';',
        '',
        'exports.getStyleElement = function() {',
        '    return null;',
        '};',
        '',
        'exports.getCSSText = function() {',
        '    return \'\';',
        '};',
        '',
        'exports.append = exports.remove = function() {',
        '    console.error(' + message + ');',
        '    return null;',
        '};',
        ''
    ].join('\n');
}

function transformSync(opts) {
    opts = _.defaults(opts, SASS_DEFAULTS);

    var module;
    // JSON.stringify protects against unescaped quotes winding up
    // in the modules that get generated.
    try {
        var result = sass.renderSync(opts);
        module = sassrModuleWith(JSON.stringify(result.css.toString()));
    } catch (error) {
        module = errorModuleWith(JSON.stringify(error.message));
    }

    return module;
}

function sassrSync(file, opts) {
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    opts = _.omit(_.defaults({}, opts, SASS_DEFAULTS), OMIT_FIELDS);

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

        var module = transformSync(opts);
        var error = module.match(ERROR_RE) && module.match(ERROR_RE)[1];

        self.push(module);
        if (error) {
            self.emit('error', error);
        }

        next();
    }

    return through(push, end);
}

function transform(opts, done) {
    opts = _.defaults(opts, SASS_DEFAULTS);

    sass.render(opts, function(error, result) {
        // JSON.stringify protects against unescaped quotes winding up
        // in the modules that get generated.
        var module = (error) ?
            errorModuleWith(JSON.stringify(error.message)) :
            sassrModuleWith(JSON.stringify(result.css.toString()));

        done(error, module);
    });
}

function sassr(file, opts) {
    if (!SASS_EXTENSION_RE.test(file)) {
        return through();
    }

    opts = _.omit(_.defaults({}, opts, SASS_DEFAULTS), OMIT_FIELDS);

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
            if (error) {
                self.emit('error', JSON.stringify(error.message));
            }

            next();
        });
    }

    return through(push, end);
}

sassr.transform = transform;
sassr.transformSync = transformSync;
sassr.sync = sassrSync;

module.exports = sassr;
