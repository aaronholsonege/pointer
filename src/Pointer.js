var Util = require('./Util');
var MouseHandler = require('./handlers/Mouse');
var TouchHandler = require('./handlers/Touch');

/**
 * @type Boolean
 * @static
 * @private
 */
var _isEnabled = false;

/**
 * Bind mouse/touch events to convert to pointer events
 *
 * @class Pointer
 * @static
 */
var Pointer = {

    /**
     * Enable tracking of touch/mouse events
     *
     * @method enable
     */
    enable: function() {
        if (_isEnabled) {
            return;
        }

        _isEnabled = true;

        Util
            .on(TouchHandler.events, TouchHandler.onEvent)
            .on(MouseHandler.events, MouseHandler.onEvent);
    },

    /**
     * Disable tracking of touch/mouse events
     *
     * @method disable
     */
    disable: function() {
        if (!_isEnabled) {
            return;
        }

        _isEnabled = false;

        Util
            .off(TouchHandler.events, TouchHandler.onEvent)
            .off(MouseHandler.events, MouseHandler.onEvent);
    }

};

module.exports = Pointer;