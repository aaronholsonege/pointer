define(function(require) {
    'use strict';

    var Events = require('Events');
    var EventMap = require('EventMap');
    var Adapter = require('Adapter');

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

            return CACHED_ARRAY.indexOf(target) !== -1;
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

});