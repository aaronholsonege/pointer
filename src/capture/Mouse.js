var Util = require('../Util');
var PointerEvent = require('../PointerEvent');
var EventTracker = require('../EventTracker');

/**
 * @class Pointer.Capture.Mouse
 * @extends Pointer.Capture.Abstract
 * @type Object
 * @static
 */
var MouseCapture = {

    /**
     * Events to watch
     *
     * @property events
     * @type String
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
            PointerEvent.trigger(event);
        }
    }

};

module.exports = MouseCapture;