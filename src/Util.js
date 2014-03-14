define(function(require) {
    'use strict';

    /**
     * Utility functions
     *
     * @class Pointer.Util
     * @static
     */
    var Util = {

        /**
         * Add event listener to target
         *
         * @method on
         * @param {String} event
         * @param {Function} callback
         * @param {HTMLElement} [target=document.body]
         * @chainable
         */
        on: function(event, callback, target) {
            if (!target) {
                target = document.body;
            }

            if (target.addEventListener) {
                target.addEventListener(event, callback, false);
            } else {
                target.attachEvent('on' + event, callback);
            }
        },

        /**
         * Remove event listener from target
         *
         * @method on
         * @param {String} event
         * @param {Function} callback
         * @param {HTMLElement} [target=document.body]
         * @chainable
         */
        off: function(event, callback, target) {
            if (!target) {
                target = document.body;
            }

            if (target.removeEventListener) {
                target.removeEventListener(event, callback, false);
            } else {
                target.detachEvent('on' + event, callback);
            }
        }

    };

    return Util;

});