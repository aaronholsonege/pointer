require(['Pointer', 'event/Tracker'], function(Pointer, EventTracker) {
    'use strict';

    // If the browser already supports pointer events, do not enable
    if (window.navigator.pointerEnabled === true) {
        return;
    }
    
    EventTracker.init();

    window.jQuery(document).ready(Pointer);
});