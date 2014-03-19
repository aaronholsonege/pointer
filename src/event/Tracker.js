/**
 * Mouse > touch map
 *
 * @type Object
 * @static
 */
var MAP = {
    mousedown: 'touchstart',
    mouseover: 'touchstart',
    mouseout: 'touchend',
    mouseup: 'touchend'
};

/**
 * The last triggered touch events to compare mouse
 * events to to determine if they are emulated.
 *
 * @type Object
 * @static
 */
var LAST_EVENTS = {
    touchstart: null,
    touchend: null
};

/**
 * Max time between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_TIME = 300;

/**
 * Max x/y distance between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_POSITION = 5;

/**
 * @class Pointer.EventTracker
 * @static
 */
var EventTracker = {

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {MouseEvent|TouchEvent} event
     * @chainable
     */
    register: function(event) {
        if (LAST_EVENTS.hasOwnProperty(event.type)) {
            LAST_EVENTS[event.type] = event;
        }

        return this;
    },

    /**
     * Determine if a mouse event has been emulated
     *
     * @method isEmulated
     * @param {MouseEvent|TouchEvent} event
     * @returns {Boolean}
     */
    isEmulated: function(event) {
        if (!MAP.hasOwnProperty(event.type)) {
            return false;
        }

        var eventName = MAP[event.type];
        var last = LAST_EVENTS[eventName];

        if (!last) {
            return false;
        }

        var touch = last.changedTouches[0];

        var dx = Math.abs(touch.clientX - event.clientX);
        var dy = Math.abs(touch.clientY - event.clientY);
        var dt = Math.abs(last.timeStamp - event.timeStamp);

        return (dx <= DELTA_POSITION && dy <= DELTA_POSITION && dt <= DELTA_TIME);
    }

};

module.exports = EventTracker;