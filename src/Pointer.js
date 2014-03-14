define(function(require) {
    'use strict';

    var Watch = require('Watch');
    var Util = require('Util');

    // Initialize Pointer when the page is ready
    var _onReady = function() {
        Util.off('DOMContentLoaded', _onReady, document);
        Util.off('load', _onReady, window);
        Watch.enable();
    };

    if (document.readyState === 'complete') {
        setTimeout(Watch.enable);
    } else {
        Util.on('DOMContentLoaded', _onReady, document);
        Util.on('load', _onReady, window);
    }

});