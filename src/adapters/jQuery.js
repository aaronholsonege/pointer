var $ = window.jQuery;

/**
 * jQuery event creating and dispatching.
 *
 * @class Pointer.Adapter.jQuery
 * @static
 */
var jQueryAdapter = {

    /**
     * Create a new jQuery Event object
     *
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Object} properties
     * @param {Boolean} [bubbles=true]
     * @return {jQuery.Event} New Pointer Event
     */
    create: function(type, originalEvent, properties, bubbles) {
        var event = $.Event(originalEvent, properties);
        event.type = type;
        event.bubbles = bubbles !== false;

        return event;
    },

    /**
     * Trigger a jQuery Event
     *
     * @method trigger
     * @param {jQuery.Event} event Pointer Event
     * @param {Boolean} [event.bubbles=false]
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {
        $.event.trigger(event, null, target, !event.bubbles);
    }

};

module.exports = jQueryAdapter;