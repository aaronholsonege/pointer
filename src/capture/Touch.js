var Util = require('../Util');
var PointerEvent = require('../PointerEvent');
var EventTracker = require('../EventTracker');

/**
 * @class Pointer.Capture.Touch
 * @extends Pointer.Capture.Abstract
 * @type Object
 * @static
 */
var TouchCapture = {

    /**
     * Events to watch
     *
     * @property events
     * @type String
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
        PointerEvent.trigger(event);
    }

};

module.exports = TouchCapture;