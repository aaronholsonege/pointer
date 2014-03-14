define(function(require) {
    'use strict';

    var jQuery = window.jQuery;

    /**
     * @class Pointer.Adapter.jQueryAdapter
     * @static
     */
    var jQueryAdapter = {

        /**
         * @method create
         * @param {String} type
         * @param {MouseEvent|TouchEvent} originalEvent
         * @param {Object} properties
         * @return {jQuery.Event}
         */
        create: function(type, originalEvent, properties) {
            var event = jQuery.Event(originalEvent, properties);
            event.type = type;

            return event;
        },

        /**
         * @method trigger
         * @param {jQuery.Event} event
         * @param {Boolean} [event.noBubble=false]
         * @param {HTMLElement} target
         */
        trigger: function(event, target) {
            jQuery.event.trigger(event, null, target, !!event.noBubble);
        }

    };

    return jQueryAdapter;

});