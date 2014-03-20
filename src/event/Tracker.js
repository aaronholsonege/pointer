/**
 * Mouse > touch map
 *
 * @type Object
 * @static
 */
var MAP = {
    mouseenter: 'touchenter',
    mouseover: 'touchover',
    mousedown: 'touchstart',
    mouseup: 'touchend',
    mouseout: 'touchout',
    mouseleave: 'touchleave'
};

/**
 * The last triggered touch events to compare mouse
 * events to to determine if they are emulated.
 *
 * @type Object
 * @static
 */
var LAST_EVENTS = {
    touchenter: null,
    touchover: null,
    touchstart: null,
    touchend: null,
    touchout: null,
    touchleave: null
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
 * @class Pointer.Event.Tracker
 * @static
 */
var EventTracker = {

    /**
     * The last event target
     *
     * @property lastTarget
     * @type HTMLElement|null
     */
    lastTarget: null,

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {MouseEvent|TouchEvent} event
     * @param {String} overrideEventName
     * @chainable
     */
    register: function(event, overrideEventName) {
        var eventName = overrideEventName || event.type;

        if (LAST_EVENTS.hasOwnProperty(eventName)) {
            LAST_EVENTS[eventName] = event;
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

        var dx = Math.abs(touch.pageX - event.pageX);
        var dy = Math.abs(touch.pageY - event.pageY);
        var dt = Math.abs(last.timeStamp - event.timeStamp);

        // If too much time has passed since the last touch
        // event, remove it so we no longer test against it.
        if (dt > DELTA_TIME) {
            LAST_EVENTS[eventName] = null;
        }

        return (dx <= DELTA_POSITION && dy <= DELTA_POSITION && dt <= DELTA_TIME);
    }

};

module.exports = EventTracker;