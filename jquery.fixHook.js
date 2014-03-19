(function($) {
    'use strict';

    var events = ['pointerenter', 'pointerover', 'pointerdown', 'pointermove', 'pointerup', 'pointerout', 'pointerleave'];

    var fixHook = {
        props: ['pageX', 'pageY', 'clientX', 'clientY', 'screenX', 'screenY', 'relatedTarget']
    };

    var i = 0;
    var length = events.length;

    for (; i < length; i++) {
        $.event.fixHooks[events[i]] = fixHook;
    }

}(jQuery));