require(['Pointer'], function(Pointer) {
    'use strict';

    // If the browser already supports pointer events, do not enable
    if (window.navigator.pointerEnabled === true) {
        return;
    }

    window.jQuery(document).ready(Pointer);
});