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

            /**
             * @property isTracking
             * @type Boolean
             * @default false
             */
            this.isTracking = false;

            this.enable();
        },

        /**
         * @method enable
         */
        enable: function() {
            this.$element
                .on('pointerdown', $.proxy(this.onDown, this))
                .on('pointermove', $.proxy(this.onMove, this))
                .on('pointerup', $.proxy(this.onUp, this));
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
            event.target.setPointerCapture(event.pointerId);

            this.isTracking = true;
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
            if (!event.pressure || !this.isTracking) {
                return;
            }

            var position = Math.min(this.max, Math.max(this.min, event.pageX - this.offset));
            this.$element.css('left', position);
        },

        /**
         * @method onUp
         * @param {jQuery.Event} event
         * @param {HTMLElement} event.target
         * @param {String} event.pointerId
         * @callback
         */
        onUp: function(event) {
            event.target.releasePointerCapture(event.pointerId);
            this.isTracking = false;
        }

    };

    EventCapture.init();
});