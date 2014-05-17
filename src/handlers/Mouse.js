var Events = require('../event/Events').MOUSE;
var Tracker = require('../event/Tracker');

var _on = require('../Util').on;
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
 * Reset mouse down flag
 *
 * @type Function
 * @private
 */
var _onMouseUp = function() {
    Tracker.isMouseDown = false;
};

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

            if (event.type === EVENT_DOWN) {
                Tracker.isMouseDown = true;
            } else if (event.type === EVENT_UP) {
                Tracker.isMouseDown = false;
            }

            return;
        }

        trigger(event);
    }

};

_on('mouseup', _onMouseUp, window);