/**
 * Pointer event namespace.
 * This is prepended to the pointer events
 *
 * @type String
 * @final
 */
var NAMESPACE = 'pointer';

/**
 * Pointer event names
 *
 * @class Event
 * @static
 * @final
 */
var Events = {

    /**
     * @property MOVE
     * @type String
     */
    MOVE: NAMESPACE + 'move',

    /**
     * @property ENTER
     * @type String
     */
    ENTER: NAMESPACE + 'enter',

    /**
     * @property OVER
     * @type String
     */
    OVER: NAMESPACE + 'over',

    /**
     * @property DOWN
     * @type String
     */
    DOWN: NAMESPACE + 'down',

    /**
     * @property UP
     * @type String
     */
    UP: NAMESPACE + 'up',

    /**
     * @property OUT
     * @type String
     */
    OUT: NAMESPACE + 'out',

    /**
     * @property LEAVE
     * @type String
     */
    LEAVE: NAMESPACE + 'leave',

    /**
     * @property CANCEL
     * @type String
     */
    CANCEL: NAMESPACE + 'cancel'

};

module.exports = Events;