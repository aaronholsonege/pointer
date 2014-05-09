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
var PointerEvents = PointerEvents;

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
 * Get current unix time
 *
 * @type Function
 * @return {Number}
 * @private
 */
var _now = Date.now || function() {
    return +new Date();
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
    var properties = {
        pointerId: 0,
        pointerType: 'mouse',
        timeStamp: originalEvent.timeStamp || _now() // make sure we have a timestamp
    };

    if (originalEvent.type.indexOf('touch') === 0) {
        source = originalEvent.changedTouches[touchIndex || 0];
        properties.pointerId = 1 + source.identifier;
        properties.pointerType = 'touch';
    }

    properties.isPrimary = properties.pointerId <= 1;

    var name;

    for (name in PROPS) {
        if (PROPS.hasOwnProperty(name)) {
            properties[name] = source[name] || PROPS[name];
        }
    }

    if (!properties.pageX && properties.clientX) {
        properties.pageX = properties.clientX + _getPageOffset('Left');
        properties.pageY = properties.clientY + _getPageOffset('Top');
    }

    // add x/y properties aliased to pageX/Y
    properties.x = properties.pageX;
    properties.y = properties.pageY;

    if (properties.pointerId == 0) {
        properties.pressure = Tracker.isMouseActive ? 0.5 : 0;
    }

    return properties;
};

/**
 * Get the current page offset
 *
 * @type Function
 * @param {String} prop
 * @returns {Number}
 * @private
 */
var _getPageOffset = function(prop) {
    var doc = document;
    var body = doc.body;

    var scroll = 'scroll' + prop;
    var client = 'client' + prop;

    return (doc[scroll] || body[scroll] || 0) - (doc[client] || body[client] || 0);
};

/**
 * Get event target
 *
 * @type Function
 * @param {Event} event
 * @param {Element} [target]
 * @returns {Element}
 * @private
 */
var _getTarget = function(event, target) {
    target = target || event.target || event.srcElement || document;

    // Target should not be a text node
    if (target.nodeType === 3) {
        target = target.parentNode;
    }

    return target;
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
            pointerEvent = Controller.create(eventName, event, pointerId);
            if (pointerEvent) {
                if (pointerEvent.pointerType === 'touch') {
                    Tracker.register(pointerEvent, eventName);
                }
                Adapter.trigger(pointerEvent, target);
            }
        } else {
            break;
        }
    } while (target = target.parentNode);
};

/**
 * Create and trigger pointer events
 *
 * @class Controller
 * @static
 */
var Controller = {

    /**
     * Create a new pointer event
     *
     * @method create
     * @param {String} type Pointer event name
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Number} [touchIndex=0]
     * @return {mixed} Event created from adapter
     */
    create: function(type, originalEvent, touchIndex) {
        var properties = _getProperties(type, originalEvent, touchIndex);

        return Adapter.create(
            type,
            originalEvent,
            properties,
            type !== PointerEvents[0] && type !== PointerEvents[6] // enter and leave events should not bubble
        );
    },

    /**
     * Trigger a pointer event from a native mouse/touch event
     *
     * @method trigger
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {String} originalEvent.type
     * @param {Element} originalEvent.relatedTarget
     * @param {Element} originalEvent.target
     * @param {String} [overrideType] Use this event instead of `originalEvent.type` when mapping to a pointer event
     * @param {Element} [overrideTarget] target to dispatch event from
     * @param {Number} [touchIndex=0]
     * @param {HTMLElement} [relatedTarget]
     */
    trigger: function(originalEvent, overrideType, overrideTarget, touchIndex, relatedTarget) {
        var eventName = overrideType || originalEvent.type;

        if (!originalEvent || !Events.MAP.hasOwnProperty(eventName)) {
            return;
        }

        var type = Events.MAP[eventName];
        var pointerId = touchIndex || 0;
        var event = Controller.create(type, originalEvent, pointerId);
        var target = _getTarget(originalEvent, overrideTarget);

        if (event) {
            if (event.pointerType === 'touch') {
                Tracker.register(event, eventName);
            }

            // trigger pointerenter
            if (type === PointerEvents[1]) {
                _detectEnterOrLeave(PointerEvents[0], originalEvent, target, relatedTarget, pointerId);
            }

            Adapter.trigger(event, target);

            // trigger pointerleave
            if (type === PointerEvents[5]) {
                _detectEnterOrLeave(PointerEvents[6], originalEvent, target, relatedTarget, pointerId);
            }
        }
    }

};

module.exports = Controller;