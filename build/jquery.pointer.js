(function() {
var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Pointer = require('./Pointer');

// If the browser already supports pointer events, do not enable
if (window.navigator.pointerEnabled === true) {
    return;
}

window.jQuery(document).ready(Pointer);
},{"./Pointer":3}],2:[function(require,module,exports){
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
                    Tracker.register(pointerEvent, eventName, target);
                }
                Adapter.trigger(pointerEvent, Tracker.getTarget(pointerEvent) || target);
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
                Tracker.register(event, eventName, target);
            }

            // trigger pointerenter
            if (type === PointerEvents[1]) {
                _detectEnterOrLeave(PointerEvents[0], originalEvent, target, relatedTarget, pointerId);
            }

            Adapter.trigger(event, Tracker.getTarget(event) || target);

            // trigger pointerleave
            if (type === PointerEvents[5]) {
                _detectEnterOrLeave(PointerEvents[6], originalEvent, target, relatedTarget, pointerId);
            }
        }
    }

};

module.exports = Controller;
},{"./Util":4,"./event/Events":9,"./event/Tracker":10,"adapter/event":"Sy7Mtw"}],3:[function(require,module,exports){
var Util = require('./Util');
var MouseHandler = require('./handlers/Mouse');
var TouchHandler = require('./handlers/Touch');

/**
 * Bind mouse/touch events to convert to pointer events
 *
 * @class Pointer
 * @type Function
 */
var Pointer =  function() {
    Util
        .on(TouchHandler.events, TouchHandler.onEvent)
        .on(MouseHandler.events, MouseHandler.onEvent);
};

module.exports = Pointer;
},{"./Util":4,"./handlers/Mouse":11,"./handlers/Touch":12}],4:[function(require,module,exports){
/**
 * Attach or detach event callback from target
 *
 * @function
 * @param {String|String[]} event
 * @param {Function} callback
 * @param {HTMLElement} [target=document.body]
 * @param {Function} [target.addEventListener]
 * @param {Function} [target.removeEventListener]
 * @param {Function} [target.attachEvent]
 * @param {Function} [target.detachEvent]
 * @param {Boolean} [add=false]
 * @private
 */
var _addOrRemoveEvent = function(event, callback, target, add) {
    if (!target) {
        target = document.body;
    }

    var i = 0;
    var events = (event instanceof Array) ? event : event.split(' ');
    var length = events.length;

    var method = (add ? 'add' : 'remove') + 'EventListener';

    for (; i < length; i++) {
        if (target[method]) {
            target[method](events[i], callback, false);
        } else {
            target[(add ? 'attach' : 'detach') + 'Event']('on' + events[i], callback);
        }
    }
};

/**
 * Utility functions
 *
 * @class Util
 * @static
 */
var Util = {

    /**
     * Add event listener to target
     *
     * @method on
     * @param {String|String[]} event
     * @param {Function} callback
     * @param {HTMLElement} [target=document.body]
     * @param {Function} [target.addEventListener]
     * @param {Function} [target.attachEvent]
     * @chainable
     */
    on: function(event, callback, target) {
        _addOrRemoveEvent(event, callback, target, true);

        return this;
    },

    /**
     * Remove event listener from target
     *
     * @method on
     * @param {String|String[]} event
     * @param {Function} callback
     * @param {HTMLElement} [target=document.body]
     * @param {Function} [target.removeEventListener]
     * @param {Function} [target.detachEvent]
     * @chainable
     */
    off: function(event, callback, target) {
        _addOrRemoveEvent(event, callback, target);

        return this;
    },

    /**
     * Search array for a value.
     *
     * Legacy IE doesn't support Array.indexOf,
     * and doing a for loop is faster anyway.
     *
     * @method indexOf
     * @param {Array} array
     * @param {mixed} item
     * @return {Number}
     */
    indexOf: function(array, item) {
        var i = 0;
        var length = array.length;

        for (; i < length; i++) {
            if (array[i] === item) {
                return i;
            }
        }

        return -1;
    },

    /**
     * Determine if `child` is a descendant of `target`
     *
     * @method contains
     * @param {Element} target
     * @param {Function} [target.contains]
     * @param {Element} child
     * @return {Boolean}
     */
    contains: function(target, child) {
        if (target === child) {
            return true;
        }

        if (target.contains) {
            return target.contains(child);
        } else {
            var current = child;
            var found = false;

            while (current = current.parentNode) {
                if (current === target) {
                    found = true;
                    break;
                }
            }

            return found;
        }
    }

};

module.exports = Util;
},{}],"adapter/event":[function(require,module,exports){
module.exports=require('Sy7Mtw');
},{}],"Sy7Mtw":[function(require,module,exports){
var $ = window.jQuery;

/**
 * jQuery event creating and dispatching.
 *
 * @class Adapter.EventjQuery
 * @static
 */
var jQueryAdapter = {

    /**
     * Create a new jQuery Event object
     *
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Object} properties
     * @param {Boolean} [bubbles=true]
     * @return {jQuery.Event} New Pointer Event
     */
    create: function(type, originalEvent, properties, bubbles) {
        var event = $.Event(originalEvent, properties);
        event.type = type;
        event.bubbles = bubbles !== false;

        return event;
    },

    /**
     * Trigger a jQuery Event
     *
     * @method trigger
     * @param {jQuery.Event} event Pointer Event
     * @param {Boolean} [event.bubbles=false]
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {
        $.event.trigger(event, null, target, !event.bubbles);
    }

};

module.exports = jQueryAdapter;
},{}],"adapter/toucharea":[function(require,module,exports){
module.exports=require('C84uZi');
},{}],"C84uZi":[function(require,module,exports){
/**
 * Attribute name
 *
 * @type String
 * @static
 * @final
 */
var ATTRIBUTE = 'touch-action';

/**
 * @class Adapter.TouchArea.Attribute
 * @static
 */
var TouchAreaAttribute = {

    /**
     * Determine if `target` or a parent node of `target` has
     * a `touch-action` attribute with a value of `none`.
     *
     * @method hasTouchAction
     * @param {Element} target
     * @param {Function} target.getAttribute
     * @returns {Boolean}
     */
    detect: function(target) {
        while (target.getAttribute && !target.getAttribute(ATTRIBUTE)) {
            target = target.parentNode;
        }

        return target.getAttribute && target.getAttribute(ATTRIBUTE) === 'none' || false;
    }

};

module.exports = TouchAreaAttribute;
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
/**
 * Mouse > touch map
 *
 * @type Object
 * @static
 */
var MAP = {
    mouseover: 'touchover',
    mousedown: 'touchstart',
    mousemove: 'touchend',
    mouseup: 'touchend',
    mouseout: 'touchstart'
};

/**
 * The last triggered touch events to compare mouse
 * events to to determine if they are emulated.
 *
 * @type Object
 * @static
 */
var LAST_EVENTS = {
    touchover: {},
    touchstart: {},
    touchend: {},
    touchout: {}
};

/**
 * Pointer capture targets
 *
 * @type Object
 * @static
 */
var TARGET_LOCKS = {};

/**
 * Max time between touch and simulated mouse event (3 seconds)
 *
 * We only use this to expire a touch event - after 3 seconds,
 * no longer use this event when detecting simulated events.
 *
 * @type Number
 * @static
 */
var DELTA_TIME = 3000;

/**
 * @class Event.Tracker
 * @static
 */
var EventTracker = {

    /**
     * Flag for if the mouse button is currently active
     *
     * @property isMouseActive
     * @type Boolean
     * @default false
     */
    isMouseActive: false,

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {Event} event
     * @param {String} event.type
     * @param {String} [overrideEventName]
     * @param {Element} [target]
     * @chainable
     */
    register: function(event, overrideEventName, target) {
        var eventName = overrideEventName || event.type;

        if (LAST_EVENTS.hasOwnProperty(eventName)) {
            LAST_EVENTS[eventName][event.pointerId] = {
                timeStamp: event.timeStamp,
                x: event.clientX,
                y: event.clientY,
                target: target || event.target
            };
        }

        return this;
    },

    /**
     * Get captured target
     *
     * @method getTarget
     * @param {Event} pointerEvent
     * @param {String} pointerEvent.pointerId
     * @param {Number} pointerEvent.pressure
     * @returns {null|Element}
     */
    getTarget: function(pointerEvent) {
        return pointerEvent.pressure ? TARGET_LOCKS[pointerEvent.pointerId] : null;
    },

    /**
     * Determine if a mouse event has been emulated
     *
     * @method isEmulated
     * @param {MouseEvent} event
     * @param {String} event.type
     * @returns {Boolean}
     */
    isEmulated: function(event) {
        if (!MAP.hasOwnProperty(event.type)) {
            return false;
        }

        var eventName = MAP[event.type];
        var previousEvent = LAST_EVENTS[eventName];

        if (!previousEvent) {
            return false;
        }

        var pointerId;
        var pointer;

        for (pointerId in previousEvent) {
            if (!previousEvent.hasOwnProperty(pointerId) || !previousEvent[pointerId]) {
                continue;
            }

            pointer = previousEvent[pointerId];

            // If too much time has passed since the last touch
            // event, remove it so we no longer test against it.
            if (Math.abs(event.timeStamp - pointer.timeStamp) > DELTA_TIME) {
                LAST_EVENTS[eventName][pointerId] = null;
                continue;
            }

            var target = event.target;

            // If this is a mouseout event, compare the related target
            // instead which is the element that previously had focus for touchstart
            if (event.type === 'mouseout') {
                target = event.relatedTarget;
            }

            if (
                pointer.target === target
                && pointer.x === event.clientX
                && pointer.y === event.clientY
            ) {
                return true;
            }
        }

        return false;
    }

};

Element.prototype.setPointerCapture = function(pointerId) {
    TARGET_LOCKS[pointerId] = this;
};

Element.prototype.releasePointerCapture = function(pointerId) {
    TARGET_LOCKS[pointerId] = null;
};

module.exports = EventTracker;
},{}],11:[function(require,module,exports){
var Util = require('../Util');
var Events = require('../event/Events').MOUSE;
var Controller = require('../Controller');
var Tracker = require('../event/Tracker');

/**
 * Mouse event names
 *
 * @type String
 * @static
 * @private
 */
var EVENT_OVER = Events[1];
var EVENT_DOWN = Events[2];
var EVENT_MOVE = Events[3];
var EVENT_UP = Events[4];
var EVENT_OUT = Events[5];

/**
 * Reset active mouse
 *
 * @type Function
 * @private
 */
var _onWindowUp = function() {
    Tracker.isMouseActive = false;
};

/**
 * @class Handler.Mouse
 * @static
 */
var MouseHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: [EVENT_OVER, EVENT_DOWN, EVENT_MOVE, EVENT_UP, EVENT_OUT],

    /**
     * If event is not simulated, convert to pointer
     *
     * @method onEvent
     * @param {MouseEvent} event
     * @param {String} event.type
     * @param {Element} event.target
     * @param {Element} event.relatedTarget
     * @callback
     */
    onEvent: function(event) {
        if (!Tracker.isEmulated(event)) {
            if (event.type === EVENT_DOWN) {
                Tracker.isMouseActive = true;
            }
            Controller.trigger(event);
            if (event.type === EVENT_UP) {
                Tracker.isMouseActive = false;
            }
        } else {
            // Add a simulated flag because hey, why not
            try {
                event._isSimulated = true;
            } catch(e) {}
        }
    }

};

// Reset active mouse on mouseup
// This capture if the user drags outside the window and releases the mouse
Util.on(EVENT_UP, _onWindowUp, window);

module.exports = MouseHandler;
},{"../Controller":2,"../Util":4,"../event/Events":9,"../event/Tracker":10}],12:[function(require,module,exports){
var Util = require('../Util');
var Events = require('../event/Events').TOUCH;
var TouchAreaAdapter = require('adapter/toucharea');
var Controller = require('../Controller');

/**
 * Touch event names
 *
 * @type String
 * @static
 * @private
 */
var EVENT_OVER = Events[1];
var EVENT_START = Events[2];
var EVENT_MOVE = Events[3];
var EVENT_END = Events[4];
var EVENT_OUT = Events[5];
var EVENT_CANCEL = Events[7];

/**
 * List of the previous point event targets.
 *
 * Used to determine if a touch event has changed targets
 * and will then fire enter/over and out/leave events.
 *
 * @type Object
 * @static
 * @private
 */
var PREVIOUS_TARGETS = {};

/**
 * Last `touchmove` position
 * @type Object
 * @static
 * @private
 */
var PREVIOUS_POSITIONS = {};

/**
 * Trigger cancel for each touch point
 *
 * @type Function
 * @param {Touch} point
 * @param {Number} point.identifier
 * @param {TouchEvent} event
 * @param {String} event.type
 * @param {Number} pointIndex
 * @private
 */
var _onPointCancel = function(point, event, pointIndex) {
    PREVIOUS_TARGETS[point.identifier] = null;
    Controller.trigger(event, event.type, event.target, pointIndex);
    Controller.trigger(event, EVENT_OUT, event.target, pointIndex);
};

/**
 * Trigger move for each touch point
 *
 * @type Function
 * @param {Touch} point
 * @param {Number} point.identifier
 * @param {Event} event
 * @param {Number} pointIndex
 * @private
 */
var _onPointMove = function(point, event, pointIndex) {
    var newTarget = document.elementFromPoint(point.clientX, point.clientY);
    var currentTarget = PREVIOUS_TARGETS[point.identifier];

    PREVIOUS_TARGETS[point.identifier] = newTarget;

    if (newTarget !== currentTarget) {
        if (currentTarget) {
            Controller.trigger(event, EVENT_OUT, currentTarget, pointIndex, newTarget);
        }

        if (newTarget) {
            Controller.trigger(event, EVENT_OVER, newTarget, pointIndex, currentTarget);
        }
    }

    Controller.trigger(event, EVENT_MOVE, newTarget, pointIndex);

    // If the target (or a parent node) has the touch-action attribute
    // set to "none", prevent the browser default action.
    if (newTarget && TouchAreaAdapter.detect(newTarget)) {
        event.preventDefault();
    }
};

/**
 * Trigger start/end for each touch point
 *
 * @type Function
 * @param {Touch} point
 * @param {Number} point.identifier
 * @param {TouchEvent} event
 * @param {String} event.type
 * @param {Element} event.target
 * @param {Number} pointIndex
 * @private
 */
var _onPointStartEnd = function(point, event, pointIndex) {
    var target = event.target;
    var type = event.type;

    if (type === EVENT_START) {
        PREVIOUS_TARGETS[point.identifier] = target;
        Controller.trigger(event, EVENT_OVER, target, pointIndex);
    }

    var currentTarget = PREVIOUS_TARGETS[point.identifier] || target;
    Controller.trigger(event, type, currentTarget, pointIndex);

    if (type === EVENT_END) {
        PREVIOUS_TARGETS[point.identifier] = null;
        Controller.trigger(event, EVENT_OUT, currentTarget, pointIndex);
    }
};

/**
 * @class Handler.Touch
 * @static
 */
var TouchHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: [EVENT_START, EVENT_MOVE, EVENT_END, EVENT_CANCEL],

    /**
     * Register event (for mouse simulation detection) and convert to pointer
     *
     * @method onEvent
     * @param {TouchEvent} event
     * @param {String} event.type
     * @param {Element} event.target
     * @callback
     */
    onEvent: function(event) {
        var i = -1;
        var touches = event.changedTouches;

        var id;
        var touch;
        var previousTouch;
        var position;

        var method = _onPointCancel;

        switch(event.type) {
            case EVENT_START:
            case EVENT_END:
                method = _onPointStartEnd;
                break;
            case EVENT_MOVE:
                method = _onPointMove;
                break;
        }

        while (touch = touches[++i]) {
            id = touch.identifier;

            // The `touchmove` event triggers when ANY active point moves,
            // so we want to filter out the points that didn't move.
            if (event.type === EVENT_MOVE) {
                previousTouch = PREVIOUS_POSITIONS[id];
                position = touch.pageX + '|' + touch.pageY;

                if (previousTouch === position) {
                    continue;
                }

                PREVIOUS_POSITIONS[id] = position;
            }

            method(touch, event, i);
        }
    }

};

module.exports = TouchHandler;
},{"../Controller":2,"../Util":4,"../event/Events":9,"adapter/toucharea":"C84uZi"}]},{},[1])
}());