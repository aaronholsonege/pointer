(function() {
var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Pointer = require('./Pointer');
var Util = require('./Util');

// If the browser already supports pointer events, do not enable
if (window.navigator.pointerEnabled === true) {
    return;
}

// Initialize Pointer when the page is ready
var _onReady = function() {
    Util
        .off('DOMContentLoaded', _onReady, document)
        .off('load', _onReady, window);

    Pointer.enable();
};

if (document.readyState === 'complete') {
    // keep the script kickoff on an async thread
    setTimeout(Pointer.enable);
} else {
    Util
        .on('DOMContentLoaded', _onReady, document)
        .on('load', _onReady, window);
}
},{"./Pointer":3,"./Util":4}],2:[function(require,module,exports){
var Events = require('./event/Events');
var EventMap = require('./event/Map');
var Adapter = require('adapter/event');
var Tracker = require('./event/Tracker');
var Util = require('./Util');

/**
 * Pointer events that should not bubble
 *
 * @type String[]
 * @static
 * @private
 */
var NO_BUBBLE_EVENTS = [Events.ENTER, Events.LEAVE];

/**
 * Default properties to apply to newly created events
 *
 * These values are only used in values do not exists in the
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
    pressure: 0
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
        pointerType: 'mouse'
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
     * @return {mixed} Event created from adapter
     */
    create: function(type, originalEvent, touchIndex) {
        var properties = _getProperties(type, originalEvent, touchIndex);

        return Adapter.create(
            type,
            originalEvent,
            properties,
            Util.indexOf(NO_BUBBLE_EVENTS, type) === -1
        );
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
            Tracker.register(event, eventName);
            Adapter.trigger(event, overrideTarget || originalEvent.target);
        }
    }

};

module.exports = PointerEvent;
},{"./Util":4,"./event/Events":9,"./event/Map":10,"./event/Tracker":11,"adapter/event":"Sy7Mtw"}],3:[function(require,module,exports){
var Util = require('./Util');
var MouseHandler = require('./handlers/Mouse');
var TouchHandler = require('./handlers/Touch');

/**
 * @type Boolean
 * @static
 * @private
 */
var _isEnabled = false;

/**
 * Bind mouse/touch events to convert to pointer events
 *
 * @class Pointer
 * @static
 */
var Pointer = {

    /**
     * Enable tracking of touch/mouse events
     *
     * @method enable
     */
    enable: function() {
        if (_isEnabled) {
            return;
        }

        _isEnabled = true;

        Util
            .on(TouchHandler.events, TouchHandler.onEvent)
            .on(MouseHandler.events, MouseHandler.onEvent);
    },

    /**
     * Disable tracking of touch/mouse events
     *
     * @method disable
     */
    disable: function() {
        if (!_isEnabled) {
            return;
        }

        _isEnabled = false;

        Util
            .off(TouchHandler.events, TouchHandler.onEvent)
            .off(MouseHandler.events, MouseHandler.onEvent);
    }

};

module.exports = Pointer;
},{"./Util":4,"./handlers/Mouse":12,"./handlers/Touch":13}],4:[function(require,module,exports){
/**
 * Cached array
 *
 * @type Array
 * @static
 * @private
 */
var CACHED_ARRAY = [];

/**
 * Name of touch attribute to stop browser defaults on touch events
 *
 * @type String
 * @static
 * @private
 * @final
 */
var ATTRIBUTE = 'touch-action';

/**
 * Utility functions
 *
 * @class Pointer.Util
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
        if (!target) {
            target = document.body;
        }

        var i = 0;
        var events = (event instanceof Array) ? event : event.split(' ');
        var length = events.length;

        for (; i < length; i++) {
            if (target.addEventListener) {
                target.addEventListener(events[i], callback, false);
            } else {
                target.attachEvent('on' + events[i], callback);
            }
        }

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
        if (!target) {
            target = document.body;
        }

        var i = 0;
        var events = (event instanceof Array) ? event : event.split(' ');
        var length = events.length;

        for (; i < length; i++) {
            if (target.removeEventListener) {
                target.removeEventListener(events[i], callback, false);
            } else {
                target.detachEvent('on' + events[i], callback);
            }
        }

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
            CACHED_ARRAY.length = 0;
            var current = child;

            while(current = current.parentNode) {
                CACHED_ARRAY.push(current);
            }

            return Util.indexOf(CACHED_ARRAY, target) !== -1;
        }
    },

    /**
     * Determine if `target` or a parent node of `target` has
     * a `touch-action` attribute with a value of `none`.
     *
     * @method hasTouchAction
     * @param {Element} target
     * @param {Function} target.getAttribute
     * @returns {Boolean}
     */
    hasTouchAction: function(target) {
        while (target.getAttribute && !target.getAttribute(ATTRIBUTE)) {
            target = target.parentNode;
        }

        return target.getAttribute && target.getAttribute(ATTRIBUTE) === 'none' || false;
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
 * @class Pointer.Adapter.EventjQuery
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
 * @class Pointer.Adapter.TouchArea.Attribute
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
 * @class Pointer.Event
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
},{}],10:[function(require,module,exports){
var Events = require('./Events');

/**
 * Map of mouse/touch event to their respective pointer event(s)
 * When these events (keys) are captured, the defined pointer event(s) are fired.
 *
 * Values can be either a single event name, or an array of event names.
 *
 * @class Pointer.Event.Map
 * @static
 * @final
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
     * @property touchcancel
     * @type String
     */
    touchcancel: Events.CANCEL,

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
},{"./Events":9}],11:[function(require,module,exports){
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
 * Max time between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_TIME = 750;

/**
 * Max x/y distance between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_POSITION = 15;

/**
 * @class Pointer.Event.Tracker
 * @static
 */
var EventTracker = {

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {Event} event
     * @param {String} event.type
     * @param {String} overrideEventName
     * @chainable
     */
    register: function(event, overrideEventName) {
        var eventName = overrideEventName || event.type;

        if (LAST_EVENTS.hasOwnProperty(eventName)) {
            LAST_EVENTS[eventName][event.pointerId] = event;
        }

        return this;
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

            // Check timestamp delta if `event.type` is not mouseout - mouseout
            // event don't fire until the next touch on touch devices.
            if (event.type !== 'mouseout') {
                var dt = Math.abs(event.timeStamp - pointer.timeStamp);

                // If too much time has passed since the last touch
                // event, remove it so we no longer test against it.
                // Then return false to avoid checking anything else.
                if (dt > DELTA_TIME) {
                    LAST_EVENTS[eventName][pointerId] = null;
                    continue;
                }
            }

            var dx = Math.abs(pointer.pageX - event.pageX);
            var dy = Math.abs(pointer.pageY - event.pageY);

            if (dx <= DELTA_POSITION && dy <= DELTA_POSITION) {
                return true;
            }
        }

        return false;
    }

};

module.exports = EventTracker;
},{}],12:[function(require,module,exports){
var Util = require('../Util');
var Controller = require('../Controller');
var Tracker = require('../event/Tracker');

/**
 * Event to detect mouseenter events with
 * @type String
 * @static
 * @private
 */
var ENTER_EVENT = 'mouseover';

/**
 * Event to detect mouseleave events with
 * @type String
 * @static
 * @private
 */
var EXIT_EVENT = 'mouseout';

/**
 * Mouse enter/leave event map
 * @type Object
 * @static
 * @private
 */
var ENTER_LEAVE_EVENT_MAP = {
    mouseover: 'mouseenter',
    mouseout: 'mouseleave'
};

/**
 * Determine if we have moused over a new target.
 * Browsers implementation of mouseenter/mouseleave is shaky, so we are manually detecting it.
 *
 * @param {MouseEvent} event
 * @param {String} event.type
 * @param {Element} event.target
 * @param {Element} event.relatedTarget
 * @private
 */
var _detectMouseEnterOrLeave = function(event) {
    var target = event.target;
    var related = event.relatedTarget;
    var eventName = ENTER_LEAVE_EVENT_MAP[event.type];

    if (!related || !Util.contains(target, related)) {
        Controller.trigger(event, eventName);
    }
};

/**
 * @class Pointer.Handler.Mouse
 * @static
 */
var MouseHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: [ENTER_EVENT, 'mousedown', 'mousemove', 'mouseup', EXIT_EVENT],

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

            // trigger mouseenter event if applicable
            if (ENTER_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }

            Controller.trigger(event);

            // trigger mouseleave event if applicable
            if (EXIT_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }
        }
    }

};

