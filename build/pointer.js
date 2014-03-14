(function() {
var Pointer = {};
Pointer.Events = (function() {
    

    /**
     * Pointer event names
     *
     * @class Pointer.Events
     * @static
     */
    var Events = {

        /**
         * @property MOVE
         * @type string
         */
        MOVE: 'pointermove',

        /**
         * @property ENTER
         * @type string
         */
        ENTER: 'pointerenter',

        /**
         * @property OVER
         * @type string
         */
        OVER: 'pointerover',

        /**
         * @property DOWN
         * @type string
         */
        DOWN: 'pointerdown',

        /**
         * @property UP
         * @type string
         */
        UP: 'pointerup',

        /**
         * @property OUT
         * @type string
         */
        OUT: 'pointerout',

        /**
         * @property LEAVE
         * @type string
         */
        LEAVE: 'pointerleave'

    };

    return Events;

}());

Pointer.EventMap = (function() {
    

    var Events = Pointer.Events;

    /**
     * Map of mouse/touch event to their respective pointer event(s)
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

    return EventMap;

}());

Pointer.Adapter = (function() {
    

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

    return Native;

}());

Pointer.PointerEvent = (function() {
    

    var Events = Pointer.Events;
    var EventMap = Pointer.EventMap;
    var Adapter = Pointer.Adapter;

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
     * Determine if we have moused over a new target
     *
     * @param {MouseEvent} event
     * @private
     */
    var _detectMouseEnterOrLeave = function(event) {
        var target = event.target;
        var related = event.relatedTarget;
        var eventName = ENTER_LEAVE_EVENT_MAP[event.type];

        if (!related || (related !== target && !target.contains(related))) {
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
                noBubble: NO_BUBBLE_EVENTS.indexOf(type) !== -1
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
         * @param {String} [overrideType]
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

    return PointerEvent;

}());

Pointer.Watch = (function() {
    

    var PointerEvent = Pointer.PointerEvent;

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

            this
                .on('touchstart', this.onDown)
                .on('mouseover', this.onEvent)
                .on('mousedown', this.onDown)
                .on('mousemove', this.onEvent)
                .on('mouseout', this.onEvent);

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

            this.onCancel();

            this
                .off('touchstart', this.onDown)
                .off('mouseover', this.onEvent)
                .off('mousedown', this.onDown)
                .off('mousemove', this.onEvent)
                .off('mouseout', this.onEvent);

            return this;
        },

        /**
         * Add event listener to body
         *
         * @method on
         * @param {String} event
         * @param {Function} callback
         * @chainable
         */
        on: function(event, callback) {
            document.body.addEventListener(event, callback, false);

            return this;
        },

        /**
         * Remove event listener to body
         *
         * @method off
         * @param {String} event
         * @param {Function} callback
         * @chainable
         */
        off: function(event, callback) {
            document.body.removeEventListener(event, callback, false);

            return this;
        },

        /**
         * Trigger pointer event from a mouse/touch event
         *
         * @method trigger
         * @param {MouseEvent|TouchEvent} event
         * @return {*|null}
         */
        trigger: function(event) {
            if (_isTrackingTouchEvents && event.type.indeOf('touch') !== 0) {
                return null;
            }

            return PointerEvent.trigger(event);
        },

        /**
         * @method onDown
         * @param {MouseEvent|TouchEvent} event
         */
        onDown: function(event) {
            if (_isTracking) {
                return;
            }

            _isTracking = true;

            var pointerEvent = this.trigger(event);

            if (pointerEvent.defaultPrevented || (pointerEvent.isDefaultPrevented && pointerEvent.isDefaultPrevented())) {
                return;
            }

            if (event.type.indexOf('touch') === 0) {
                _isTrackingTouchEvents = true;
                this
                    .on('touchmove', this.onEvent)
                    .on('touchcancel', this.onCancel)
                    .on('touchend', this.onUp);
            } else {
                this.on('mouseup', this.onUp);
            }
        },

        /**
         * @method onEvent
         * @param {MouseEvent|TouchEvent} event
         */
        onEvent: function(event) {
            this.trigger(event);
        },

        /**
         * @method onUp
         * @param {MouseEvent|TouchEvent} event
         */
        onUp: function(event) {
            this.onCancel();

            this.trigger(event);
        },

        /**
         * @method onCancel
         * @param {TouchEvent} [event]
         */
        onCancel: function(event) {
            this.trigger(event);

            _isTracking = false;
            _isTrackingTouchEvents = false;

            this
                .on('touchmove', this.onEvent)
                .on('touchcancel', this.onCancel)
                .on('touchend', this.onUp)
                .on('mouseup', this.onUp);
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
    var prop;
    for (prop in Watch) {
        if (!Watch.hasOwnProperty(prop) || typeof Watch[prop] !== 'function') {
            continue;
        }

        Watch[prop] = _bind(Watch[prop], Watch);
    }

    return {
        enable: Watch.enable,
        disable: Watch.disable
    };

}());


    

    var Watch = Pointer.Watch;

    // Initialize Pointer when the page is ready
    var _onReady = function() {
        document.removeEventListener('DOMContentLoaded', _onReady, false);
        window.removeEventListener('load', _onReady, false);
        Watch.enable();
    };

    if (document.readyState === 'complete') {
        setTimeout(Watch.enable);
    } else {
        document.addEventListener('DOMContentLoaded', _onReady, false);
        window.addEventListener('load', _onReady, false);
    }

;
}());