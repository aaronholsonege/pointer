/**
 * Default properties to apply to newly created events
 *
 * These values are only used in values do not exists in the
 * `properties` or `originalEvent` object called with `create` method
 *
 * @type Object
 * @static
 */
var PROPS = {
    view: null,
    detail: null,
    pageX: 0,
    pageY: 0,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: null
};

/**
 * Method names to override in event
 *
 * @type String[]
 * @static
 */
var OVERRIDE_METHODS = ['preventDefault', 'stopPropagation', 'stopImmediatePropagation'];

/**
 * Override original method in `event` to also call same method in `originalEvent`
 *
 * @param {Event} event
 * @param {MouseEvent|TouchEvent} originalEvent
 * @param {String} method
 * @private
 */
var _overrideMethod = function(event, originalEvent, method) {
    var originalMethod = event[method];
    event[method] = function() {
        originalEvent[method]();
        originalMethod.call(this);
    };
};

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
     * @return {Event}
     */
    create: function(type, originalEvent, properties) {
        var event = document.createEvent('Event');
        event.initEvent(
            type,
            !properties.noBubble, // can bubble
            true // cancelable
        );

        var prop;

        // Add event properties
        for (prop in PROPS) {
            if (PROPS.hasOwnProperty(prop)) {
                event[prop] = properties[prop] || originalEvent[prop] || PROPS[prop];
            }
        }

        // add x/y properties aliased to clientX/Y
        event.x = event.clientX;
        event.y = event.clientY;

        var i = 0;
        var length = OVERRIDE_METHODS.length;

        // Override event methods to also call `originalEvent` methods
        for (; i < length; i++) {
            _overrideMethod(event, originalEvent, OVERRIDE_METHODS[i]);
        }

        return event;
    },

    /**
     * @method trigger
     * @param {Event} event
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {
        target.dispatchEvent(event);
    }

};

module.exports = Native;