define(function(require) {
    'use strict';

    var Watch = require('Watch');

    // Initialize Pointer when the page is ready
    var _onReady = function() {
        document.removeEventListener('DOMContentLoaded', _onReady, false);
        window.removeEventListener('load', _onReady, false);
        Watch.enable();
    };

    if (document.readyState === 'complete') {
        setTimeout(Watch.enable);
    } else {
        document.addEventListener('DOMContentLoaded', _onReady, false);
        window.addEventListener('load', _onReady, false);
    }

});