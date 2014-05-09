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
                if (
                    previousTouch
                    && previousTouch.pageX === touch.pageX
                    && previousTouch.pageY === touch.pageY
                ) {
                    continue;
                }

                PREVIOUS_POSITIONS[id] = touch;
            }

            method(touch, event, i);
        }
    }

};

module.exports = TouchHandler;