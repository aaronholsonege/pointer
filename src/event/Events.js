define(function(require) {
    'use strict';

    /**
     *
     * @type Function
     * @param {String} namespace
     * @param {Boolean} [isTouch=false]
     * @returns {String[]}
     * @private
     */
    var _defineEvents = function(namespace, isTouch) {
        return [
            namespace + 'enter',
            namespace + 'over',
            namespace + (isTouch ? 'start' : 'down'),
            namespace + 'move',
            namespace + (isTouch ? 'end' : 'up'),
            namespace + 'out',
            namespace + 'leave',
            namespace + 'cancel'
        ]
    };

    /**
     * Pointer event names
     *
     * @static
     * @final
     */
    var PointerEvents = _defineEvents('pointer');

    /**
     * Mouse event names
     *
     * @static
     * @final
     */
    var MouseEvents = _defineEvents('mouse');

    /**
     * Touch event names
     *
     * @static
     * @final
     */
    var TouchEvents = _defineEvents('touch', true);

    /**
     * Event map
     *
     * @type Object
     * @static
     */
    var MAP = {};

    // Build out event map
    var i = 0;
    var length = PointerEvents.length;

    for (; i < length; i++) {
        if (TouchEvents[i]) {
            MAP[TouchEvents[i]] = PointerEvents[i];
        }

        if (MouseEvents[i]) {
            MAP[MouseEvents[i]] = PointerEvents[i];
        }
    }

    /**
     * Event names
     *
     * @class Event.Events
     * @static
     * @final
     */
    return {

        /**
         * @property POINTER
         * @type String[]
         * @final
         */
        POINTER: PointerEvents,

        /**
         * @property MOUSE
         * @type String[]
         * @final
         */
        MOUSE: MouseEvents,

        /**
         * @property TOUCH
         * @type String[]
         * @final
         */
        TOUCH: TouchEvents,

        /**
         * Map touch or mouse event to pointer event name
         *
         * @property MAP
         * @type Object
         * @static
         */
        MAP: MAP

    };

});