# PointerEvent Polyfill

PointerEvent polyfill following the [W3C PointerEvent API](http://www.w3.org/TR/pointerevents/) specification.

## Example

```
// DOM API Implementation
div.addEventListener('pointerenter', onPointerEnterCallback, false);
div.addEventListener('pointerover', onPointerOverCallback, false);
div.addEventListener('pointermove', onPointerMoveCallback, false);
div.addEventListener('pointerdown', onPointerDownCallback, false);
div.addEventListener('pointerup', onPointerUpCallback, false);
div.addEventListener('pointerout', onPointerOutCallback, false);
div.addEventListener('pointerleave', onPointerLeaveCallback, false);

// jQuery Implementation
$div.on('pointermove', onPointerMoveCallback);

// jQuery Namespace
$div.on('pointermove.widget', onPointerMoveCallback);
```

### Callback example
```
var div = document.getElementById('div');

var onPointerMove = function(event) {
    if (event.isPrimary === true) {
        div.style.left = event.pageX + 'px';
        div.style.top = event.pageY + 'px';
    }
};

div.addEventListener('pointermove', onPointerMove, false);
```

## Event Object API

See the [W3C PointerEvent](http://www.w3.org/TR/pointerevents/#pointerevent-interface) spec for the event object API changes.

## Supported Pointer Events

* `pointerenter`
* `pointerover`
* `pointermove`
* `pointerdown`
* `pointerup`
* `pointerout`
* `pointerleave`

## Click event?

The `click` event does not fall under the PointerEvent spec. Therefore, this library does nothing with it.

What does this mean? The `click` event will be dispatched as it normally would. If you are interested in removing the click delay some browsers implement to detect gestures, I recommend [fastclick](https://github.com/ftlabs/fastclick).

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

## Touch Action

The `touch-action` CSS property is not supported with this polyfill. I wanted this polyfill to be lightweight, and loading and parsing CSS files has too much overhead. Instead, this polyfill uses an attribute: `touch-action`.

    <div touch-action="none"></div>

If a `pointermove` event is dispatched from an element (or a child element of) that has the `touch-action` attribute with a value of `none`, the browser's default browser behavior (scrolling) will be prevented.

Currently, only the `none` value is supported in this library (I have yet to find a lightweight solution to support `pan-x`, `pan-y`, and `manipulation`).

### Recommendation

It is recommended to apply both the CSS property and the `touch-action` attribute. This will ensure touch-action will be supported both in the native PointerEvent API, and this library.

## Legacy IE

IE8 and below does not support this library without jQuery. Legacy IE does not use the `addEventListener()` event model, but instead the proprietary `attachEvent()` model which does not allow for dispatching custom events.

Instead of creating and dispatching the custom pointer events through the native DOM API, jQuery is used to create and dispatch the events. This requires all event handlers be bound through jQuery.

    $element
        .on('pointerdown', onDownHandler)
        .on('pointermove', onMoveHandler)
        .on('pointerup', onUpHandler);

There is a separate build file to use when legacy IE support is needed (`jquery.pointer.js` and `jquery.pointer.min.js`). Note that jQuery in *not* included in the build, so you must include it on your page.

## Roadmap

* `Element.prototype.setPointerCapture()` and `Element.prototype.releasePointerCapture()` support.
    * This may be tricky as IE7 and below do not expose `Element` for modification.
* The `gotpointercapture` and `lostpointercapture` events. These fire when `setPointerCapture` and `releasePointerCapture` methods are called. Their support is reliant on these methods.