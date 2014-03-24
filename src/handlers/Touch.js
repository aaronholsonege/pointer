var Util = require('../Util');
var Controller = require('../Controller');

/**
 * Touch event names
 *
 * @type String
 * @static
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
 * List of point event targets
 *
 * @type Object
 * @static
 */
var PREVIOUS_TARGET = {};

/**
 * Touch timeout id
 *
 * @type Number
 * @private
 */
var _touchTimer;

/**
 * Reset touching flag to false
 *
 * @type Function
 * @private
 */
var _resetTouchingFlag = function() {
    TouchHandler.touching = false;
};

/**
 * Reset touch flag and set a time to set it back to false
 *
 * @type Function
 * @private
 */
var _startTimer = function() {
    clearTimeout(_touchTimer);
    TouchHandler.touching = true;
    _touchTimer = setTimeout(_resetTouchingFlag, 700);
};

/**
 * Determine which method to call for each point
 *
 * @type Function
 * @param {String} type
 * @returns {Function}
 * @private
 */
var _getMethod = function(type) {
    switch(type) {
        case EVENT_START:
        case EVENT_END:
            return _onPointStartEndEvent;
        case EVENT_MOVE:
            return _onPointMoveEvent;
        default:
            return _onPointCancelEvent;
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
 */
var _onPointCancelEvent = function(point, event, pointIndex) {
    PREVIOUS_TARGET[point.identifier] = null;
    Controller.trigger(event, event.type, event.target, pointIndex);
    _resetTouchingFlag();
};

/**
 * Trigger move for each touch point
 *
 * @type Function
 * @param {Touch} point
 * @param {Number} point.identifier
 * @param {TouchEvent} event
 * @param {Number} pointIndex
 */
var _onPointMoveEvent = function(point, event, pointIndex) {
    var newTarget = document.elementFromPoint(point.clientX, point.clientY);
    var currentTarget = PREVIOUS_TARGET[point.identifier];

    PREVIOUS_TARGET[point.identifier] = newTarget;

    if (newTarget !== currentTarget) {
        if (currentTarget) {
            Controller.trigger(event, EVENT_OUT, currentTarget, pointIndex);

            if (!Util.contains(currentTarget, newTarget)) {
                Controller.trigger(event, EVENT_LEAVE, currentTarget, pointIndex);
            }
        }

        if (newTarget) {
            if (!Util.contains(newTarget, currentTarget)) {
                Controller.trigger(event, EVENT_ENTER, newTarget, pointIndex);
            }

            Controller.trigger(event, EVENT_OVER, newTarget, pointIndex);
        }
    }

    Controller.trigger(event, EVENT_MOVE, newTarget, pointIndex);
    _startTimer();
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
 */
var _onPointStartEndEvent = function(point, event, pointIndex) {
    var target = event.target;
    var type = event.type;

    if (type === EVENT_START) {
        PREVIOUS_TARGET[point.identifier] = target;
        Controller.trigger(event, EVENT_ENTER, target, pointIndex);
        Controller.trigger(event, EVENT_OVER, target, pointIndex);
    }

    Controller.trigger(event, type, target, pointIndex);

    if (type === EVENT_END) {
        PREVIOUS_TARGET[point.identifier] = null;
        Controller.trigger(event, EVENT_OUT, target, pointIndex);
        Controller.trigger(event, EVENT_LEAVE, target, pointIndex);
    }

    _startTimer();
};

/**
 * @class Pointer.Handler.Touch
 * @type Object
 * @static
 */
var TouchHandler = {

    /**
     * Was there a touch event in the last 700ms?
     *
     * @property touching
     * @type Boolean
     */
    touching: false,

    /**
     * Events to watch
     *
     * @property events
     * @type String[]
     */
    events: [EVENT_START, EVENT_MOVE, EVENT_END, EVENT_CANCEL],

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
     * @param {String} event.type
     * @param {Element} event.target
     * @callback
     */
    onEvent: function(event) {
        var i = 0;
        var touches = event.changedTouches;
        var length = touches.length;

        var method = _getMethod(event.type);

        for (; i < length; i++) {
            method(touches[i], event, i);
        }
    }

};

module.exports = TouchHandler;