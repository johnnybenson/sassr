'use strict';

var element = document.createElement('style');
document.head.appendChild(element);

var inject;
var eject;

function injectIe(css) {
    element.styleSheet.cssText = css;
}

function injectStandard(css) {
    while (element.hasChildNodes()) {
        element.removeChild(element.firstChild);
    }

    element.appendChild(document.createTextNode(css));
}

inject = element.styleSheet ? injectIe : injectStandard;
eject = function(css) {
    return inject(element.innerHTML.replace(css, ''));
};

exports.element = element;
exports.inject = inject;
exports.eject = eject;
