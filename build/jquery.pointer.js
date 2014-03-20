(function() {
var require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Pointer = require('./Pointer');
var Util = require('./Util');

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
var PROPS = 'screenX screenY pageX pageY offsetX offsetY'.split(' ');

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
     * @return {*} Event created from adapter
     */
    create: function(type, originalEvent) {
        var properties = {
            noBubble: Util.indexOf(NO_BUBBLE_EVENTS, type) !== -1
        };

        var source = originalEvent;

        if (originalEvent.type.indexOf('touch') === 0) {
            properties.changedTouches = originalEvent.changedTouches;
            properties.touches = originalEvent.touches;
            source = properties.changedTouches[0];
            properties.pointerType = 'touch';
            properties.pointerId = 1 + source.identifier;
        } else {
            properties.pointerId = 0;
            properties.pointerType = 'mouse';
        }

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

        return Adapter.create(type, originalEvent, properties);
    },

    /**
     * Trigger a pointer event from a native mouse/touch event
     *
     * @method trigger
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {String} [overrideType] Use this event instead of `originalEvent.type` when mapping to a pointer event
     * @param {Element} [overrideTarget] target to dispatch event from
     */
    trigger: function(originalEvent, overrideType, overrideTarget) {
        var eventName = overrideType || originalEvent.type;

        if (!originalEvent || !EventMap.hasOwnProperty(eventName)) {
            return;
        }

        var type = EventMap[eventName];
        var event = PointerEvent.create(type, originalEvent);

        if (event) {
            Adapter.trigger(event, overrideTarget || originalEvent.target);
        }
    }

};

module.exports = PointerEvent;
},{"./Util":4,"./event/Events":7,"./event/Map":8,"Adapter":"ccQ5QW"}],3:[function(require,module,exports){
var MouseHandler = require('./handlers/Mouse');
var TouchHandler = require('./handlers/Touch');

/**
 * @type Boolean
 * @static
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

        TouchHandler.enable();
        MouseHandler.enable();
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

        TouchHandler.disable();
        MouseHandler.disable();
    }

};

module.exports = Pointer;
},{"./handlers/Mouse":10,"./handlers/Touch":11}],4:[function(require,module,exports){
/**
 * Cached array
 *
 * @type Array
 * @static
 */
var CACHED_ARRAY = [];

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
     * Perform indexOf on array
     *
     * @method indexOf
     * @param {Array} array
     * @param {*} item
     * @return {Number}
     */
    indexOf: function(array, item) {
        if (Array.prototype.indexOf) {
            return array.indexOf(item);
        } else {
            var i = 0;
            var length = array.length;

            for (; i < length; i++) {
                if (array[i] === item) {
                    return i;
                }
            }

            return -1;
        }
    },
    /**
     * Determine if `child` is a descendant of `target`
     *
     * @method contains
     * @param {Element} target
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
    }

};

module.exports = Util;
},{}],"ccQ5QW":[function(require,module,exports){
var $ = window.jQuery;

/**
 * jQuery event creating and dispatching.
 *
 * @class Pointer.Adapter.jQuery
 * @static
 */
var jQueryAdapter = {

    /**
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Object} properties
     * @return {$.Event}
     */
    create: function(type, originalEvent, properties) {
        var event = $.Event(originalEvent, properties);
        event.type = type;

        return event;
    },

    /**
     * @method trigger
     * @param {$.Event} event
     * @param {Boolean} [event.noBubble=false]
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {
        $.event.trigger(event, null, target, !!event.noBubble);
    }

};

module.exports = jQueryAdapter;
},{}],"Adapter":[function(require,module,exports){
module.exports=require('ccQ5QW');
},{}],7:[function(require,module,exports){
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

module.exports = Events;
},{}],8:[function(require,module,exports){
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
},{"./Events":7}],9:[function(require,module,exports){
/**
 * Mouse > touch map
 *
 * @type Object
 * @static
 */
var MAP = {
    mouseenter: 'touchenter',
    mouseover: 'touchover',
    mousedown: 'touchstart',
    mouseup: 'touchend',
    mouseout: 'touchout',
    mouseleave: 'touchleave'
};

/**
 * The last triggered touch events to compare mouse
 * events to to determine if they are emulated.
 *
 * @type Object
 * @static
 */
var LAST_EVENTS = {
    touchenter: null,
    touchover: null,
    touchstart: null,
    touchend: null,
    touchout: null,
    touchleave: null
};

/**
 * Max time between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_TIME = 300;

/**
 * Max x/y distance between touch and simulated mouse event
 *
 * @type Number
 * @static
 */
var DELTA_POSITION = 5;

/**
 * @class Pointer.Event.Tracker
 * @static
 */
var EventTracker = {

    /**
     * The last event target
     *
     * @property lastTarget
     * @type HTMLElement|null
     */
    lastTarget: null,

    /**
     * Register a touch event used to determine if mouse events are emulated
     *
     * @method register
     * @param {MouseEvent|TouchEvent} event
     * @param {String} overrideEventName
     * @chainable
     */
    register: function(event, overrideEventName) {
        var eventName = overrideEventName || event.type;

        if (LAST_EVENTS.hasOwnProperty(eventName)) {
            LAST_EVENTS[eventName] = event;
        }

        return this;
    },

    /**
     * Determine if a mouse event has been emulated
     *
     * @method isEmulated
     * @param {MouseEvent|TouchEvent} event
     * @returns {Boolean}
     */
    isEmulated: function(event) {
        if (!MAP.hasOwnProperty(event.type)) {
            return false;
        }

        var eventName = MAP[event.type];
        var last = LAST_EVENTS[eventName];

        if (!last) {
            return false;
        }

        var touch = last.changedTouches[0];

        var dx = Math.abs(touch.pageX - event.pageX);
        var dy = Math.abs(touch.pageY - event.pageY);
        var dt = Math.abs(last.timeStamp - event.timeStamp);

        // If too much time has passed since the last touch
        // event, remove it so we no longer test against it.
        if (dt > DELTA_TIME) {
            LAST_EVENTS[eventName] = null;
        }

        return (dx <= DELTA_POSITION && dy <= DELTA_POSITION && dt <= DELTA_TIME);
    }

};

module.exports = EventTracker;
},{}],10:[function(require,module,exports){
var Util = require('../Util');
var Controller = require('../Controller');
var EventTracker = require('../event/Tracker');

/**
 * Event to detect mouseenter events with
 * @type String
 * @static
 */
var ENTER_EVENT = 'mouseover';

/**
 * Event to detect mouseleave events with
 * @type String
 * @static
 */
var EXIT_EVENT = 'mouseout';

/**
 * Mouse enter/leave event map
 * @type Object
 * @static
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
 * @private
 */
var _detectMouseEnterOrLeave = function(event) {
    var target = event.target;
    var related = EventTracker.lastTarget;
    var eventName = ENTER_LEAVE_EVENT_MAP[event.type];

    if (!related || !Util.contains(target, related)) {
        Controller.trigger(event, eventName);
    }
};

/**
 * @class Pointer.Handler.Mouse
 * @type Object
 * @static
 */
var MouseHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: ['mouseover', 'mousedown', 'mousemove', 'mouseup', 'mouseout'],

    /**
     * Enable event listeners
     *
     * @method enable
     */
    enable: function() {
        Util.on(this.events, this.onEvent);
    },

    /**
     * Disable event listeners
     *
     * @method disable
     */
    disable: function() {
        Util.off(this.events, this.onEvent);
    },

    /**
     * If event is not simulated, convert to pointer
     *
     * @method onEvent
     * @param {MouseEvent} event
     * @callback
     */
    onEvent: function(event) {
        if (!EventTracker.isEmulated(event)) {

            // trigger mouseenter event if applicable
            if (ENTER_EVENT === event.type) {
                _detectMouseEnterOrLeave(event);
            }

            Controller.trigger(event);
            EventTracker.lastTarget = event.target;

            // trigger mouseleave event if applicable
            if (EXIT_EVENT === event.type) {
                EventTracker.lastTarget = event.relatedTarget;
                _detectMouseEnterOrLeave(event);
            }
        }
    }

};

module.exports = MouseHandler;
},{"../Controller":2,"../Util":4,"../event/Tracker":9}],11:[function(require,module,exports){
var Util = require('../Util');
var Controller = require('../Controller');
var EventTracker = require('../event/Tracker');

/**
 * Event to detect touchenter events with
 *
 * @type String
 * @static
 */
var ENTER_EVENT = 'touchstart';

/**
 * Custom enter/over/out/leave touch events names
 *
 * @type Object
 * @static
 */
var EVENTS = {
    OUT: 'touchout',
    LEAVE: 'touchleave',
    ENTER: 'touchenter',
    OVER: 'touchover'
};

/**
 * Determine if we have touched over a new target.
 *
 * @param {TouchEvent} event
 * @param {Element} lastTarget
 * @private
 */
var _detectMouseEnterOrLeave = function(event, lastTarget) {
    var target = event.target;

    // Emulate touchout
    if (lastTarget && lastTarget !== target) {
        EventTracker.register(event, EVENTS.OUT);
        Controller.trigger(event, EVENTS.OUT, lastTarget);
    }

    // Emulate touchleave
    if (lastTarget && !Util.contains(lastTarget, target)) {
        EventTracker.register(event, EVENTS.LEAVE);
        Controller.trigger(event, EVENTS.LEAVE, lastTarget);
    }

    // Emulate touchenter
    if (!lastTarget || !Util.contains(target, lastTarget)) {
        EventTracker.register(event, EVENTS.ENTER);
        Controller.trigger(event, EVENTS.ENTER);
    }

    // Emulate touchover
    if (lastTarget !== target) {
        EventTracker.register(event, EVENTS.OVER);
        Controller.trigger(event, EVENTS.OVER);
    }
};

/**
 * @class Pointer.Handler.Touch
 * @type Object
 * @static
 */
var TouchHandler = {

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: ['touchstart' ,'touchmove', 'touchend', 'touchcancel'],

    /**
     * Enable event listeners
     *
     * @method enable
     */
    enable: function() {
        Util.on(this.events, this.onEvent);
    },

    /**
     * Disable event listeners
     *
     * @method disable
     */
    disable: function() {
        Util.off(this.events, this.onEvent);
    },

    /**
     * Register event (for mouse simulation detection) and convert to pointer
     *
     * @method onEvent
     * @param {TouchEvent} event
     * @callback
     */
    onEvent: function(event) {
        EventTracker.register(event);

        if (event.type === ENTER_EVENT) {
            _detectMouseEnterOrLeave(event, EventTracker.lastTarget);
        }

        Controller.trigger(event);
        EventTracker.lastTarget = event.target;
    }

};

module.exports = TouchHandler;
},{"../Controller":2,"../Util":4,"../event/Tracker":9}]},{},[1])
}());