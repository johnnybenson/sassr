'use strict';

var vm = require('vm');

var DEFAULT_CONTEXT = {
    require: function() { return {}; },
    module: { exports: {} }
};

function loadAsModule(source, context) {
    if (!context) { context = DEFAULT_CONTEXT; }
    context.exports = context.module.exports;
    vm.runInNewContext(source, context);
    return context.module.exports;
}

exports.DEFAULT_CONTEXT = DEFAULT_CONTEXT;
exports.loadAsModule = loadAsModule;
