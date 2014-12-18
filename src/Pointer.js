define(function(require) {
    'use strict';

    var Util = require('./Util');
    var MouseHandler = require('./handlers/Mouse');
    var TouchHandler = require('./handlers/Touch');

    /**
     * @type Navigator
     */
    var navigator = window.navigator;

    /**
     * Bind mouse/touch events to convert to pointer events
     *
     * @class Pointer
     * @type Function
     */
    return function() {
        navigator.maxTouchPoints = 10;

        Util
            .on(TouchHandler.events, TouchHandler.onEvent)
            .on(MouseHandler.events, MouseHandler.onEvent);
    };

});