var Events = require('./Events');

/**
 * Map of mouse/touch event to their respective pointer event(s)
 * When these events (keys) are captured, the defined pointer event(s) are fired.
 *
 * Values can be either a single event name, or an array of event names.
 *
 * @class Pointer.Event.Map
 * @static
 */
var EventMap = {

    /**
     * @property touchenter
     * @type String
     */
    touchenter: Events.ENTER,

    /**
     * @property touchover
     * @type String
     */
    touchover: Events.OVER,

    /**
     * @property touchstart
     * @type String
     */
    touchstart: Events.DOWN,

    /**
     * @property touchmove
     * @type String
     */
    touchmove: Events.MOVE,

    /**
     * @property touchend
     * @type String
     */
    touchend: Events.UP,

    /**
     * @property touchout
     * @type String
     */
    touchout: Events.OUT,

    /**
     * @property touchleave
     * @type String
     */
    touchleave: Events.LEAVE,

    /**
     * @property mouseenter
     * @type String
     */
    mouseenter: Events.ENTER,

    /**
     * @property mouseover
     * @type String
     */
    mouseover: Events.OVER,

    /**
     * @property mousedown
     * @type String
     */
    mousedown: Events.DOWN,

    /**
     * @property mousemove
     * @type String
     */
    mousemove: Events.MOVE,

    /**
     * @property mouseup
     * @type String
     */
    mouseup: Events.UP,

    /**
     * @property mouseout
     * @type String
     */
    mouseout: Events.OUT,

    /**
     * @property mouseleave
     * @type String
     */
    mouseleave: Events.LEAVE

};

module.exports = EventMap;