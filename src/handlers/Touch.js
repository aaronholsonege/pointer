define(function(require) {
    'use strict';

    var Util = require('../Util');
    var Events = require('../event/Events').TOUCH;
    var TouchAreaAdapter = require('adapter/toucharea');

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
        trigger(event, EVENT_CANCEL, pointIndex, event.target);
        trigger(event, EVENT_OUT, pointIndex, event.target);
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
                trigger(event, EVENT_OUT, pointIndex, currentTarget, newTarget);
            }

            if (newTarget) {
                trigger(event, EVENT_OVER, pointIndex, newTarget, currentTarget);
            }
        }

        trigger(event, EVENT_MOVE, pointIndex, newTarget);

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

    /**
     * @class Handler.Touch
     * @static
     */
    return {

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

});