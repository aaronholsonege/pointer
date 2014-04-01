/**
 * Mouse > touch map
 *
 * @type Object
 * @static
 */
var MAP = {
    mouseover: 'touchover',
    mousedown: 'touchstart',
    mousemove: 'touchend',
    mouseup: 'touchend',
    mouseout: 'touchstart'
};

/**
 * The last triggered touch events to compare mouse
 * events to to determine if they are emulated.
 *
 * @type Object
 * @static
 */
var LAST_EVENTS = {
    touchover: {},
    touchstart: {},
    touchend: {},
    touchout: {}
};

/**
 * Max time between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_TIME = 750;

/**
 * Max x/y distance between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_POSITION = 15;

/**
 * @class Pointer.Event.Tracker
 * @static
 */
var EventTracker = {

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {Event} event
     * @param {String} event.type
     * @param {String} overrideEventName
     * @chainable
     */
    register: function(event, overrideEventName) {
        var eventName = overrideEventName || event.type;

        if (LAST_EVENTS.hasOwnProperty(eventName)) {
            LAST_EVENTS[eventName][event.pointerId] = event;
        }

        return this;
    },

    /**
     * Determine if a mouse event has been emulated
     *
     * @method isEmulated
     * @param {MouseEvent} event
     * @param {String} event.type
     * @returns {Boolean}
     */
    isEmulated: function(event) {
        if (!MAP.hasOwnProperty(event.type)) {
            return false;
        }

        var eventName = MAP[event.type];
        var previousEvent = LAST_EVENTS[eventName];

        if (!previousEvent) {
            return false;
        }

        var pointerId;
        var pointer;

        for (pointerId in previousEvent) {
            if (!previousEvent.hasOwnProperty(pointerId) || !previousEvent[pointerId]) {
                continue;
            }

            pointer = previousEvent[pointerId];

            // Check timestamp delta if `event.type` is not mouseout - mouseout
            // event don't fire until the next touch on touch devices.
            if (event.type !== 'mouseout') {
                var dt = Math.abs(event.timeStamp - pointer.timeStamp);

                // If too much time has passed since the last touch
                // event, remove it so we no longer test against it.
                // Then return false to avoid checking anything else.
                if (dt > DELTA_TIME) {
                    LAST_EVENTS[eventName][pointerId] = null;
                    continue;
                }
            }

            var dx = Math.abs(pointer.pageX - event.pageX);
            var dy = Math.abs(pointer.pageY - event.pageY);

            if (dx <= DELTA_POSITION && dy <= DELTA_POSITION) {
                return true;
            }
        }

        return false;
    }

};

module.exports = EventTracker;