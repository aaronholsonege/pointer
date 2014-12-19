(function() {
    var eventEvents, adapterEvent, eventTracker, Controller, handlersMouse, adapterToucharea, handlersTouch, Pointer, Bootstrap, _Util_;
    _Util_ = function(require) {
        var _addOrRemoveEvent = function(event, callback, target, add) {
            if (!target) {
                target = document.body;
            }
            var i = 0;
            var events = event instanceof Array ? event : event.split(" ");
            var length = events.length;
            var method = (add ? "add" : "remove") + "EventListener";
            for (;i < length; i++) {
                if (target[method]) {
                    target[method](events[i], callback, false);
                } else {
                    target[(add ? "attach" : "detach") + "Event"]("on" + events[i], callback);
                }
            }
        };
        return {
            on: function(event, callback, target) {
                _addOrRemoveEvent(event, callback, target, true);
                return this;
            },
            off: function(event, callback, target) {
                _addOrRemoveEvent(event, callback, target);
                return this;
            },
            indexOf: function(array, item) {
                var i = 0;
                var length = array.length;
                for (;i < length; i++) {
                    if (array[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
            contains: function(target, child) {
                if (target === child) {
                    return true;
                }
                if (target.contains) {
                    return target.contains(child);
                } else {
                    do {
                        if (child === target) {
                            return true;
                        }
                    } while (child = child.parentNode);
                    return false;
                }
            },
            getTarget: function(event, target) {
                target = target || event.target || event.srcElement || document;
                if (target.nodeType === 3) {
                    target = target.parentNode;
                }
                return target;
            },
            now: Date.now || function() {
                return +new Date();
            },
            getId: function(event) {
                var point = 0;
                if ("identifier" in event) {
                    point = event.identifier + 1;
                }
                return point;
            }
        };
    }({});
    eventEvents = function(require) {
        var _defineEvents = function(namespace, isTouch) {
            return [ namespace + "enter", namespace + "over", namespace + (isTouch ? "start" : "down"), namespace + "move", namespace + (isTouch ? "end" : "up"), namespace + "out", namespace + "leave", namespace + "cancel" ];
        };
        var PointerEvents = _defineEvents("pointer");
        var MouseEvents = _defineEvents("mouse");
        var TouchEvents = _defineEvents("touch", true);
        var MAP = {};
        var i = 0;
        var length = PointerEvents.length;
        for (;i < length; i++) {
            if (TouchEvents[i]) {
                MAP[TouchEvents[i]] = PointerEvents[i];
            }
            if (MouseEvents[i]) {
                MAP[MouseEvents[i]] = PointerEvents[i];
            }
        }
        return {
            POINTER: PointerEvents,
            MOUSE: MouseEvents,
            TOUCH: TouchEvents,
            MAP: MAP
        };
    }({});
    adapterEvent = function(require) {
        var _overrideMethod = function(method, event, originalEvent) {
            var originalMethod = event[method];
            event[method] = function() {
                originalEvent[method]();
                originalMethod.call(this);
            };
        };
        return {
            create: function(type, originalEvent, properties, bubbles) {
                var event = document.createEvent("Event");
                event.initEvent(type, bubbles !== false, properties.cancelable !== false);
                var prop;
                for (prop in properties) {
                    if (properties.hasOwnProperty(prop)) {
                        event[prop] = properties[prop];
                    }
                }
                if (originalEvent) {
                    _overrideMethod("preventDefault", event, originalEvent);
                    _overrideMethod("stopPropagation", event, originalEvent);
                    _overrideMethod("stopImmediatePropagation", event, originalEvent);
                }
                return event;
            },
            trigger: function(event, target) {
                target.dispatchEvent(event);
            }
        };
    }({});
    eventTracker = function(require) {
        var Adapter = adapterEvent;
        var Util = _Util_;
        var MAP = {
            mouseover: "touchover",
            mousedown: "touchstart",
            mousemove: "touchend",
            mouseup: "touchend",
            mouseout: "touchstart"
        };
        var LAST_EVENTS = {
            touchover: {},
            touchstart: {},
            touchend: {},
            touchout: {}
        };
        var TARGET_LOCKS = {};
        var DELTA_TIME = 3e3;
        var CAPTURE_DATA = {
            cancelable: false
        };
        return {
            hasTouched: false,
            isMouseDown: false,
            init: function() {
                var element = window.Element;
                if (element) {
                    this.setCaptureMethods(element.prototype);
                }
            },
            setCaptureMethods: function(target) {
                target.setPointerCapture = this.capturePointer;
                target.releasePointerCapture = this.releasePointer;
            },
            capturePointer: function(pointerId) {
                TARGET_LOCKS[pointerId] = this;
                var event = Adapter.create("gotpointercapture", null, CAPTURE_DATA);
                Adapter.trigger(event, this);
            },
            releasePointer: function(pointerId) {
                var lastTarget = TARGET_LOCKS[pointerId];
                TARGET_LOCKS[pointerId] = null;
                if (lastTarget) {
                    var event = Adapter.create("lostpointercapture", null, CAPTURE_DATA);
                    Adapter.trigger(event, lastTarget);
                }
            },
            register: function(event, overrideEventName, target) {
                var eventName = overrideEventName || event.type;
                if (LAST_EVENTS.hasOwnProperty(eventName)) {
                    LAST_EVENTS[eventName][event.pointerId] = {
                        timeStamp: Util.now(),
                        x: event.clientX,
                        y: event.clientY,
                        target: target || event.target
                    };
                    this.hasTouched = true;
                }
                return this;
            },
            getTarget: function(pointerEvent) {
                return TARGET_LOCKS[pointerEvent.pointerId || pointerEvent];
            },
            isSimulated: function(event) {
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
                var now = Util.now();
                var target = Util.getTarget(event);
                if (event.type === "mouseout") {
                    target = event.relatedTarget;
                }
                for (pointerId in previousEvent) {
                    if (!previousEvent.hasOwnProperty(pointerId) || !previousEvent[pointerId]) {
                        continue;
                    }
                    pointer = previousEvent[pointerId];
                    if (Math.abs(now - pointer.timeStamp) > DELTA_TIME) {
                        LAST_EVENTS[eventName][pointerId] = null;
                        continue;
                    }
                    if (pointer.target === target && pointer.x === event.clientX && pointer.y === event.clientY) {
                        return true;
                    }
                }
                return false;
            }
        };
    }({});
    Controller = function(require) {
        var Events = eventEvents;
        var Adapter = adapterEvent;
        var Tracker = eventTracker;
        var Util = _Util_;
        var PointerEvents = Events.POINTER;
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
            pressure: .5
        };
        var _getProperties = function(type, originalEvent, touchIndex) {
            var source = originalEvent;
            var pointerId = 0;
            var pointerType = "mouse";
            var properties = {
                timeStamp: originalEvent.timeStamp || Util.now()
            };
            if (originalEvent.type.indexOf("touch") === 0) {
                source = originalEvent.changedTouches[touchIndex || 0];
                pointerId = 1 + (touchIndex || 0);
                pointerType = "touch";
            }
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
            properties.x = properties.pageX;
            properties.y = properties.pageY;
            if (pointerId == 0) {
                properties.pressure = Tracker.isMouseDown ? .5 : 0;
            }
            properties.pointerId = pointerId;
            properties.pointerType = pointerType;
            return properties;
        };
        var _getPageOffset = function(left) {
            var doc = document;
            var body = doc.body;
            var prop = left ? "Left" : "Top";
            var scroll = "scroll" + prop;
            var client = "client" + prop;
            return (doc[scroll] || body[scroll] || 0) - (doc[client] || body[client] || 0);
        };
        var _detectEnterOrLeave = function(eventName, event, target, relatedTarget, pointerId) {
            var pointerEvent;
            if (!relatedTarget) {
                relatedTarget = event.relatedTarget;
            }
            do {
                if (!relatedTarget || !Util.contains(target, relatedTarget)) {
                    pointerEvent = _create(eventName, event, pointerId);
                    if (pointerEvent) {
                        if (pointerEvent.pointerType === "touch") {
                            Tracker.register(pointerEvent, eventName, target);
                        }
                        Adapter.trigger(pointerEvent, target);
                    }
                } else {
                    break;
                }
            } while (target = target.parentNode);
        };
        var _create = function(type, originalEvent, touchIndex) {
            var properties = _getProperties(type, originalEvent, touchIndex);
            return Adapter.create(type, originalEvent, properties, type !== PointerEvents[0] && type !== PointerEvents[6]);
        };
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
                if (event.pointerType === "touch") {
                    Tracker.register(event, eventName, target);
                }
                if (type === PointerEvents[1]) {
                    _detectEnterOrLeave(PointerEvents[0], originalEvent, target, relatedTarget, pointerId);
                }
                Adapter.trigger(event, target);
                if (event.type === PointerEvents[4] || event.type === PointerEvents[7]) {
                    Tracker.releasePointer(event.pointerId);
                }
                if (type === PointerEvents[5]) {
                    _detectEnterOrLeave(PointerEvents[6], originalEvent, target, relatedTarget, pointerId);
                }
            }
        };
        return {
            create: _create,
            trigger: _trigger
        };
    }({});
    handlersMouse = function(require) {
        var Util = _Util_;
        var Events = eventEvents.MOUSE;
        var Tracker = eventTracker;
        var _on = _Util_.on;
        var trigger = Controller.trigger;
        var EVENT_OVER = Events[1];
        var EVENT_DOWN = Events[2];
        var EVENT_MOVE = Events[3];
        var EVENT_UP = Events[4];
        var EVENT_OUT = Events[5];
        var _onMouseUp = function(event) {
            Tracker.isMouseActive = false;
            if (event.target === document.documentElement) {
                Tracker.releasePointer(Util.getId(event));
            }
        };
        _on("mouseup", _onMouseUp, window);
        _on("contextmenu", _onMouseUp, window);
        return {
            events: [ EVENT_OVER, EVENT_DOWN, EVENT_MOVE, EVENT_UP, EVENT_OUT ],
            onEvent: function(event) {
                if (Tracker.hasTouched && Tracker.isSimulated(event)) {
                    try {
                        event._isSimulated = true;
                    } catch (e) {}
                    return;
                }
                if (event.type === EVENT_DOWN) {
                    Tracker.isMouseDown = true;
                } else if (event.type === EVENT_UP) {
                    Tracker.isMouseDown = false;
                }
                trigger(event, Tracker.getTarget(Util.getId(event)));
            }
        };
    }({});
    adapterToucharea = function(require) {
        var ATTRIBUTE = "touch-action";
        return {
            detect: function(target) {
                while (target.hasAttribute && !target.hasAttribute(ATTRIBUTE)) {
                    target = target.parentNode;
                }
                return target.getAttribute && target.getAttribute(ATTRIBUTE) === "none" || false;
            }
        };
    }({});
    handlersTouch = function(require) {
        var Util = _Util_;
        var Events = eventEvents.TOUCH;
        var TouchAreaAdapter = adapterToucharea;
        var Tracker = eventTracker;
        var trigger = Controller.trigger;
        var EVENT_OVER = Events[1];
        var EVENT_START = Events[2];
        var EVENT_MOVE = Events[3];
        var EVENT_END = Events[4];
        var EVENT_OUT = Events[5];
        var EVENT_CANCEL = Events[7];
        var PREVIOUS_TARGETS = {};
        var PREVIOUS_POSITIONS = {};
        var _onPointCancel = function(point, event, pointIndex) {
            PREVIOUS_TARGETS[point.identifier] = null;
            trigger(event, event.target, EVENT_CANCEL, pointIndex);
            trigger(event, event.target, EVENT_OUT, pointIndex);
        };
        var _onPointMove = function(point, event, pointIndex) {
            var identifier = point.identifier;
            var newTarget = Tracker.getTarget(Util.getId(point)) || document.elementFromPoint(point.clientX, point.clientY);
            var currentTarget = PREVIOUS_TARGETS[identifier];
            PREVIOUS_TARGETS[identifier] = newTarget;
            if (newTarget !== currentTarget) {
                if (currentTarget) {
                    trigger(event, currentTarget, EVENT_OUT, pointIndex, newTarget);
                }
                if (newTarget) {
                    trigger(event, newTarget, EVENT_OVER, pointIndex, currentTarget);
                }
            }
            trigger(event, newTarget, EVENT_MOVE, pointIndex);
            if (newTarget && TouchAreaAdapter.detect(newTarget)) {
                event.preventDefault();
            }
        };
        var _onPointStartEnd = function(point, event, pointIndex) {
            var identifier = point.identifier;
            var target = Tracker.getTarget(Util.getId(point)) || event.target;
            var type = event.type;
            if (type === EVENT_START) {
                PREVIOUS_TARGETS[identifier] = target;
                trigger(event, target, EVENT_OVER, pointIndex);
            }
            var currentTarget = PREVIOUS_TARGETS[identifier] || target;
            trigger(event, currentTarget, type, pointIndex);
            if (type === EVENT_END) {
                PREVIOUS_TARGETS[identifier] = null;
                trigger(event, currentTarget, EVENT_OUT, pointIndex);
            }
        };
        return {
            events: [ EVENT_START, EVENT_MOVE, EVENT_END, EVENT_CANCEL ],
            onEvent: function(event) {
                var i = -1;
                var type = event.type;
                var id;
                var touch;
                var position;
                var method = _onPointCancel;
                if (type === EVENT_START || type === EVENT_END) {
                    method = _onPointStartEnd;
                } else if (type === EVENT_MOVE) {
                    method = _onPointMove;
                }
                while (touch = event.changedTouches[++i]) {
                    id = touch.identifier;
                    if (type === EVENT_MOVE) {
                        position = touch.pageX + "|" + touch.pageY;
                        if (PREVIOUS_POSITIONS[id] === position) {
                            continue;
                        }
                        PREVIOUS_POSITIONS[id] = position;
                    }
                    method(touch, event, i);
                }
            }
        };
    }({});
    Pointer = function(require) {
        var Util = _Util_;
        var MouseHandler = handlersMouse;
        var TouchHandler = handlersTouch;
        var navigator = window.navigator;
        return function() {
            navigator.pointerEnabled = true;
            navigator.maxTouchPoints = 10;
            Util.on(TouchHandler.events, TouchHandler.onEvent).on(MouseHandler.events, MouseHandler.onEvent);
        };
    }({});
    (function(Pointer, Util, EventTracker) {
        if (window.navigator.pointerEnabled === true) {
            return;
        }
        EventTracker.init();
        var _onReady = function() {
            Util.off("DOMContentLoaded", _onReady, document).off("load", _onReady, window);
            Pointer();
        };
        if (document.readyState === "complete") {
            setTimeout(Pointer);
        } else {
            Util.on("DOMContentLoaded", _onReady, document).on("load", _onReady, window);
        }
    })(Pointer, _Util_, eventTracker);
    Bootstrap = undefined;
})();