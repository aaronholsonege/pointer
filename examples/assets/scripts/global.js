$(document).ready(function() {
    'use strict';

    /**
     * @type Number
     * @final
     */
    var EVENT_NAME_LENGTH = 15;

    /**
     * @type {jQuery}
     * @static
     */
    var $document = $(document);

    /**
     * @class EventConsole
     * @static
     */
    var EventConsole = {

        /**
         * @method init
         */
        init: function() {
            this.$element = $('#console');

            this.enable();
        },

        /**
         * @method enable
         */
        enable: function() {
            $document
                .on('mouseover mousedown mousemove mouseup mouseout', '.area_playground', this.onMouseEvent)
                .on('touchstart touchmove touchend touchcancel', '.area_playground', this.onTouchEvent)
                .on('pointerenter pointerover pointerdown pointermove pointerup pointerout pointerleave pointercancel', '.area_playground', this.onPointerEvent);

            $('.spot').on('pointerenter pointerleave', this.onPointerEvent);
        },

        /**
         * @method prepend
         * @param {jQuery|HTMLElement|String} element
         */
        prepend: function(element) {
            this.$element.prepend(element + '<br />');
        },

        /**
         * @method render
         * @param {jQuery.Event} event
         * @param {String} [append]
         */
        render: function(event, append) {
            this.prepend(this.renderItem(event, append));
        },

        /**
         * @method renderItem
         * @param {jQuery.Event} event
         * @param {String} event.type
         * @param {Event} event.originalEvent
         * @param {String} [append]
         * @returns {String}
         */
        renderItem: function(event, append) {
            var cls = '';
            if (event.type.indexOf('pointer') === 0) {
                cls = 'pointer';
            } else if (event.originalEvent._isSimulated) {
                cls = 'simulated';
            }

            return '<span class="' + cls + '">' +
                this._spaceEventName(event.type) +
                (append ? append : '') +
                '</span>'
        },

        /**
         * @method _spaceEventName
         * @param {String} eventName
         * @returns {String}
         * @private
         */
        _spaceEventName: function(eventName) {
            if (eventName.length < EVENT_NAME_LENGTH) {
                var length = eventName.length;
                for (; length <= EVENT_NAME_LENGTH; length++) {
                    eventName += '&nbsp;';
                }
            }

            return eventName;
        },

        /**
         * @param {HTMLElement} element
         * @returns {String}
         * @private
         */
        _getSelector: function(element) {
            var selector = element.nodeName.toLowerCase();

            if (element.className) {
                selector = '.' + element.className.split(' ')[0];
            }

            if (element.id) {
                selector = '#' + element.id;
            }

            return selector;
        },

        /**
         * @method onMouseEvent
         * @param {jQuery.Event} event
         * @callback
         */
        onMouseEvent: function(event) {
            EventConsole.render(event);
        },

        /**
         * @method onTouchEvent
         * @param {jQuery.Event} event
         * @callback
         */
        onTouchEvent: function(event) {
            EventConsole.render(event);
        },

        /**
         * @method onPointerEvent
         * @param {jQuery.Event} event
         * @param {Number} event.pointerId
         * @callback
         */
        onPointerEvent: function(event) {
            var append = ' [' + event.pointerId + '] [' + EventConsole._getSelector(event.target) + ']';

            EventConsole.render(event, append);
        }

    };

    /**
     * @class TrackerConsole
     * @static
     */
    var TrackerConsole = {

        /**
         * @property POINTER_COUNT
         * @type Number
         * @static
         */
        POINTER_COUNT: 5,

        /**
         * @method init
         */
        init: function() {
            this.$element = $('#tracker');

            this.enable();
            this.render();
        },

        /**
         * @method enable
         */
        enable: function() {
            $document.on('pointermove pointerdown pointerup', '.area_playground', this.onPointerEvent);
        },

        /**
         * @method render
         */
        render: function() {
            var i = 0;
            var length = this.POINTER_COUNT;

            for (; i < length; i++) {
                this.$element.append(this.renderItem());
                this.updateItem(i, 0, 0, '');
            }
        },

        /**
         * @method renderItem
         * @returns {jQuery}
         */
        renderItem: function() {
            return $('<li></li>').addClass('inactive');
        },

        /**
         * @method updateItem
         * @param {Number} index
         * @param {Number} x
         * @param {Number} y
         * @param {String} target
         * @returns {jQuery}
         */
        updateItem: function(index, x, y, target) {
            var $pointer = this.$element.children().eq(index);

            $pointer
                .html([
                    'Point ' + index,
                    'x: ' + x,
                    'y: ' + y,
                    'target: ' + target
                ].join('<br />'));

            return $pointer;
        },

        /**
         * @method onPointerEvent
         * @param {jQuery.Event} event
         * @param {Number} event.pointerId
         * @param {Number} event.pageX
         * @param {Number} event.pageY
         * @param {HTMLElement} event.target
         * @param {String} event.pointerType
         * @callback
         */
        onPointerEvent: function(event) {
            var $pointer = TrackerConsole.updateItem(
                event.pointerId,
                event.pageX,
                event.pageY,
                event.target.nodeName.toLowerCase()
            );

            if (event.pointerType === 'touch') {
                $pointer.toggleClass('inactive', event.type === 'pointerup');
            } else {
                $pointer.removeClass('inactive');
            }
        }

    };

    EventConsole.init();
//    TrackerConsole.init();

    $('.spot')
        .on('pointerenter', function() {
            $(this).addClass('inside');
        })
        .on('pointerleave pointercancel', function() {
            $(this).removeClass('inside').removeClass('active');
        })
        .on('pointerdown', function(e) {
            $(this).addClass('active');
        })
        .on('pointerup', function(e) {
            $(this).removeClass('active');
        });
});