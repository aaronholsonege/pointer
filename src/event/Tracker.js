var Adapter = require('adapter/event');
var Util = require('../Util');

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
 * events with to determine if they are emulated.
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
 * Pointer capture targets
 *
 * @type Object
 * @static
 */
var TARGET_LOCKS = {};

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

var CAPTURE_DATA = { cancelable: false };

/**
 * @class Event.Tracker
 * @static
 */
module.exports = {

    /**
     * Create capture and release methods on Element prototype
     *
     * @method init
     */
    init: function() {
        var el = window.Element;
        var proto;

        if (!el) {
            proto = window._IEEL = {};
        } else {
            proto = el.prototype;
        }

        proto.setPointerCapture = this.capturePointer;
        proto.releasePointerCapture = this.releasePointer;
    },

    /**
     * Capture pointer target
     *
     * @method capturePointer
     * @param {String} pointerId
     */
    capturePointer: function(pointerId) {
        TARGET_LOCKS[pointerId] = this;

        var event = Adapter.create('gotpointercapture', null, CAPTURE_DATA);
        Adapter.trigger(event, this);
    },

    /**
     * Release pointer target
     *
     * @method releasePointer
     * @param {String} pointerId
     */
    releasePointer: function(pointerId) {
        var lastTarget = TARGET_LOCKS[pointerId];
        TARGET_LOCKS[pointerId] = null;

        if (lastTarget) {
            var event = Adapter.create('lostpointercapture', null, CAPTURE_DATA);
            Adapter.trigger(event, lastTarget);
        }
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
     * Has the browser event dispatched a touch event yet?
     * Used to determine if the Mouse Handler should event call isSimulated
     *
     * @property hasTouched
     * @type Boolean
     * @default false
     */
    hasTouched: false,

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
                timeStamp: Util.now(),
                x: event.clientX,
                y: event.clientY,
                target: target || event.target
            };
            this.hasTouched = true;
        }

        return this;
    },

    /**
     * Get captured target
     *
     * @method getTarget
     * @param {Event|String} pointerEvent
     * @param {String} [pointerEvent.pointerId]
     * @returns {null|Element}
     */
    getTarget: function(pointerEvent) {
        return TARGET_LOCKS[pointerEvent.pointerId || pointerEvent];
    },

    /**
     * Determine if a mouse event is simulated
     *
     * @method isSimulated
     * @param {MouseEvent} event
     * @param {String} event.type
     * @returns {Boolean}
     */
    isSimulated: function(event) {
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
        var now = Util.now();
        var target = Util.getTarget(event);

        // If this is a mouseout event, compare the related target
        // instead which is the element that previously had focus for touchstart
        if (event.type === 'mouseout') {
            target = event.relatedTarget;
        }

        for (pointerId in previousEvent) {
            if (!previousEvent.hasOwnProperty(pointerId) || !previousEvent[pointerId]) {
                continue;
            }

            pointer = previousEvent[pointerId];

            // If too much time has passed since the last touch
            // event, remove it so we no longer test against it.
            if (Math.abs(now - pointer.timeStamp) > DELTA_TIME) {
                LAST_EVENTS[eventName][pointerId] = null;
                continue;
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
