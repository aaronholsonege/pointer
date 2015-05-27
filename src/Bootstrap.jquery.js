define(function(require) {
    'use strict';

    require('jquery.pointerHooks');

    // If the browser already supports pointer events, do not enable
    if (window.navigator.pointerEnabled === true) {
        return;
    }
    
    require('event/Tracker').init();

    window.jQuery(document).ready(require('Pointer'));
});