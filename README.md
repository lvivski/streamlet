# Streamlet
Simple data and event observables.

## API

#### `new Streamlet(controller)`
Create a new observable. The passed in function will receive functions `next`, `fail` and `done` as its arguments which can be called to seal the fate of the created observable.

#### `.listen(onNext, onFail, onDone)`
Subscribes to an observable and returns an function, that will unsubscribe you, once called.

#### `.catch(handler)`
Shortcut for calling `.listen(null, handler)`

#### `.end(handler)`
Shortcut for calling `.listen(null, null, handler)`

#### `.pipe(stream)`
Sends values from original observable to the `stream` one. returns `stream`

#### `.transform(transformer)`

#### `.map(convert)`
Applies the given `convert` function to each value from the original observable and returns an observable with changed values.

#### `.filter(test)`
Filters values from the original observable using the given `test` function.

#### `.skip(count)`
Skips the first `count` values from the original observable.

#### `.skipWhile(test)`
Skips values from the original observable until the given `test` function applied to a value returns false

#### `.skipDuplicates(compare)`
Skips duplicate values using === for comparison. Accepts an optional `compare` function which is then used instead of ===.

#### `.take(count)`
Takes at most `count` elements from original observable, then ends.

#### `.takeWhile(test)`
Takes values from the original observable until the given `test` function applied to a value returns false. 

#### `.expand(expander)`
Expands single values from original observable to multiple values in the current one.

#### `.scan(combine, seed)`
Scans the original observable with optional given `seed` value and `combine` function

#### `.merge(stream)`
Shortcut to `Streamlet.merge(this, stream)`

#### `Streamlet.fromEvent(element, eventName)`
Creates an observable from events on a DOM EventTarget

#### `Streamlet.merge(streams)`
Merges several `streams` observables into a single stream i.e., simply repeats values from each source observable.

#### `Streamlet.control()`
Create an observable and return a Controller to control it.

