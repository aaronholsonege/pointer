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
 * Max time between touch and simulated mouse event (3 seconds)
 *
 * We only use this to expire a touch event - after 3 seconds,
 * no longer use this event when detecting simulated events.
 *
 * @type Number
 * @static
 */
var DELTA_TIME = 3000;

/**
 * @class Event.Tracker
 * @static
 */
var EventTracker = {

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {Event} event
     * @param {String} event.type
     * @param {String} [overrideEventName]
     * @param {Element} [target]
     * @chainable
     */
    register: function(event, overrideEventName, target) {
        var eventName = overrideEventName || event.type;

        if (LAST_EVENTS.hasOwnProperty(eventName)) {
            LAST_EVENTS[eventName][event.pointerId] = {
                timeStamp: event.timeStamp,
                x: event.clientX,
                y: event.clientY,
                target: target || event.target
            };
        }

        return this;
    },

    /**
     * Flag for if the mouse button is currently active
     *
     * @property isMouseActive
     * @type Boolean
     * @default false
     */
    isMouseActive: false,

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

            // If too much time has passed since the last touch
            // event, remove it so we no longer test against it.
            if (Math.abs(event.timeStamp - pointer.timeStamp) > DELTA_TIME) {
                LAST_EVENTS[eventName][pointerId] = null;
                continue;
            }

            var target = event.target;

            // If this is a mouseout event, compare the related target
            // instead which is the element that previously had focus for touchstart
            if (event.type === 'mouseout') {
                target = event.relatedTarget;
            }

            if (
                pointer.target === target
                && pointer.x === event.clientX
                && pointer.y === event.clientY
            ) {
                return true;
            }
        }

        return false;
    }

};

module.exports = EventTracker;