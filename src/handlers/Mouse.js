var Util = require('../Util');
var Controller = require('../Controller');
var TouchHandler = require('./Touch');

/**
 * Event to detect mouseenter events with
 * @type String
 * @static
 * @private
 */
var ENTER_EVENT = 'mouseover';

/**
 * Event to detect mouseleave events with
 * @type String
 * @static
 * @private
 */
var EXIT_EVENT = 'mouseout';

/**
 * Mouse enter/leave event map
 * @type Object
 * @static
 * @private
 */
var ENTER_LEAVE_EVENT_MAP = {
    mouseover: 'mouseenter',
    mouseout: 'mouseleave'
};

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
    var target = event.target;
    var related = event.relatedTarget;
    var eventName = ENTER_LEAVE_EVENT_MAP[event.type];

    if (!related || !Util.contains(target, related)) {
        Controller.trigger(event, eventName);
    }
};

/**
 * @class Pointer.Handler.Mouse
 * @static
 */
var MouseHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: [ENTER_EVENT, 'mousedown', 'mousemove', 'mouseup', EXIT_EVENT],

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
        if (!TouchHandler.touching) {

            // trigger mouseenter event if applicable
            if (ENTER_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }

            Controller.trigger(event);

            // trigger mouseleave event if applicable
            if (EXIT_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }
        }
    }

};

module.exports = MouseHandler;