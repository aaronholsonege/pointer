define(function(require) {
    'use strict';

    var $ = window.jQuery;

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
         * @return {$.Event}
         */
        create: function(type, originalEvent, properties) {
            var event = $.Event(originalEvent, properties);
            event.type = type;

            return event;
        },

        /**
         * @method trigger
         * @param {$.Event} event
         * @param {Boolean} [event.noBubble=false]
         * @param {HTMLElement} target
         */
        trigger: function(event, target) {
            $.event.trigger(event, null, target, !!event.noBubble);
        }

    };

    return jQueryAdapter;

});