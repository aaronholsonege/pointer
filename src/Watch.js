define(function(require) {
    'use strict';

    var PointerEvent = require('PointerEvent');

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

            this
                .on('touchstart', this.onDown)
                .on('mouseover', this.onEvent)
                .on('mousedown', this.onDown)
                .on('mousemove', this.onEvent)
                .on('mouseout', this.onEvent);

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

            this.onCancel();

            this
                .off('touchstart', this.onDown)
                .off('mouseover', this.onEvent)
                .off('mousedown', this.onDown)
                .off('mousemove', this.onEvent)
                .off('mouseout', this.onEvent);

            return this;
        },

        /**
         * Add event listener to body
         *
         * @method on
         * @param {String} event
         * @param {Function} callback
         * @chainable
         */
        on: function(event, callback) {
            document.body.addEventListener(event, callback, false);

            return this;
        },

        /**
         * Remove event listener to body
         *
         * @method off
         * @param {String} event
         * @param {Function} callback
         * @chainable
         */
        off: function(event, callback) {
            document.body.removeEventListener(event, callback, false);

            return this;
        },

        /**
         * Trigger pointer event from a mouse/touch event
         *
         * @method trigger
         * @param {MouseEvent|TouchEvent} event
         * @return {*|null}
         */
        trigger: function(event) {
            if (_isTrackingTouchEvents && event.type.indeOf('touch') !== 0) {
                return null;
            }

            return PointerEvent.trigger(event);
        },

        /**
         * @method onDown
         * @param {MouseEvent|TouchEvent} event
         */
        onDown: function(event) {
            if (_isTracking) {
                return;
            }

            _isTracking = true;

            var pointerEvent = this.trigger(event);

            if (pointerEvent.defaultPrevented || (pointerEvent.isDefaultPrevented && pointerEvent.isDefaultPrevented())) {
                return;
            }

            if (event.type.indexOf('touch') === 0) {
                _isTrackingTouchEvents = true;
                this
                    .on('touchmove', this.onEvent)
                    .on('touchcancel', this.onCancel)
                    .on('touchend', this.onUp);
            } else {
                this.on('mouseup', this.onUp);
            }
        },

        /**
         * @method onEvent
         * @param {MouseEvent|TouchEvent} event
         */
        onEvent: function(event) {
            this.trigger(event);
        },

        /**
         * @method onUp
         * @param {MouseEvent|TouchEvent} event
         */
        onUp: function(event) {
            this.onCancel();

            this.trigger(event);
        },

        /**
         * @method onCancel
         * @param {TouchEvent} [event]
         */
        onCancel: function(event) {
            this.trigger(event);

            _isTracking = false;
            _isTrackingTouchEvents = false;

            this
                .on('touchmove', this.onEvent)
                .on('touchcancel', this.onCancel)
                .on('touchend', this.onUp)
                .on('mouseup', this.onUp);
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

    return {
        enable: Watch.enable,
        disable: Watch.disable
    };

});