# PointerEvent Polyfill

PointerEvent polyfill following the [W3C PointerEvent API specification](http://www.w3.org/TR/pointerevents/)

## Supported Browsers

* Chrome
* Firefox
* Safari
* IE6+

## Disclaimer

This is not a 1-for-1 polyfill for the PointerEvents API (yet). There are a few features missing:

* The `touch-action` CSS attribute is not supported (this polyfill uses a `touch-action` attribute instead).
* The `gotpointercapture` and `lostpointercapture` events are not supported (yet).
* `Element.prototype.setPointerCapture` and `Element.prototype.releasePointerCapture` methods are not supported (yet).

## Use

    element.addEventListener('pointerdown', onDownHandler, false);
    element.addEventListener('pointermove', onMoveHandler, false);
    element.addEventListener('pointerup', onUpHandler, false);

The event model user in pointer event handlers can be reviewed [here](http://www.w3.org/TR/pointerevents/#pointerevent-interface).

## Touch Action

The `touch-action` CSS property is not supported with this polyfill. I wanted this polyfill to be lightweight, and loading and parsing CSS files has too much overhead. Instead, this polyfill uses an attribute: `touch-action`.

    <div touch-action="none"></div>

If a `pointermove` event is dispatched from an element (or a child element of) that has the `touch-action` attribute with a value of `none`, the browser's default browser behavior (scrolling) will be prevented.

## Legacy IE

IE8 and below do not support the PointerEvent polyfill without jQuery. IE8 and below does not use the `addEventListener()` event model, but instead the proprietary `attachEvent()` model which does not allow for dispatching custom events.

Instead of creating and dispatching the custom pointer events through the native DOM API, jQuery is used to create and dispatch the pointer events. This requires all event handlers be bound through jQuery.

    $element
        .on('pointerdown', onDownHandler)
        .on('pointermove', onMoveHandler)
        .on('pointerup', onUpHandler);

There is a separate build file to use when legacy IE support is needed (`jquery.pointer.js` and `jquery.pointer.min.js`). Note that jQuery in *not* included in the build.

## Roadmap

* `Element.prototype.setPointerCapture()` and `Element.prototype.releasePointerCapture()` support.
    * This may be tricky as IE7 and below do not expose `Element` for modification.
* The `gotpointercapture` and `lostpointercapture` events. These fire when `setPointerCapture` and `releasePointerCapture` methods are called. Their support is reliant on these methods.