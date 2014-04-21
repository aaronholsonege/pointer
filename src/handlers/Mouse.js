var Util = require('../Util');
var Events = require('../event/Events').MOUSE;
var Controller = require('../Controller');
var Tracker = require('../event/Tracker');

/**
 * Mouse event names
 *
 * @type String
 * @static
 * @private
 */
var EVENT_ENTER = Events[0];
var EVENT_OVER = Events[1];
var EVENT_DOWN = Events[2];
var EVENT_MOVE = Events[3];
var EVENT_UP = Events[4];
var EVENT_OUT = Events[5];
var EVENT_LEAVE = Events[6];

/**
 * Determine if we have moused over a new target.
 * Browsers implementation of mouseenter/mouseleave is shaky, so we are manually detecting it.
 *
 * @param {MouseEvent} event
 * @param {String} event.type
 * @param {Element} event.target
 * @param {Element} event.relatedTarget
 * @private
 */
var _detectMouseEnterOrLeave = function(event) {
    var target = event.target || event.srcElement;
    var related = event.relatedTarget;
    var eventName = event.type === EVENT_OVER ? EVENT_ENTER : EVENT_LEAVE;

    if (!related || !Util.contains(target, related)) {
        Controller.trigger(event, eventName);
    }
};

/**
 * @class Handler.Mouse
 * @static
 */
var MouseHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: [EVENT_OVER, EVENT_DOWN, EVENT_MOVE, EVENT_UP, EVENT_OUT],

    /**
     * If event is not simulated, convert to pointer
     *
     * @method onEvent
     * @param {MouseEvent} event
     * @param {String} event.type
     * @param {Element} event.target
     * @param {Element} event.relatedTarget
     * @callback
     */
    onEvent: function(event) {
        if (!Tracker.isEmulated(event)) {

            // trigger mouseenter event if applicable
            if (EVENT_OVER === event.type) {
                _detectMouseEnterOrLeave(event);
            }

            Controller.trigger(event);

            // trigger mouseleave event if applicable
            if (EVENT_OUT === event.type) {
                _detectMouseEnterOrLeave(event);
            }
        }
    }

};

module.exports = MouseHandler;