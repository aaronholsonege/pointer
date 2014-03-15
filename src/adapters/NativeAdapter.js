define(function(require) {
    'use strict';

    /**
     * @class Pointer.Adapter.Native
     * @static
     */
    var Native = {

        /**
         * @method create
         * @param {String} type
         * @param {MouseEvent|TouchEvent} originalEvent
         * @param {Object} properties
         * @return {jQuery.Event}
         */
        create: function(type, originalEvent, properties) {
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent(
                type,
                !properties.noBubble, // can bubble
                true, // cancelable
                window,
                1,
                properties.screenX || originalEvent.screenX,
                properties.screenY || originalEvent.screenY,
                properties.clientX || originalEvent.clientX,
                properties.clientY || originalEvent.clientY,
                originalEvent.ctrlKey,
                originalEvent.altKey,
                originalEvent.shiftKey,
                originalEvent.metaKey,
                originalEvent.button,
                properties.relatedTarget || originalEvent.relatedTarget || null
            );

            if (!event.pageX !== originalEvent.pageX) {
                Object.defineProperty(event, 'pageX', {
                    get: function() {
                        return originalEvent.pageX;
                    }
                });
                Object.defineProperty(event, 'pageY', {
                    get: function() {
                        return originalEvent.pageY;
                    }
                });
            }

            return event;
        },

        /**
         * @method trigger
         * @param {MouseEvent} event
         * @param {HTMLElement} target
         */
        trigger: function(event, target) {
            target.dispatchEvent(event);
        }

    };

    return Native;

});