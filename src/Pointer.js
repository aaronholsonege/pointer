var Util = require('./Util');
var MouseHandler = require('./handlers/Mouse');
var TouchHandler = require('./handlers/Touch');

/**
 * Bind mouse/touch events to convert to pointer events
 *
 * @class Pointer
 * @type Function
 */
var Pointer =  function() {
    Util
        .on(TouchHandler.events, TouchHandler.onEvent)
        .on(MouseHandler.events, MouseHandler.onEvent);
};

module.exports = Pointer;