(function() {
    var require = function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    throw new Error("Cannot find module '" + o + "'");
                }
                var f = n[o] = {
                    exports: {}
                };
                t[o][0].call(f.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, f, f.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
    }({
        1: [ function(require, module, exports) {
            var Pointer = require("./Pointer");
            if (window.navigator.pointerEnabled === true) {
                return;
            }
            window.jQuery(document).ready(Pointer);
        }, {
            "./Pointer": 3
        } ],
        2: [ function(require, module, exports) {
            var Events = require("./event/Events");
            var Adapter = require("adapter/event");
            var Tracker = require("./event/Tracker");
            var Util = require("./Util");
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
            var MOUSE_WHICH_PROP = [ "buttons", "which", "button" ];
            var MOUSE_WHICH_LENTH = MOUSE_WHICH_PROP.length;
            var _getProperties = function(type, originalEvent, touchIndex) {
                var source = originalEvent;
                var pointerId = 0;
                var pointerType = "mouse";
                var properties = {
                    timeStamp: originalEvent.timeStamp || Util.now()
                };
                if (originalEvent.type.indexOf("touch") === 0) {
                    source = originalEvent.changedTouches[touchIndex || 0];
                    pointerId = 1 + source.identifier;
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
                    var which = 0;
                    var i = 0;
                    var prop;
                    for (;i < MOUSE_WHICH_LENTH; i++) {
                        prop = MOUSE_WHICH_PROP[i];
                        if (prop in originalEvent) {
                            which = originalEvent[prop];
                            break;
                        }
                    }
                    properties.pressure = which === 1 ? .5 : 0;
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
            var _trigger = function(originalEvent, overrideType, touchIndex, overrideTarget, relatedTarget) {
                var eventName = overrideType || originalEvent.type;
                if (!originalEvent || !Events.MAP.hasOwnProperty(eventName)) {
                    return;
                }
                var type = Events.MAP[eventName];
                var pointerId = touchIndex || 0;
                var event = _create(type, originalEvent, pointerId);
                var target = Util.getTarget(originalEvent, overrideTarget);
                if (event) {
                    if (event.pointerType === "touch") {
                        Tracker.register(event, eventName, target);
                    }
                    if (type === PointerEvents[1]) {
                        _detectEnterOrLeave(PointerEvents[0], originalEvent, target, relatedTarget, pointerId);
                    }
                    Adapter.trigger(event, target);
                    if (type === PointerEvents[5]) {
                        _detectEnterOrLeave(PointerEvents[6], originalEvent, target, relatedTarget, pointerId);
                    }
                }
            };
            module.exports = {
                create: _create,
                trigger: _trigger
            };
        }, {
            "./Util": 4,
            "./event/Events": 9,
            "./event/Tracker": 10,
            "adapter/event": "Sy7Mtw"
        } ],
        3: [ function(require, module, exports) {
            var Util = require("./Util");
            var MouseHandler = require("./handlers/Mouse");
            var TouchHandler = require("./handlers/Touch");
            var navigator = window.navigator;
            module.exports = function() {
                navigator.pointerEnabled = true;
                navigator.maxTouchPoints = 10;
                Util.on(TouchHandler.events, TouchHandler.onEvent).on(MouseHandler.events, MouseHandler.onEvent);
            };
        }, {
            "./Util": 4,
            "./handlers/Mouse": 11,
            "./handlers/Touch": 12
        } ],
        4: [ function(require, module, exports) {
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
            module.exports = {
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
                }
            };
        }, {} ],
        "adapter/event": [ function(require, module, exports) {
            module.exports = require("Sy7Mtw");
        }, {} ],
        Sy7Mtw: [ function(require, module, exports) {
            var $ = window.jQuery;
            module.exports = {
                create: function(type, originalEvent, properties, bubbles) {
                    var event = $.Event(originalEvent, properties);
                    event.type = type;
                    event.bubbles = bubbles !== false;
                    return event;
                },
                trigger: function(event, target) {
                    $.event.trigger(event, null, target, !event.bubbles);
                }
            };
        }, {} ],
        "adapter/toucharea": [ function(require, module, exports) {
            module.exports = require("C84uZi");
        }, {} ],
        C84uZi: [ function(require, module, exports) {
            var ATTRIBUTE = "touch-action";
            module.exports = {
                detect: function(target) {
                    while (target.hasAttribute && !target.hasAttribute(ATTRIBUTE)) {
                        target = target.parentNode;
                    }
                    return target.getAttribute && target.getAttribute(ATTRIBUTE) === "none" || false;
                }
            };
        }, {} ],
        9: [ function(require, module, exports) {
            var _defineEvents = function(namespace, isTouch) {
                return [ namespace + "enter", namespace + "over", namespace + (isTouch ? "start" : "down"), namespace + "move", namespace + (isTouch ? "end" : "up"), namespace + "out", namespace + "leave", namespace + "cancel" ];
            };
            var PointerEvents = _defineEvents("pointer");
            var MouseEvents = _defineEvents("mouse");
            var TouchEvents = _defineEvents("touch", true);
            var MAP = {};
            module.exports = {
                POINTER: PointerEvents,
                MOUSE: MouseEvents,
                TOUCH: TouchEvents,
                MAP: MAP
            };
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
        }, {} ],
        10: [ function(require, module, exports) {
            var Util = require("../Util");
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
            var DELTA_TIME = 3e3;
            module.exports = {
                hasTouched: false,
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
        }, {
            "../Util": 4
        } ],
        11: [ function(require, module, exports) {
            var Events = require("../event/Events").MOUSE;
            var Tracker = require("../event/Tracker");
            var trigger = require("../Controller").trigger;
            var EVENT_OVER = Events[1];
            var EVENT_DOWN = Events[2];
            var EVENT_MOVE = Events[3];
            var EVENT_UP = Events[4];
            var EVENT_OUT = Events[5];
            module.exports = {
                events: [ EVENT_OVER, EVENT_DOWN, EVENT_MOVE, EVENT_UP, EVENT_OUT ],
                onEvent: function(event) {
                    if (Tracker.hasTouched && Tracker.isSimulated(event)) {
                        try {
                            event._isSimulated = true;
                        } catch (e) {}
                        return;
                    }
                    trigger(event);
                }
            };
        }, {
            "../Controller": 2,
            "../event/Events": 9,
            "../event/Tracker": 10
        } ],
        12: [ function(require, module, exports) {
            var Util = require("../Util");
            var Events = require("../event/Events").TOUCH;
            var TouchAreaAdapter = require("adapter/toucharea");
            var trigger = require("../Controller").trigger;
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
                trigger(event, EVENT_CANCEL, pointIndex, event.target);
                trigger(event, EVENT_OUT, pointIndex, event.target);
            };
            var _onPointMove = function(point, event, pointIndex) {
                var newTarget = document.elementFromPoint(point.clientX, point.clientY);
                var currentTarget = PREVIOUS_TARGETS[point.identifier];
                PREVIOUS_TARGETS[point.identifier] = newTarget;
                if (newTarget !== currentTarget) {
                    if (currentTarget) {
                        trigger(event, EVENT_OUT, pointIndex, currentTarget, newTarget);
                    }
                    if (newTarget) {
                        trigger(event, EVENT_OVER, pointIndex, newTarget, currentTarget);
                    }
                }
                trigger(event, EVENT_MOVE, pointIndex, newTarget);
                if (newTarget && TouchAreaAdapter.detect(newTarget)) {
                    event.preventDefault();
                }
            };
            var _onPointStartEnd = function(point, event, pointIndex) {
                var target = event.target;
                var type = event.type;
                var identifier = point.identifier;
                if (type === EVENT_START) {
                    PREVIOUS_TARGETS[identifier] = target;
                    trigger(event, EVENT_OVER, pointIndex, target);
                }
                var currentTarget = PREVIOUS_TARGETS[identifier] || target;
                trigger(event, type, pointIndex, currentTarget);
                if (type === EVENT_END) {
                    PREVIOUS_TARGETS[identifier] = null;
                    trigger(event, EVENT_OUT, pointIndex, currentTarget);
                }
            };
            module.exports = {
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
        }, {
            "../Controller": 2,
            "../Util": 4,
            "../event/Events": 9,
            "adapter/toucharea": "C84uZi"
        } ]
    }, {}, [ 1 ]);
})();