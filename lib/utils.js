'use strict';

var element = document.createElement('style');
document.head.appendChild(element);

var urlPattern = /(url(?:\(['|"]?)(.*?)(?:['|"]?\)))/g;
var hostNamePattern = /^\s*(https?:)\/\//;

function insertHost(css, domain) {
    if (!domain) {
        return css;
    }

    return css.replace(urlPattern, function(match, property, path) {
        // Skip if the URL is empty or is already an absolute URL
        if (!path || hostNamePattern.test(path)) {
            return property;
        } else {
            if (path[0] !== '/') {
                path = '/' + path;
            }
            return 'url("' + domain + path + '")';
        }
    });
}

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

var inject = element.styleSheet ? injectOldIe : injectStandard;
var eject = function(css) {
    return inject(element.innerHTML.replace(css, ''));
};

exports.insertHost = insertHost;
exports.element = element;
exports.inject = inject;
exports.eject = eject;
