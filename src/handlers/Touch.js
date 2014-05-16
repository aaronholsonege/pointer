var Util = require('../Util');
var Events = require('../event/Events').TOUCH;
var TouchAreaAdapter = require('adapter/toucharea');
var Tracker = require('../event/Tracker');

var trigger = require('../Controller').trigger;

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
 * trigger cancel for each touch point
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
    trigger(event, event.target, EVENT_CANCEL, pointIndex);
    trigger(event, event.target, EVENT_OUT, pointIndex);
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

/**
 * @class Handler.Touch
 * @static
 */
module.exports = {

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

        // Loop through each changed touch
        // point and fire an event for it
        while (touch = event.changedTouches[++i]) {
            id = touch.identifier;

            // The `touchmove` event triggers when ANY active point moves,
            // so we want to filter out the points that didn't move.
            if (type === EVENT_MOVE) {
                position = touch.pageX + '|' + touch.pageY;

                if (PREVIOUS_POSITIONS[id] === position) {
                    continue;
                }

                PREVIOUS_POSITIONS[id] = position;
            }

            method(touch, event, i);
        }
    }

};