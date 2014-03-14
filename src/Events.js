define(function() {
    'use strict';

    var NAMESPACE = 'pointer';

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
        MOVE: NAMESPACE + 'move',

        /**
         * @property ENTER
         * @type string
         */
        ENTER: NAMESPACE + 'enter',

        /**
         * @property OVER
         * @type string
         */
        OVER: NAMESPACE + 'over',

        /**
         * @property DOWN
         * @type string
         */
        DOWN: NAMESPACE + 'down',

        /**
         * @property UP
         * @type string
         */
        UP: NAMESPACE + 'up',

        /**
         * @property OUT
         * @type string
         */
        OUT: NAMESPACE + 'out',

        /**
         * @property LEAVE
         * @type string
         */
        LEAVE: NAMESPACE + 'leave'

    };

    return Events;

});