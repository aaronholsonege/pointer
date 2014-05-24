var Events = require('./event/Events');
var Adapter = require('adapter/event');
var Tracker = require('./event/Tracker');
var Util = require('./Util');

/**
 * Pointer event names
 *
 * @type String[]
 * @static
 */
var PointerEvents = Events.POINTER;

/**
 * Default properties to apply to newly created events
 *
 * These values are only used if values do not exists in the
 * `properties` or `originalEvent` object called with `create` method
 *
 * @type Object
 * @static
 * @private
 */
var PROPS = {
    screenX: 0,
    screenY: 0,
    pageX: 0,
    pageY: 0,
    offsetX: 0,
    offsetY: 0,
    clientX: 0,
    clientY: 0,
    view: null,
    detail: null,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: null,
    width: 0,
    height: 0,
    tiltX: 0,
    tiltY: 0,
    pressure: 0.5
};

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
    var pointerType = 'mouse';

    var properties = {
        timeStamp: originalEvent.timeStamp || Util.now() // make sure we have a timestamp
    };

    if (originalEvent.type.indexOf('touch') === 0) {
        source = originalEvent.changedTouches[touchIndex || 0];
        pointerType = 'touch';
    }

    var pointerId = Util.getId(source);
    properties.isPrimary = pointerId <= 1;

    var name;

    for (name in PROPS) {
        if (PROPS.hasOwnProperty(name)) {
            properties[name] = source[name] || PROPS[name];
        }
    }

    if (!properties.pageX && properties.clientX) {
        properties.pageX = properties.clientX + _getPageOffset(true);
        properties.pageY = properties.clientY + _getPageOffset();
    }

    // add x/y properties aliased to pageX/Y
    properties.x = properties.pageX;
    properties.y = properties.pageY;

    if (pointerId == 0) {
        properties.pressure = Tracker.isMouseDown ? 0.5 : 0;
    }

    properties.pointerId = pointerId;
    properties.pointerType = pointerType;

    return properties;
};

/**
 * Get the current page offset
 *
 * @type Function
 * @param {Boolean} [left=false]
 * @returns {Number}
 * @private
 */
var _getPageOffset = function(left) {
    var doc = document;
    var body = doc.body;
    var prop = left ? 'Left' : 'Top';

    var scroll = 'scroll' + prop;
    var client = 'client' + prop;

    return (doc[scroll] || body[scroll] || 0) - (doc[client] || body[client] || 0);
};

/**
 * Detect and trigger enter/leave events
 *
 * @type Function
 * @param {String} eventName
 * @param {MouseEvent|TouchEvent} event
 * @param {HTMLElement} event.relatedTarget
 * @param {HTMLElement} target
 * @param {HTMLElement} target.parentNode
 * @param {HTMLElement} [relatedTarget]
 * @param {Number} [pointerId=0]
 * @private
 */
var _detectEnterOrLeave = function(eventName, event, target, relatedTarget, pointerId) {
    var pointerEvent;

    if (!relatedTarget) {
        relatedTarget = event.relatedTarget;
    }

    // Climb up DOM tree and trigger pointerenter/pointerleave
    // on all applicable elements that have been entered/left.
    do {
        if (!relatedTarget || !Util.contains(target, relatedTarget)) {
            pointerEvent = _create(eventName, event, pointerId);
            if (pointerEvent) {
                if (pointerEvent.pointerType === 'touch') {
                    Tracker.register(pointerEvent, eventName, target);
                }
                Adapter.trigger(pointerEvent, target);
            }
        } else {
            break;
        }
    } while (target = target.parentNode);
};

/**
 * Create a new pointer event
 *
 * @type Function
 * @param {String} type Pointer event name
 * @param {MouseEvent|TouchEvent} originalEvent
 * @param {Number} [touchIndex=0]
 * @return {mixed} Event created from adapter
 */
var _create = function(type, originalEvent, touchIndex) {
    var properties = _getProperties(type, originalEvent, touchIndex);

    return Adapter.create(
        type,
        originalEvent,
        properties,
        type !== PointerEvents[0] && type !== PointerEvents[6] // enter and leave events should not bubble
    );
};

/**
 * Trigger a pointer event from a native mouse/touch event
 *
 * @type Function
 * @param {MouseEvent|TouchEvent} originalEvent
 * @param {String} originalEvent.type
 * @param {Element} originalEvent.relatedTarget
 * @param {Element} originalEvent.target
 * @param {String} [overrideType] Use this event instead of `originalEvent.type` when mapping to a pointer event
 * @param {Element} [target] target to dispatch event from
 * @param {Number} [touchIndex=0]
 * @param {HTMLElement} [relatedTarget]
 */
var _trigger = function(originalEvent, target, overrideType, touchIndex, relatedTarget) {
    var eventName = overrideType || originalEvent.type;

    if (!originalEvent || !Events.MAP.hasOwnProperty(eventName)) {
        return;
    }

    var type = Events.MAP[eventName];
    var pointerId = touchIndex || 0;
    var event = _create(type, originalEvent, pointerId);
    
    target = Util.getTarget(originalEvent, target);

    if (event) {
        if (event.pointerType === 'touch') {
            Tracker.register(event, eventName, target);
        }

        // trigger pointerenter
        if (type === PointerEvents[1]) {
            _detectEnterOrLeave(PointerEvents[0], originalEvent, target, relatedTarget, pointerId);
        }

        Adapter.trigger(event, target);

        // Release pointer if it has been captured
        if (event.type === PointerEvents[4] || event.type === PointerEvents[7]) {
            Tracker.releasePointer(event.pointerId);
        }

        // trigger pointerleave
        if (type === PointerEvents[5]) {
            _detectEnterOrLeave(PointerEvents[6], originalEvent, target, relatedTarget, pointerId);
        }
    }
};

/**
 * Create and trigger pointer events
 *
 * @class Controller
 * @static
 */
module.exports = {

    /**
     * Create a new pointer event
     *
     * @method create
     * @param {String} type Pointer event name
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Number} [touchIndex=0]
     * @return {mixed} Event created from adapter
     */
    create: _create,

    /**
     * Trigger a pointer event from a native mouse/touch event
     *
     * @method trigger
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {String} originalEvent.type
     * @param {Element} originalEvent.relatedTarget
     * @param {Element} originalEvent.target
     * @param {String} [overrideType] Use this event instead of `originalEvent.type` when mapping to a pointer event
     * @param {Number} [touchIndex=0]
     * @param {Element} [overrideTarget] target to dispatch event from
     * @param {HTMLElement} [relatedTarget]
     */
    trigger: _trigger

};