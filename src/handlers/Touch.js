var Util = require('../Util');
var Controller = require('../Controller');
var EventTracker = require('../event/Tracker');

/**
 * Event to detect touchenter events with
 *
 * @type String
 * @static
 */
var ENTER_EVENT = 'touchstart';

/**
 * Custome enter/over/out/leave touch events names
 *
 * @type Object
 * @static
 */
var EVENTS = {
    OUT: 'touchout',
    LEAVE: 'touchleave',
    ENTER: 'touchenter',
    OVER: 'touchover'
};

/**
 * Determine if we have touched over a new target.
 *
 * @param {MouseEvent} event
 * @param {Element} lastTarget
 * @private
 */
var _detectMouseEnterOrLeave = function(event, lastTarget) {
    var target = event.target;

    // Emulate touchout
    if (lastTarget && lastTarget !== target) {
        EventTracker.register(event, EVENTS.OUT);
        Controller.trigger(event, EVENTS.OUT, lastTarget);
    }

    // Emulate touchleave
    if (lastTarget && !Util.contains(lastTarget, target)) {
        EventTracker.register(event, EVENTS.LEAVE);
        Controller.trigger(event, EVENTS.LEAVE, lastTarget);
    }

    // Emulate touchenter
    if (!lastTarget || !Util.contains(target, lastTarget)) {
        EventTracker.register(event, EVENTS.ENTER);
        Controller.trigger(event, EVENTS.ENTER);
    }

    // Emulate touchover
    if (lastTarget !== target) {
        EventTracker.register(event, EVENTS.OVER);
        Controller.trigger(event, EVENTS.OVER);
    }
};

/**
 * @class Pointer.Handler.Touch
 * @type Object
 * @static
 */
var TouchHandler = {

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

        Controller.trigger(event);

        EventTracker.lastTarget = event.target;
    }

};

module.exports = TouchHandler;