var Util = require('../Util');
var PointerEvent = require('../PointerEvent');
var EventTracker = require('../event/Tracker');

/**
 * Event to detect mouseenter events with
 * @type String
 * @static
 */
var ENTER_EVENT = 'mouseover';

/**
 * Event to detect mouseleave events with
 * @type String
 * @static
 */
var EXIT_EVENT = 'mouseout';

/**
 * Mouse enter/leave event map
 * @type Object
 * @static
 */
var ENTER_LEAVE_EVENT_MAP = {
    mouseover: 'mouseenter',
    mouseout: 'mouseleave'
};

/**
 * Cached array
 *
 * @type Array
 * @static
 */
var CACHED_ARRAY = [];

/**
 * Determine if `child` is a descendant of `target`
 *
 * @param {Element} target
 * @param {Element} child
 * @return {Boolean}
 * @private
 */
var _contains = function(target, child) {
    if (target.contains) {
        return target.contains(child);
    } else {
        CACHED_ARRAY.length = 0;
        var current = child;

        while(current = current.parentNode) {
            CACHED_ARRAY.push(current);
        }

        return Util.indexOf(CACHED_ARRAY, target) !== -1;
    }
};

/**
 * Determine if we have moused over a new target.
 * Browsers implementation of mouseenter/mouseleave is shaky, so we are manually detecting it.
 *
 * @param {MouseEvent} event
 * @private
 */
var _detectMouseEnterOrLeave = function(event) {
    var target = event.target;
    var related = event.relatedTarget;
    var eventName = ENTER_LEAVE_EVENT_MAP[event.type];

    if (!related || (related !== target && !_contains(target, related))) {
        PointerEvent.trigger(event, eventName);
    }
};

/**
 * @class Pointer.Capture.Mouse
 * @type Object
 * @static
 */
var MouseCapture = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: ['mouseover', 'mousedown', 'mousemove', 'mouseup', 'mouseout'],

    /**
     * Enable event listeners
     *
     * @method enable
     */
    enable: function() {
        Util.on(this.events, this.onEvent);
    },

    /**
     * Disable event listeners
     *
     * @method disable
     */
    disable: function() {
        Util.off(this.events, this.onEvent);
    },

    /**
     * If event is not simulated, convert to pointer
     *
     * @method onEvent
     * @param {MouseEvent} event
     * @callback
     */
    onEvent: function(event) {
        if (!EventTracker.isEmulated(event)) {
            // trigger mouseenter event if applicable
            if (ENTER_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }

            PointerEvent.trigger(event);

            // trigger mouseleave event if applicable
            if (EXIT_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }
        }
    }

};

module.exports = MouseCapture;