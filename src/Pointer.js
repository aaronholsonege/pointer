var Watch = require('./Watch');
var Util = require('./Util');

// Initialize Pointer when the page is ready
var _onReady = function() {
    Util
        .off('DOMContentLoaded', _onReady, document)
        .off('load', _onReady, window);
    Watch.enable();
};

if (document.readyState === 'complete') {
    setTimeout(Watch.enable);
} else {
    Util
        .on('DOMContentLoaded', _onReady, document)
        .on('load', _onReady, window);
}