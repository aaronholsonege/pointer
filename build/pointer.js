!function() {
    var Pointer = {};
    Pointer.a = function() {
        var NAMESPACE = "pointer", Events = {
            MOVE: NAMESPACE + "move",
            ENTER: NAMESPACE + "enter",
            OVER: NAMESPACE + "over",
            DOWN: NAMESPACE + "down",
            UP: NAMESPACE + "up",
            OUT: NAMESPACE + "out",
            LEAVE: NAMESPACE + "leave"
        };
        return Events;
    }();
    Pointer.b = function() {
        var Events = Pointer.a, EventMap = {
            touchstart: [ Events.ENTER, Events.OVER, Events.DOWN ],
            touchmove: Events.MOVE,
            touchend: [ Events.UP, Events.OUT, Events.LEAVE ],
            mouseenter: Events.ENTER,
            mouseover: Events.OVER,
            mousedown: Events.DOWN,
            mousemove: Events.MOVE,
            mouseup: Events.UP,
            mouseout: Events.OUT,
            mouseleave: Events.LEAVE
        };
        return EventMap;
    }();
    Pointer.c = function() {
        var Native = {
            create: function(type, originalEvent, properties) {
                var event = document.createEvent("MouseEvents");
                event.initMouseEvent(type, !properties.noBubble, true, window, 1, properties.screenX || originalEvent.screenX, properties.screenY || originalEvent.screenY, properties.clientX || originalEvent.clientX, properties.clientY || originalEvent.clientY, originalEvent.ctrlKey, originalEvent.altKey, originalEvent.shiftKey, originalEvent.metaKey, originalEvent.button, properties.relatedTarget || originalEvent.relatedTarget || null);
                return event;
            },
            trigger: function(event, target) {
                target.dispatchEvent(event);
            }
        };
        return Native;
    }();
    Pointer.d = function() {
        var Events = Pointer.a, EventMap = Pointer.b, Adapter = Pointer.c, NO_BUBBLE_EVENTS = [ Events.ENTER, Events.LEAVE ], ENTER_LEAVE_EVENT_MAP = {
            mouseover: "mouseenter",
            mouseout: "mouseleave"
        }, PROPS = "screenX screenY pageX pageY offsetX offsetY".split(" "), CACHED_ARRAY = [], _contains = function(target, child) {
            if (target.contains) return target.contains(child);
            CACHED_ARRAY.length = 0;
            for (var current = child; current = current.parentNode; ) CACHED_ARRAY.push(current);
            return -1 !== CACHED_ARRAY.indexOf(target);
        }, _detectMouseEnterOrLeave = function(event) {
            var target = event.target, related = event.relatedTarget, eventName = ENTER_LEAVE_EVENT_MAP[event.type];
            (!related || related !== target && !_contains(target, related)) && PointerEvent.trigger(event, eventName);
        }, PointerEvent = {
            create: function(type, originalEvent) {
                var properties = {
                    noBubble: -1 !== NO_BUBBLE_EVENTS.indexOf(type)
                }, source = originalEvent;
                if (0 === originalEvent.type.indexOf("touch")) {
                    properties.touches = originalEvent.changedTouches;
                    source = properties.touches[0];
                }
                for (var i = 0, length = PROPS.length; length > i; i++) properties[PROPS[i]] = source[PROPS[i]];
                return Adapter.create(type, originalEvent, properties);
            },
            trigger: function(originalEvent, overrideType) {
                if (!originalEvent || !EventMap.hasOwnProperty(originalEvent.type)) return null;
                var _type = overrideType || originalEvent.type;
                ENTER_LEAVE_EVENT_MAP.hasOwnProperty(_type) && _detectMouseEnterOrLeave(originalEvent);
                var type = EventMap[_type];
                type instanceof Array || (type = EventMap[_type] = [ type ]);
                for (var event, i = 0, length = type.length; length > i; i++) {
                    event = this.create(type[i], originalEvent);
                    Adapter.trigger(event, originalEvent.target);
                }
                return event;
            }
        };
        return PointerEvent;
    }();
    Pointer.e = function() {
        var Util = {
            on: function(event, callback, target) {
                target || (target = document.body);
                target.addEventListener ? target.addEventListener(event, callback, false) : target.attachEvent("on" + event, callback);
                return this;
            },
            off: function(event, callback, target) {
                target || (target = document.body);
                target.removeEventListener ? target.removeEventListener(event, callback, false) : target.detachEvent("on" + event, callback);
                return this;
            }
        };
        return Util;
    }();
    Pointer.f = function() {
        var PointerEvent = Pointer.d, Util = Pointer.e, _isEnabled = false, _isTracking = false, _isTrackingTouchEvents = false, _trigger = function(event) {
            return _isTrackingTouchEvents && 0 !== event.type.indeOf("touch") ? null : PointerEvent.trigger(event);
        }, _onDown = function(event) {
            if (!_isTracking) {
                _isTracking = true;
                var pointerEvent = _trigger(event);
                if (!(pointerEvent.defaultPrevented || pointerEvent.isDefaultPrevented && pointerEvent.isDefaultPrevented())) if (0 === event.type.indexOf("touch")) {
                    _isTrackingTouchEvents = true;
                    Util.on("touchmove", _onEvent).on("touchcancel", _onCancel).on("touchend", _onUp);
                } else Util.on("mouseup", _onUp);
            }
        }, _onEvent = function(event) {
            _trigger(event);
        }, _onUp = function(event) {
            _onCancel();
            _trigger(event);
        }, _onCancel = function(event) {
            _trigger(event);
            _isTracking = false;
            _isTrackingTouchEvents = false;
            Util.off("touchmove", _onEvent).off("touchcancel", _onCancel).off("touchend", _onUp).off("mouseup", _onUp);
        }, Watch = {
            enable: function() {
                if (_isEnabled) return this;
                _isEnabled = true;
                Util.on("touchstart", _onDown).on("mouseover", _onEvent).on("mousedown", _onDown).on("mousemove", _onEvent).on("mouseout", _onEvent);
                return this;
            },
            disable: function() {
                if (!_isEnabled) return this;
                _isEnabled = false;
                _onCancel();
                Util.off("touchstart", _onDown).off("mouseover", _onEvent).off("mousedown", _onDown).off("mousemove", _onEvent).off("mouseout", _onEvent);
                return this;
            }
        }, _bind = function(method, context) {
            return function() {
                return method.apply(context, arguments);
            };
        };
        Watch.enable = _bind(Watch.enable, Watch);
        Watch.disable = _bind(Watch.disable, Watch);
        return Watch;
    }();
    var Watch = Pointer.f, Util = Pointer.e, _onReady = function() {
        Util.off("DOMContentLoaded", _onReady, document).off("load", _onReady, window);
        Watch.enable();
    };
    "complete" === document.readyState ? setTimeout(Watch.enable) : Util.on("DOMContentLoaded", _onReady, document).on("load", _onReady, window);
}();