define(function(require) {
    'use strict';

    /**
     * @class Adapter.Event.Interface
     * @interface
     * @static
     */
    return {

        /**
         * Create a pointer event
         *
         * @method create
         * @param {String} type
         * @param {MouseEvent|TouchEvent} originalEvent
         * @param {Object} properties
         * @param {Boolean} [bubbles=true]
         * @return {mixed} Created pointer event
         */
        create: function(type, originalEvent, properties, bubbles) {},

        /**
         * Dispatch pointer event to target
         *
         * @method trigger
         * @param {mixed} event Pointer event
         * @param {HTMLElement} target
         */
        trigger: function(event, target) {}

    };

});