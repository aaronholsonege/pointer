var Util = require('../Util');
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
 * Reset active mouse
 *
 * @type Function
 * @prop {Event} event
 * @private
 */
var _onWindowUp = function(event) {
    Tracker.isMouseActive = false;

    if (event.target === document.documentElement) {
        Tracker.releasePointer(Util.getId(event));
    }
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

            return;
        }

        if (event.type === EVENT_DOWN) {
            Tracker.isMouseActive = true;
        }

        if (event.type === EVENT_UP) {
            Tracker.isMouseActive = false;
        }

        trigger(event, Tracker.getTarget(Util.getId(event)));
    }

};

// Reset active mouse on mouseup
// This captures if the user drags outside the window and releases the mouse
Util.on(EVENT_UP, _onWindowUp, window);