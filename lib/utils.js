'use strict';

var element = document.createElement('style');
document.head.appendChild(element);

var inject;
var eject;

function injectOldIe(css) {
    element.styleSheet.cssText = css;
}

function injectStandard(css) {
    while (element.hasChildNodes()) {
        // Just want to make sure that the CSS passed in, is all that winds up here.
        element.removeChild(element.firstChild);
    }

    element.appendChild(document.createTextNode(css));
}

inject = element.styleSheet ? injectOldIe : injectStandard;
eject = function(css) {
    return inject(element.innerHTML.replace(css, ''));
};

exports.element = element;
exports.inject = inject;
exports.eject = eject;
