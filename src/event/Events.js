var Util = require('../Util');

/**
 * Pointer event namespace.
 * This is prepended to the pointer events
 *
 * @type String
 * @final
 */
var NAMESPACE_POINTER = 'pointer';

/**
 * Mouse event namespace.
 * This is prepended to the mouse events
 *
 * @type String
 * @final
 */
var NAMESPACE_MOUSE = 'mouse';

/**
 * Touch event namespace.
 * This is prepended to the touch events
 *
 * @type String
 * @final
 */
var NAMESPACE_TOUCH = 'touch';

/**
 * Pointer event names
 *
 * @static
 * @final
 */
var PointerEvents = [
    NAMESPACE_POINTER + 'enter',
    NAMESPACE_POINTER + 'over',
    NAMESPACE_POINTER + 'down',
    NAMESPACE_POINTER + 'move',
    NAMESPACE_POINTER + 'up',
    NAMESPACE_POINTER + 'out',
    NAMESPACE_POINTER + 'leave',
    NAMESPACE_POINTER + 'cancel'
];

/**
 * Mouse event names
 *
 * @static
 * @final
 */
var MouseEvents = [
    NAMESPACE_MOUSE + 'enter',
    NAMESPACE_MOUSE + 'over',
    NAMESPACE_MOUSE + 'down',
    NAMESPACE_MOUSE + 'move',
    NAMESPACE_MOUSE + 'up',
    NAMESPACE_MOUSE + 'out',
    NAMESPACE_MOUSE + 'leave',
    NAMESPACE_MOUSE + 'cancel'
];

/**
 * Touch event names
 *
 * @static
 * @final
 */
var TouchEvents = [
    NAMESPACE_TOUCH + 'enter',
    NAMESPACE_TOUCH + 'over',
    NAMESPACE_TOUCH + 'start',
    NAMESPACE_TOUCH + 'move',
    NAMESPACE_TOUCH + 'end',
    NAMESPACE_TOUCH + 'out',
    NAMESPACE_TOUCH + 'leave',
    NAMESPACE_TOUCH + 'cancel'
];

/**
 * Event map
 *
 * @type Object
 * @static
 */
var MAP = {};

/**
 * Event names
 *
 * @class Event.Events
 * @static
 * @final
 */
var Events = {

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

module.exports = Events;