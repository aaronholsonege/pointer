var Events = require('./event/Events');
var EventMap = require('./event/Map');
var Adapter = require('Adapter');
var Util = require('./Util');

/**
 * Pointer events that should not bubble
 *
 * @type String[]
 * @static
 */
var NO_BUBBLE_EVENTS = [Events.ENTER, Events.LEAVE];

/**
 * Properties to copy from original event to new event
 *
 * @type String[]
 * @static
 */
var PROPS = 'screenX screenY pageX pageY offsetX offsetY clientX clientY'.split(' ');

/**
 * Get proprties to set to event
 *
 * @type Function
 * @param {String} type Pointer event name
 * @param {MouseEvent|TouchEvent} originalEvent
 * @param {String} originalEvent.type
 * @param {TouchList} [originalEvent.touches]
 * @param {TouchList} [originalEvent.changedTouches]
 * @param {Number} [touchIndex=0]
 * @return {Object}
 * @private
 */
var _getProperties = function(type, originalEvent, touchIndex) {
    var source = originalEvent;
    var properties = {
        noBubble: Util.indexOf(NO_BUBBLE_EVENTS, type) !== -1,
        width: 0,
        height: 0,
        pressure: 0,
        tiltX: 0,
        tiltY: 0
    };

    if (originalEvent.type.indexOf('touch') === 0) {
        source = originalEvent.changedTouches[touchIndex || 0];
        properties.pointerId = 1 + source.identifier;
        properties.pointerType = 'touch';
    } else {
        properties.pointerId = 0;
        properties.pointerType = 'mouse';
        properties.isPrimary = true;
    }

    properties.isPrimary = properties.pointerId <= 1;

    var i = 0;
    var length = PROPS.length;

    for (; i < length; i++) {
        if (source.hasOwnProperty(PROPS[i])) {
            properties[PROPS[i]] = source[PROPS[i]];
        }
    }

    // add x/y properties aliased to pageX/Y
    properties.x = properties.pageX;
    properties.y = properties.pageY;

    return properties;
};

/**
 * Create and trigger pointer events
 *
 * @class Pointer.Controller
 * @static
 */
var PointerEvent = {

    /**
     * Create a new pointer event
     *
     * @method create
     * @param {String} type Pointer event name
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Number} [touchIndex=0]
     * @return {*} Event created from adapter
     */
    create: function(type, originalEvent, touchIndex) {
        var properties = _getProperties(type, originalEvent, touchIndex);

        return Adapter.create(type, originalEvent, properties);
    },

    /**
     * Trigger a pointer event from a native mouse/touch event
     *
     * @method trigger
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {String} originalEvent.type
     * @param {Element} originalEvent.target
     * @param {String} [overrideType] Use this event instead of `originalEvent.type` when mapping to a pointer event
     * @param {Element} [overrideTarget] target to dispatch event from
     * @param {Number} [touchIndex=0]
     */
    trigger: function(originalEvent, overrideType, overrideTarget, touchIndex) {
        var eventName = overrideType || originalEvent.type;

        if (!originalEvent || !EventMap.hasOwnProperty(eventName)) {
            return;
        }

        var type = EventMap[eventName];
        var event = PointerEvent.create(type, originalEvent, touchIndex || 0);

        if (event) {
            Adapter.trigger(event, overrideTarget || originalEvent.target);
        }
    }

};

module.exports = PointerEvent;