/**
 * Attach or detach event callback from target
 *
 * @function
 * @param {String|String[]} event
 * @param {Function} callback
 * @param {HTMLElement} [target=document.body]
 * @param {Function} [target.addEventListener]
 * @param {Function} [target.removeEventListener]
 * @param {Function} [target.attachEvent]
 * @param {Function} [target.detachEvent]
 * @param {Boolean} [add=false]
 * @private
 */
var _addOrRemoveEvent = function(event, callback, target, add) {
    if (!target) {
        target = document.body;
    }

    var i = 0;
    var events = (event instanceof Array) ? event : event.split(' ');
    var length = events.length;

    var method = (add ? 'add' : 'remove') + 'EventListener';
    var methodLegacy = (add ? 'attach' : 'detach') + 'Event';

    for (; i < length; i++) {
        if (target[method]) {
            target[method](events[i], callback, false);
        } else {
            target[methodLegacy]('on' + events[i], callback);
        }
    }
};

/**
 * Utility functions
 *
 * @class Util
 * @static
 */
var Util = {

    /**
     * Add event listener to target
     *
     * @method on
     * @param {String|String[]} event
     * @param {Function} callback
     * @param {HTMLElement} [target=document.body]
     * @param {Function} [target.addEventListener]
     * @param {Function} [target.attachEvent]
     * @chainable
     */
    on: function(event, callback, target) {
        _addOrRemoveEvent(event, callback, target, true);

        return this;
    },

    /**
     * Remove event listener from target
     *
     * @method on
     * @param {String|String[]} event
     * @param {Function} callback
     * @param {HTMLElement} [target=document.body]
     * @param {Function} [target.removeEventListener]
     * @param {Function} [target.detachEvent]
     * @chainable
     */
    off: function(event, callback, target) {
        _addOrRemoveEvent(event, callback, target);

        return this;
    },

    /**
     * Search array for a value.
     *
     * Legacy IE doesn't support Array.indexOf,
     * and doing a for loop is faster anyway.
     *
     * @method indexOf
     * @param {Array} array
     * @param {mixed} item
     * @return {Number}
     */
    indexOf: function(array, item) {
        var i = 0;
        var length = array.length;

        for (; i < length; i++) {
            if (array[i] === item) {
                return i;
            }
        }

        return -1;
    },

    /**
     * Determine if `child` is a descendant of `target`
     *
     * @method contains
     * @param {Element} target
     * @param {Function} [target.contains]
     * @param {Element} child
     * @return {Boolean}
     */
    contains: function(target, child) {
        if (target === child) {
            return true;
        }

        if (target.contains) {
            return target.contains(child);
        } else {
            var current = child;
            var found = false;

            while (current = current.parentNode) {
                if (current === target) {
                    found = true;
                    break;
                }
            }

            return found;
        }
    }

};

module.exports = Util;