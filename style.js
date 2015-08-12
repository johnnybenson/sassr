'use strict';

var style = document.createElement('style');
document.head.appendChild(style);

var inject = style.styleSheet ?
    function(css) {
        style.styleSheet.cssText = css;
    } : function(css) {
        while (style.firstChild) style.removeChild(style.firstChild);
        style.appendChild(document.createTextNode(css));
    };

var eject = function(css) {
    return inject( style.innerHTML.replace(css, '') );
};

module.exports.style = style;
module.exports.inject = inject;
module.exports.eject = eject;
