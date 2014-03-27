var Pointer = require('./Pointer');
var Util = require('./Util');

// If the browser already supports pointer events, do not enable
if (window.navigator.pointerEnabled === true) {
    return;
}

// Initialize Pointer when the page is ready
var _onReady = function() {
    Util
        .off('DOMContentLoaded', _onReady, document)
        .off('load', _onReady, window);

    Pointer.enable();
};

if (document.readyState === 'complete') {
    // keep the script kickoff on an async thread
    setTimeout(Pointer.enable);
} else {
    Util
        .on('DOMContentLoaded', _onReady, document)
        .on('load', _onReady, window);
}