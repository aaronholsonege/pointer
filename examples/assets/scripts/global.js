$(document).ready(function() {
    var $body = $('body');
    var $tracker = $('#tracker');
    var $console = $('#console');

    var EVENT_NAME_LENGTH = 13;

    var _spaceEventName = function(eventName) {
        if (eventName.length < EVENT_NAME_LENGTH) {
            var length = eventName.length;
            for (; length <= EVENT_NAME_LENGTH; length++) {
                eventName += '&nbsp;';
            }
        }

        return eventName;
    };

    $(document)
        .on('mouseover mousedown mousemove mouseup mouseout mouseenter mouseleave touchstart touchmove touchend', function(e) {
            var str = _spaceEventName(e.type);

            if (e.originalEvent._isSimulated) {
                str = '<span class="simulated">' + str + ' (simulated)</span>';
            }

            $console.prepend(str + '<br />');
        })
        .on('pointerenter pointerover pointermove pointerdown pointerup pointerout pointerleave pointercancel', function(e) {
            $console.prepend('<span class="pointer">' + _spaceEventName(e.type) + ' [' + e.pointerId + ']</span><br />');
        });

    $body
        .on('pointermove pointerdown pointerup', function(e) {
            var $pointer = $tracker.find('#point' + e.pointerId);
            if (!$pointer.length) {
                $pointer = $('<li></li>')
                        .attr('id', 'point' + e.pointerId)
                        .attr('data-id', e.pointerId)
                        .appendTo($tracker);

                $tracker
                    .children()
                    .sort(function(a, b) {
                        return a.dataset.id > b.dataset.id ? 1 : 0
                    })
                    .appendTo($tracker);
            }

            $pointer
                .html([
                    'Point ' + e.pointerId,
                    'x: ' + e.x,
                    'y: ' + e.y,
                    'target: ' + e.target.nodeName.toLowerCase()
                ].join('<br />'));

            if (e.pointerType === 'touch' && e.type === 'pointerup') {
                $pointer.remove();
            }
        });

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