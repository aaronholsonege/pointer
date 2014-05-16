var Pointer = require('./Pointer');
var EventTracker = require('./event/Tracker');

// If the browser already supports pointer events, do not enable
if (window.navigator.pointerEnabled === true) {
    return;
}

EventTracker.init();

window.jQuery(document).ready(Pointer);