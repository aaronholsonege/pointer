require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Events = require('./Events');

/**
 * Map of mouse/touch event to their respective pointer event(s)
 * When these events (keys) are captured, the defined pointer event(s) are fired.
 *
 * Values can be either a single event name, or an array of event names.
 *
 * @class Pointer.EventMap
 * @static
 */
var EventMap = {

    /**
     * @property touchstart
     * @type String[]
     */
    touchstart: [Events.ENTER, Events.OVER, Events.DOWN],

    /**
     * @property touchmove
     * @type String
     */
    touchmove: Events.MOVE,

    /**
     * @property touchend
     * @type String[]
     */
    touchend: [Events.UP, Events.OUT, Events.LEAVE],

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
},{"./Events":2}],2:[function(require,module,exports){
/**
 * Pointer event namespace.
 * This is prepended to the pointer events
 *
 * @type {string}
 * @final
 */
var NAMESPACE = 'pointer';

/**
 * Pointer event names
 *
 * @class Pointer.Events
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
},{}],3:[function(require,module,exports){
var Watch = require('./Watch');
var Util = require('./Util');

// Initialize Pointer when the page is ready
var _onReady = function() {
    Util
        .off('DOMContentLoaded', _onReady, document)
        .off('load', _onReady, window);
    Watch.enable();
};

if (document.readyState === 'complete') {
    setTimeout(Watch.enable);
} else {
    Util
        .on('DOMContentLoaded', _onReady, document)
        .on('load', _onReady, window);
}
},{"./Util":5,"./Watch":6}],4:[function(require,module,exports){
var Events = require('./Events');
var EventMap = require('./EventMap');
var Adapter = require('Adapter');
var Util = require('./Util');

/**
 * Pointer events that should not bubble
 * @type String[]
 * @static
 */
var NO_BUBBLE_EVENTS = [Events.ENTER, Events.LEAVE];

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
 * Properties to copy from original event to new event
 *
 * @type String[]
 * @static
 */
var PROPS = 'screenX screenY pageX pageY offsetX offsetY'.split(' ');

/**
 * Cached array
 *
 * @type Array
 * @static
 */
var CACHED_ARRAY = [];

/**
 * Determine if `child` is a descendant of `target`
 *
 * @param {HTMLElement} target
 * @param {HTMLElement} child
 * @return {Boolean}
 * @private
 */
var _contains = function(target, child) {
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
};

/**
 * Determine if we have moused over a new target
 *
 * @param {MouseEvent} event
 * @private
 */
var _detectMouseEnterOrLeave = function(event) {
    var target = event.target;
    var related = event.relatedTarget;
    var eventName = ENTER_LEAVE_EVENT_MAP[event.type];

    if (!related || (related !== target && !_contains(target, related))) {
        PointerEvent.trigger(event, eventName);
    }
};

/**
 * Create and trigger pointer events
 *
 * @class Pointer.PointerEvent
 * @static
 */
var PointerEvent = {

    /**
     * Create a new pointer event
     *
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @return {*} Event created from adapter
     */
    create: function(type, originalEvent) {
        var properties = {
            noBubble: Util.indexOf(NO_BUBBLE_EVENTS, type) !== -1
        };

        var source = originalEvent;

        if (originalEvent.type.indexOf('touch') === 0) {
            properties.touches = originalEvent.changedTouches;
            source = properties.touches[0];
        }

        var i = 0;
        var length = PROPS.length;

        for (; i < length; i++) {
            properties[PROPS[i]] = source[PROPS[i]];
        }

        return Adapter.create(type, originalEvent, properties);
    },

    /**
     * Trigger a pointer event from a native mouse/touch event
     *
     * @method trigger
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {String} [overrideType] Use this event instead of `originalEvent.type` when mapping to a pointer event
     * @return {*} Event created from adapter
     */
    trigger: function(originalEvent, overrideType) {
        if (!originalEvent || !EventMap.hasOwnProperty(originalEvent.type)) {
            return null;
        }

        var _type = overrideType || originalEvent.type;

        // trigger pointerenter/pointerleave events if applicable
        // browsers implementation of mouseenter/mouseleave is shaky, so we are manually detecting it.
        if (ENTER_LEAVE_EVENT_MAP.hasOwnProperty(_type)) {
            _detectMouseEnterOrLeave(originalEvent);
        }

        var type = EventMap[_type];

        if (!(type instanceof Array)) {
            type = EventMap[_type] = [type];
        }

        var i = 0;
        var length = type.length;
        var event;

        for (; i < length; i++) {
            event = this.create(type[i], originalEvent);
            Adapter.trigger(event, originalEvent.target);
        }

        return event;
    }

};

module.exports = PointerEvent;
},{"./EventMap":1,"./Events":2,"./Util":5,"Adapter":"ivQJWr"}],5:[function(require,module,exports){
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
     * @param {String} event
     * @param {Function} callback
     * @param {HTMLElement} [target=document.body]
     * @chainable
     */
    on: function(event, callback, target) {
        if (!target) {
            target = document.body;
        }

        if (target.addEventListener) {
            target.addEventListener(event, callback, false);
        } else {
            target.attachEvent('on' + event, callback);
        }

        return this;
    },

    /**
     * Remove event listener from target
     *
     * @method on
     * @param {String} event
     * @param {Function} callback
     * @param {HTMLElement} [target=document.body]
     * @chainable
     */
    off: function(event, callback, target) {
        if (!target) {
            target = document.body;
        }

        if (target.removeEventListener) {
            target.removeEventListener(event, callback, false);
        } else {
            target.detachEvent('on' + event, callback);
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
    }

};

module.exports = Util;
},{}],6:[function(require,module,exports){
var PointerEvent = require('./PointerEvent');
var Util = require('./Util');

/**
 * @type Boolean
 * @static
 */
var _isEnabled = false;

/**
 * @type Boolean
 * @static
 */
var _isTracking = false;

/**
 * @type Boolean
 * @static
 */
var _isTrackingTouchEvents = false;

/**
 * Trigger pointer event from a mouse/touch event
 *
 * @param {MouseEvent|TouchEvent} event
 * @return {*|null}
 * @privvate
 */
var _trigger = function(event) {
    if (_isTrackingTouchEvents && event.type.indeOf('touch') !== 0) {
        return null;
    }

    return PointerEvent.trigger(event);
};

/**
 * Start tracking touch/mouse movements after down
 *
 * @param {MouseEvent|TouchEvent} event
 * @private
 */
var _onDown = function(event) {
    if (_isTracking) {
        return;
    }

    _isTracking = true;

    var pointerEvent = _trigger(event);

    if (pointerEvent.defaultPrevented || (pointerEvent.isDefaultPrevented && pointerEvent.isDefaultPrevented())) {
        return;
    }

    if (event.type.indexOf('touch') === 0) {
        _isTrackingTouchEvents = true;
        Util
            .on('touchmove', _onEvent)
            .on('touchcancel', _onCancel)
            .on('touchend', _onUp);
    } else {
        Util.on('mouseup', _onUp);
    }
};

/**
 * @param {MouseEvent|TouchEvent} event
 * @private
 */
var _onEvent = function(event) {
    _trigger(event);
};

/**
 * @param {MouseEvent|TouchEvent} event
 * @private
 */
var _onUp = function(event) {
    _onCancel();

    _trigger(event);
};

/**
 * Remove event listeners for active touch/mouse
 * @param {TouchEvent} [event]
 * @private
 */
var _onCancel = function(event) {
    _trigger(event);

    _isTracking = false;
    _isTrackingTouchEvents = false;

    Util
        .off('touchmove', _onEvent)
        .off('touchcancel', _onCancel)
        .off('touchend', _onUp)
        .off('mouseup', _onUp);
};

/**
 * Bind mouse/touch events to convert to pointer events
 *
 * @class Pointer.Watch
 * @static
 */
var Watch = {

    /**
     * Enable tracking of touch/mouse events
     *
     * @method enable
     * @chainable
     */
    enable: function() {
        if (_isEnabled) {
            return this;
        }

        _isEnabled = true;

        Util
            .on('touchstart', _onDown)
            .on('mouseover', _onEvent)
            .on('mousedown', _onDown)
            .on('mousemove', _onEvent)
            .on('mouseout', _onEvent);

        return this;
    },

    /**
     * Disable tracking of touch/mouse events
     *
     * @method disable
     * @chainable
     */
    disable: function() {
        if (!_isEnabled) {
            return this;
        }

        _isEnabled = false;

        _onCancel();

        Util
            .off('touchstart', _onDown)
            .off('mouseover', _onEvent)
            .off('mousedown', _onDown)
            .off('mousemove', _onEvent)
            .off('mouseout', _onEvent);

        return this;
    }

};

/**
 * Bind `method` to `context`
 *
 * @param {Function} method
 * @param {*} context
 * @return {Function}
 * @private
 */
var _bind = function(method, context) {
    return function() {
        return method.apply(context, arguments);
    };
};

// Bind all method to the context of Watch
Watch.enable = _bind(Watch.enable, Watch);
Watch.disable = _bind(Watch.disable, Watch);

module.exports = Watch;
},{"./PointerEvent":4,"./Util":5}],"ivQJWr":[function(require,module,exports){
/**
 * @class Pointer.Adapter.Native
 * @static
 */
var Native = {

    /**
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Object} properties
     * @return {jQuery.Event}
     */
    create: function(type, originalEvent, properties) {
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent(
            type,
            !properties.noBubble, // can bubble
            true, // cancelable
            window,
            1,
            properties.screenX || originalEvent.screenX,
            properties.screenY || originalEvent.screenY,
            properties.clientX || originalEvent.clientX,
            properties.clientY || originalEvent.clientY,
            originalEvent.ctrlKey,
            originalEvent.altKey,
            originalEvent.shiftKey,
            originalEvent.metaKey,
            originalEvent.button,
            properties.relatedTarget || originalEvent.relatedTarget || null
        );

        if (!event.pageX !== originalEvent.pageX) {
            Object.defineProperty(event, 'pageX', {
                get: function() {
                    return originalEvent.pageX;
                }
            });
            Object.defineProperty(event, 'pageY', {
                get: function() {
                    return originalEvent.pageY;
                }
            });
        }

        return event;
    },

    /**
     * @method trigger
     * @param {MouseEvent} event
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {
        target.dispatchEvent(event);
    }

};

module.exports = Native;
},{}],"Adapter":[function(require,module,exports){
module.exports=require('ivQJWr');
},{}]},{},[3])