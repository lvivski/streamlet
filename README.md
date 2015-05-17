# Streamlet
Simple data and event observables.

## API

#### `new Streamlet(controller)`
Create a new observable. The passed in function will receive functions `next`, `fail` and `done` as its arguments which can be called to seal the fate of the created observable.

#### `.listen(onNext, onFail, onDone)`
Subscribes to an observable and returns an function, that will unsubscribe you, once called.

#### `.catch(handler)`
shortcut for calling `.listen(null, handler)`

#### `.end(handler)`
shortcut for calling `.listen(null, null, handler)`

#### `.pipe(stream)`

#### `.transform(transformer)`

#### `.map(convert)`

#### `.filter(test)`

#### `.skip(count)`

#### `.skipWhile(test)`

#### `.skipDuplicates(compare)`

#### `.take(count)`

#### `.takeWhile(test)`

#### `.expand(expander)`

#### `.scan(combine, seed)`

#### `.merge(stream)`

#### `Streamlet.fromEvent(element, eventName)`

#### `Streamlet.merge(streams)`

#### `Streamlet.control()`
Create an observable and return a Controller to control it.

