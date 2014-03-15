/**
 * @class Pointer.Adapter.AdapterInterface
 * @interface
 * @static
 */
var AdapterInterface = {

    /**
     * Create a pointer event
     *
     * @method create
     * @param {String} type
     * @param {MouseEvent|TouchEvent} originalEvent
     * @param {Object} properties
     * @return {*} Created pointer event
     */
    create: function(type, originalEvent, properties) {},

    /**
     * Dispatch pointer event to target
     *
     * @method trigger
     * @param {*} event Pointer event
     * @param {HTMLElement} target
     */
    trigger: function(event, target) {}

};

module.exports = AdapterInterface;