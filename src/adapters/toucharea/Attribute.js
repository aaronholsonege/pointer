define(function(require) {
    'use strict';

    /**
     * Attribute name
     *
     * @type String
     * @static
     * @final
     */
    var ATTRIBUTE = 'touch-action';

    /**
     * @class Adapter.TouchArea.Attribute
     * @static
     */
    return {

        /**
         * Determine if `target` or a parent node of `target` has
         * a `touch-action` attribute with a value of `none`.
         *
         * @method hasTouchAction
         * @param {Element} target
         * @param {Function} target.getAttribute
         * @returns {Boolean}
         */
        detect: function(target) {
            while (target.hasAttribute && !target.hasAttribute(ATTRIBUTE)) {
                target = target.parentNode;
            }

            return target.getAttribute && target.getAttribute(ATTRIBUTE) === 'none' || false;
        }

    };

});