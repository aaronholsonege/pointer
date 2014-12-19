# PointerEvent Polyfill

PointerEvent polyfill following the [W3C PointerEvent API](http://www.w3.org/TR/pointerevents/) specification.

## Supported Browsers

* Chrome
* Firefox
* Safari
* IE6+

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
* `gotpointercapture`
* `lostpointercapture`

## `setPointerCapture` and `releasePointerCapture`

The `Element.setPointerCatpure` and `Element.releasePointerCapture` methods allow the events for a particular pointer to be retargeted to a particular element other than the normal hit test result of the pointer's location. This is useful in scenarios like a custom slider control. Pointer capture can be set on the slider thumb element, allowing the user to slide the control back and forth even if the pointer slides off of the thumb.

```
// Usage
var onPointerDown = function(event) {
    event.target.setPointerCapture(event.pointerId);
};

element.addEventListener('pointerdown', onPointerDown, false);
```

The pointer capture can either be released manually (`event.target.releasePointerCapture(event.pointerId)`) or automatically when `pointerend` or `pointercancel` is fired.

## Click event

The `click` event does not fall under the PointerEvent spec. Therefore, this library does nothing with it.

What does this mean? The `click` event will be dispatched as it normally would. If you are interested in removing the click delay some browsers implement to detect gestures, I recommend [fastclick](https://github.com/ftlabs/fastclick).

## Touch Action

The `touch-action` CSS property is not supported with this polyfill. I wanted this polyfill to be lightweight, and loading and parsing CSS files has too much overhead. Instead, this polyfill uses an attribute: `touch-action`.

    <div touch-action="none"></div>

If a `pointermove` event is dispatched from an element (or a child element of) that has the `touch-action` attribute with a value of `none`, the browser's default browser behavior (scrolling) will be prevented.

Currently, only the `none` value is supported in this library (I have yet to find a lightweight solution to support `pan-x` and `pan-y`).

### Recommendation

It is recommended to apply both the CSS property and the `touch-action` attribute. This will ensure touch-action will be supported both in the native PointerEvent API, and this library.

## jquery.pointerHooks

If you plan to use jQuery to handle event binding, you will need to include the jquery.pointerHooks plugin. This plugin allows jQuery to propagate all the pointer events properties into the jQuery event object.

If you are using the jQuery adapter for this polyfill, this plugin is already included. If you are using the native adapter, you will need to include this library manually.

## Legacy IE

IE8 and below do not support this library without jQuery. Legacy IE does not use the `addEventListener()` event model, but instead the proprietary `attachEvent()` model which does not allow for dispatching custom events.

Instead of creating and dispatching the custom pointer events through the native DOM API, jQuery is used to create and dispatch the events. This requires all event handlers be bound through jQuery.

    $element
        .on('pointerdown', onDownHandler)
        .on('pointermove', onMoveHandler)
        .on('pointerup', onUpHandler);

There is a separate build file to use when legacy IE support is needed (`jquery.pointer.js` and `jquery.pointer.min.js`). Note that jQuery in *not* included in the build, so you must include it on your page.

### `setPointerCapture` and `releasePointerCapture`

In IE7 and below, using the `Element.setPointerCapture` and `Element.releasePointerCapture` methods are supported, but only with the `target` element of a pointer event. IE7 and below does not support global access to `Element.prototype`, so there is no way for the polyfill to add these methods. Instead, before any pointer event is dispatched, `setPointerCapture` and `releasePointerCapture` are dynamically added to the `event.target` element.

What this means is in IE7 and below is you can not use the `setPointerCapture` and `releasePointerCapture` methods on any DOM Element, only the element assigned to the `target` property of a pointer event.

## Development Guide

### Git Submodules

The `src/jquery.pointerHooks` directory is pointing to a separate repo.

After a fresh clone this project, it is necessary to run the following commands from the project root
to pull in this repo:

```
git submodule init
git submodule update
```

### Grunt Builds

The project cannot be run directly from the source code -- it must be built before running in the browser.
To build the project, run the following commands from the project root:

```
npm install
grunt build
```

You can run the follow command to automatically build the project whenever you make changes to any files in the project:

```
grunt watch