define(function() {
    'use strict';

    /**
     * Pointer event names
     *
     * @class Pointer.Events
     * @static
     */
    var Events = {

        /**
         * @property MOVE
         * @type string
         */
        MOVE: 'pointermove',

        /**
         * @property ENTER
         * @type string
         */
        ENTER: 'pointerenter',

        /**
         * @property OVER
         * @type string
         */
        OVER: 'pointerover',

        /**
         * @property DOWN
         * @type string
         */
        DOWN: 'pointerdown',

        /**
         * @property UP
         * @type string
         */
        UP: 'pointerup',

        /**
         * @property OUT
         * @type string
         */
        OUT: 'pointerout',

        /**
         * @property LEAVE
         * @type string
         */
        LEAVE: 'pointerleave'

    };

    return Events;

});