module.exports = MouseHandler;
},{"../Controller":2,"../Util":4,"../event/Tracker":11}],13:[function(require,module,exports){
var Util = require('../Util');
var TouchAreaAdapter = require('adapter/toucharea');
var Controller = require('../Controller');

/**
 * Touch event names
 *
 * @type String
 * @static
 * @private
 */
var EVENT_ENTER = 'touchenter';
var EVENT_OVER = 'touchover';
var EVENT_START = 'touchstart';
var EVENT_MOVE = 'touchmove';
var EVENT_END = 'touchend';
var EVENT_OUT = 'touchout';
var EVENT_LEAVE = 'touchleave';
var EVENT_CANCEL = 'touchcancel';

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
 * Determine which method to call for each point
 *
 * @type Function
 * @param {String} type
 * @returns {Function}
 * @private
 */
var _getPointMethod = function(type) {
    switch(type) {
        case EVENT_START:
        case EVENT_END:
            return _onPointStartEnd;
        case EVENT_MOVE:
            return _onPointMove;
        default:
            return _onPointCancel;
    }
};

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
            Controller.trigger(event, EVENT_OUT, currentTarget, pointIndex);

            // If the new target is not a child of the previous target, fire a leave event
            if (!Util.contains(currentTarget, newTarget)) {
                Controller.trigger(event, EVENT_LEAVE, currentTarget, pointIndex);
            }
        }

        if (newTarget) {
            // If the current target is not a child of the new target, fire a enter event
            if (!Util.contains(newTarget, currentTarget)) {
                Controller.trigger(event, EVENT_ENTER, newTarget, pointIndex);
            }

            Controller.trigger(event, EVENT_OVER, newTarget, pointIndex);
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
        Controller.trigger(event, EVENT_ENTER, target, pointIndex);
        Controller.trigger(event, EVENT_OVER, target, pointIndex);
    }

    var currentTarget = PREVIOUS_TARGETS[point.identifier] || target;
    Controller.trigger(event, type, currentTarget, pointIndex);

    if (type === EVENT_END) {
        PREVIOUS_TARGETS[point.identifier] = null;
        Controller.trigger(event, EVENT_OUT, currentTarget, pointIndex);
        Controller.trigger(event, EVENT_LEAVE, currentTarget, pointIndex);
    }
};

/**
 * @class Pointer.Handler.Touch
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
        var i = 0;
        var touches = event.changedTouches;
        var length = touches.length;

        var method = _getPointMethod(event.type);

        for (; i < length; i++) {
            method(touches[i], event, i);
        }
    }

};

module.exports = TouchHandler;
},{"../Controller":2,"../Util":4,"adapter/toucharea":"C84uZi"}]},{},[1])
}());;