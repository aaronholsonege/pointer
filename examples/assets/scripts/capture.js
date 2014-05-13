$(document).ready(function() {
    'use strict';

    /**
     * @class EventCapture
     * @static
     */
    var EventCapture = {

        /**
         * @method init
         */
        init: function() {
            this.$element = $('.handle');

            this.enable();
        },

        /**
         * @method enable
         */
        enable: function() {
            this.$element
                .on('pointerdown', this.onDown)
                .on('pointermove', this.onMove)
                .on('pointerup', this.onUp);
        },

        onDown: function(event) {
            event.target.setPointerCapture(event.pointerId);
        },

        onMove: function(event) {
            if (!event.pressure) {
                return;
            }
            console.log('track');
        },

        onUp: function(event) {
            event.target.releasePointerCapture(event.pointerId);
        }

    };

    EventCapture.init();
});