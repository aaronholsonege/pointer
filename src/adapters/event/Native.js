define(function(require) {
    'use strict';

    /**
     * Override original method in `event` to also call same method in `originalEvent`
     *
     * @type Function
     * @param {String} method
     * @param {Event} event
     * @param {MouseEvent|TouchEvent} originalEvent
     * @private
     */
    var _overrideMethod = function(method, event, originalEvent) {
        var originalMethod = event[method];
        event[method] = function() {
            originalEvent[method]();
            originalMethod.call(this);
        };
    };

    /**
     * Native pointer event creation and dispatching.
     *
     * Legacy IE (IE8 and below) are not supported by this
     * adapter - they do not support natively dispatching custom events.
     *
     * @class Adapter.Event.Native
     * @static
     */
    return {

        /**
         * Create a new Event object
         *
         * @method create
         * @param {String} type
         * @param {MouseEvent|TouchEvent} originalEvent
         * @param {Object} properties
         * @param {Boolean} [bubbles=true]
         * @return {Event}
         */
        create: function(type, originalEvent, properties, bubbles) {
            var event = document.createEvent('Event');
            event.initEvent(type, bubbles !== false, properties.cancelable !== false);

            var prop;

            // Add event properties
            for (prop in properties) {
                if (properties.hasOwnProperty(prop)) {
                    try {
                        event[prop] = properties[prop];
                    } catch(e) {}
                }
            }

            if (originalEvent) {
                _overrideMethod('preventDefault', event, originalEvent);
                _overrideMethod('stopPropagation', event, originalEvent);
                _overrideMethod('stopImmediatePropagation', event, originalEvent);
            }

            return event;
        },

        /**
         * Trigger an event on `target`
         *
         * @method trigger
         * @param {Event} event
         * @param {HTMLElement} target
         */
        trigger: function(event, target) {
            target.dispatchEvent(event);
        }

    };

});