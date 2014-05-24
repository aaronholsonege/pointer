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

            /**
             * @property $element
             * @type jQuery
             */
            this.$element = $('.js-handle');

            /**
             * @property $container
             * @type jQuery
             */
            this.$container = $('.js-slider');

            /**
             * @property min
             * @type Number
             */
            this.min = 0;

            /**
             * @property max
             * @type Number
             */
            this.max = this.$container.width();

            /**
             * @property offset
             * @type Number
             * @default 0
             */
            this.offset = 0;

            this.enable();
        },

        /**
         * @method enable
         */
        enable: function() {
            this.$element
                .on('pointerdown', $.proxy(this.onDown, this))
                .on('pointermove', $.proxy(this.onMove, this))
                .on('gotpointercapture', $.proxy(this.onCapture, this))
                .on('lostpointercapture', $.proxy(this.onRelease, this));
        },

        /**
         * @method onDown
         * @param {jQuery.Event} event
         * @param {HTMLElement} event.target
         * @param {String} event.pointerId
         * @param {Number} event.pageX
         * @callback
         */
        onDown: function(event) {
            // Pointer is automatically released on pointerup/pointercancel
            // We don't need to manually release in a pointerup callback.
            event.target.setPointerCapture(event.pointerId);

            this.offset = event.pageX - parseInt(this.$element.css('left'), 10);
        },

        /**
         * @method onMove
         * @param {jQuery.Event} event
         * @param {Number} event.pressure
         * @param {Number} event.pageX
         * @callback
         */
        onMove: function(event) {
            if (!event.pressure) {
                return;
            }

            var position = Math.min(this.max, Math.max(this.min, event.pageX - this.offset));
            this.$element.css('left', position);
        },

        /**
         * Add class
         *
         * @method onCapture
         * @param {jQuery.Event} event
         * @callback
         */
        onCapture: function(event) {
            this.$element.addClass('captured');
        },

        /**
         * Remove class
         *
         * @method onRelease
         * @param {jQuery.Event} event
         * @callback
         */
        onRelease: function(event) {
            this.$element.removeClass('captured');
        }

    };

    EventCapture.init();
});