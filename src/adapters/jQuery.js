var $ = window.jQuery;

/**
 * @class Pointer.Adapter.jQueryAdapter
 * @static
 */
var jQueryAdapter = {

    /**
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Object} properties
     * @return {$.Event}
     */
    create: function(type, originalEvent, properties) {
        var event = $.Event(originalEvent, properties);
        event.type = type;

        // add x/y properties aliased to clientX/Y
        event.x = event.clientX;
        event.y = event.clientY;

        return event;
    },

    /**
     * @method trigger
     * @param {$.Event} event
     * @param {Boolean} [event.noBubble=false]
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {
        $.event.trigger(event, null, target, !!event.noBubble);
    }

};

module.exports = jQueryAdapter;