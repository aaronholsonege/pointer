var PointerEvent = require('./PointerEvent');
var Util = require('./Util');

/**
 * @type Boolean
 * @static
 */
var _isEnabled = false;

/**
 * @type Boolean
 * @static
 */
var _isTracking = false;

/**
 * @type Boolean
 * @static
 */
var _isTrackingTouchEvents = false;

/**
 * Trigger pointer event from a mouse/touch event
 *
 * @param {MouseEvent|TouchEvent} event
 * @return {*|null}
 * @privvate
 */
var _trigger = function(event) {
    if (_isTrackingTouchEvents && event.type.indeOf('touch') !== 0) {
        return null;
    }

    return PointerEvent.trigger(event);
};

/**
 * Start tracking touch/mouse movements after down
 *
 * @param {MouseEvent|TouchEvent} event
 * @private
 */
var _onDown = function(event) {
    if (_isTracking) {
        return;
    }

    _isTracking = true;

    var pointerEvent = _trigger(event);

    if (pointerEvent.defaultPrevented || (pointerEvent.isDefaultPrevented && pointerEvent.isDefaultPrevented())) {
        return;
    }

    if (event.type.indexOf('touch') === 0) {
        _isTrackingTouchEvents = true;
        Util
            .on('touchmove', _onEvent)
            .on('touchcancel', _onCancel)
            .on('touchend', _onUp);
    } else {
        Util.on('mouseup', _onUp);
    }
};

/**
 * @param {MouseEvent|TouchEvent} event
 * @private
 */
var _onEvent = function(event) {
    _trigger(event);
};

/**
 * @param {MouseEvent|TouchEvent} event
 * @private
 */
var _onUp = function(event) {
    _onCancel();

    _trigger(event);
};

/**
 * Remove event listeners for active touch/mouse
 * @param {TouchEvent} [event]
 * @private
 */
var _onCancel = function(event) {
    _trigger(event);

    _isTracking = false;
    _isTrackingTouchEvents = false;

    Util
        .off('touchmove', _onEvent)
        .off('touchcancel', _onCancel)
        .off('touchend', _onUp)
        .off('mouseup', _onUp);
};

/**
 * Bind mouse/touch events to convert to pointer events
 *
 * @class Pointer.Watch
 * @static
 */
var Watch = {

    /**
     * Enable tracking of touch/mouse events
     *
     * @method enable
     * @chainable
     */
    enable: function() {
        if (_isEnabled) {
            return this;
        }

        _isEnabled = true;

        Util
            .on('touchstart', _onDown)
            .on('mouseover', _onEvent)
            .on('mousedown', _onDown)
            .on('mousemove', _onEvent)
            .on('mouseout', _onEvent);

        return this;
    },

    /**
     * Disable tracking of touch/mouse events
     *
     * @method disable
     * @chainable
     */
    disable: function() {
        if (!_isEnabled) {
            return this;
        }

        _isEnabled = false;

        _onCancel();

        Util
            .off('touchstart', _onDown)
            .off('mouseover', _onEvent)
            .off('mousedown', _onDown)
            .off('mousemove', _onEvent)
            .off('mouseout', _onEvent);

        return this;
    }

};

/**
 * Bind `method` to `context`
 *
 * @param {Function} method
 * @param {*} context
 * @return {Function}
 * @private
 */
var _bind = function(method, context) {
    return function() {
        return method.apply(context, arguments);
    };
};

// Bind all method to the context of Watch
Watch.enable = _bind(Watch.enable, Watch);
Watch.disable = _bind(Watch.disable, Watch);

module.exports = Watch;