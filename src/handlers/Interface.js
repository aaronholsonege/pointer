/**
 * @class Pointer.Handler.Interface
 * @interface
 * @static
 */
var HandlerInterface = {

    /**
     * Array of events to listen for
     *
     * @property events
     */
    events: [],

    /**
     * Callback for all event listening to from the `events` property
     *
     * @method onEvent
     * @param {Event} event
     * @callback
     */
    onEvent: function(event) {}

};

module.exports = HandlerInterface;