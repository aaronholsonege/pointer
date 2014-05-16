var Events = require('../event/Events').MOUSE;
var Tracker = require('../event/Tracker');

var trigger = require('../Controller').trigger;

/**
 * Mouse event names
 *
 * @type String
 * @static
 * @private
 */
var EVENT_OVER = Events[1];
var EVENT_DOWN = Events[2];
var EVENT_MOVE = Events[3];
var EVENT_UP = Events[4];
var EVENT_OUT = Events[5];

/**
 * @class Handler.Mouse
 * @static
 */
module.exports = {

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
        if (Tracker.hasTouched && Tracker.isSimulated(event)) {
            // Add a simulated flag because hey, why not
            try {
                event._isSimulated = true;
            } catch(e) {}

            return;
        }

        trigger(event);
    }

};