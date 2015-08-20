'use strict';

var fs = require('fs');

var sassr = require('./');
var registered = false;

var DEFAULT_EXTENSIONS = ['.css', '.scss'];

function stripBOM(content) {
  return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
}

module.exports = function(opts) {
    if (registered) { return; }
    if (!opts) { opts = {}; }

    var extensions = opts.extensions || DEFAULT_EXTENSIONS;

    function compile(module, file) {
        opts.data = stripBOM(fs.readFileSync(file, 'utf8'));
        var transformed = sassr.transformSync(opts);
        module._compile(transformed, file);
    }

    extensions.forEach(function(ext) { require.extensions[ext] = compile; });
    registered = true;
};
