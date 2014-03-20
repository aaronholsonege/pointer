var Util = require('../Util');
var PointerEvent = require('../PointerEvent');
var EventTracker = require('../event/Tracker');

/**
 * Event to detect touchenter events with
 *
 * @type String
 * @static
 */
var ENTER_EVENT = 'touchstart';

/**
 * Determine if we have moused over a new target.
 * Browsers implementation of mouseenter/mouseleave is shaky, so we are manually detecting it.
 *
 * @param {MouseEvent} event
 * @param {Element} lastTarget
 * @private
 */
var _detectMouseEnterOrLeave = function(event, lastTarget) {
    var target = event.target;
    var related = lastTarget || event.relatedTarget;

    if (related && related !== target) {
        EventTracker.register(event, 'touchout');
        PointerEvent.trigger(event, 'touchout', related);
    }

    if (related && (related !== target && !Util.contains(related, target))) {
        EventTracker.register(event, 'touchleave');
        PointerEvent.trigger(event, 'touchleave', related);
    }

    if (!related || (related !== target && !Util.contains(target, related))) {
        EventTracker.register(event, 'touchenter');
        PointerEvent.trigger(event, 'touchenter');
    }

    if (related !== target) {
        EventTracker.register(event, 'touchover');
        PointerEvent.trigger(event, 'touchover');
    }
};

/**
 * @class Pointer.Capture.Touch
 * @type Object
 * @static
 */
var TouchCapture = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: ['touchstart' ,'touchmove', 'touchend', 'touchcancel'],

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
     * Register event (for mouse simulation detection) and convert to pointer
     *
     * @method onEvent
     * @param {TouchEvent} event
     * @callback
     */
    onEvent: function(event) {
        EventTracker.register(event);

        if (event.type === ENTER_EVENT) {
            _detectMouseEnterOrLeave(event, EventTracker.lastTarget);
        }

        PointerEvent.trigger(event);

        EventTracker.lastTarget = event.target;
    }

};

module.exports = TouchCapture;