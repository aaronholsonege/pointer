define(function(require) {
    'use strict';

    // If the browser already supports pointer events, do not enable
    if (window.navigator.pointerEnabled === true) {
        return;
    }
    
    require('event/Tracker').init();

    // Initialize Pointer when the page is ready
    var _onReady = function() {
        require('Util')
            .off('DOMContentLoaded', _onReady, document)
            .off('load', _onReady, window);

        require('Pointer')();
    };

    if (document.readyState === 'complete') {
        // keep the script kickoff on an async thread
        window.setTimeout(require('Pointer'));
    } else {
        require('Util')
            .on('DOMContentLoaded', _onReady, document)
            .on('load', _onReady, window);
    }
});