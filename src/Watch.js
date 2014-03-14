define(function(require) {
    'use strict';

    var PointerEvent = require('PointerEvent');
    var Util = require('Util');

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
            Util.on('touchmove', _onEvent);
            Util.on('touchcancel', _onCancel);
            Util.on('touchend', _onUp);
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

        Util.off('touchmove', _onEvent);
        Util.off('touchcancel', _onCancel);
        Util.off('touchend', _onUp);
        Util.off('mouseup', _onUp);
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

            Util.on('touchstart', _onDown);
            Util.on('mouseover', _onEvent);
            Util.on('mousedown', _onDown);
            Util.on('mousemove', _onEvent);
            Util.on('mouseout', _onEvent);

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

            Util.off('touchstart', _onDown);
            Util.off('mouseover', _onEvent);
            Util.off('mousedown', _onDown);
            Util.off('mousemove', _onEvent);
            Util.off('mouseout', _onEvent);

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
    var prop;
    for (prop in Watch) {
        if (!Watch.hasOwnProperty(prop) || typeof Watch[prop] !== 'function') {
            continue;
        }

        Watch[prop] = _bind(Watch[prop], Watch);
    }

    return Watch;

});