JS_COMPILER ?= ./node_modules/uglify-js/bin/uglifyjs
FILES = \
	src/streamlet.js \
	src/observable.js \
	src/controller.js \
	src/extra.js \
	src/util.js \

all: \
	streamlet.js \
	streamlet.min.js

streamlet.js: ${FILES}
	@rm -f $@
	@echo "(function(root){" > $@.tmp
	@echo "'use strict'" >> $@.tmp
	@cat $(filter %.js,$^) >> $@.tmp
	@echo "}(Function('return this')()))" >> $@.tmp
	@$(JS_COMPILER) $@.tmp -b indent-level=2 -o $@
	@rm $@.tmp
	@chmod a-w $@

streamlet.min.js: streamlet.js
	@rm -f $@
	@$(JS_COMPILER) $< -c -m -o $@ \
		--source-map $@.map \
		&& du -h $< $@

deps:
	mkdir -p node_modules
	npm install

clean:
	rm -f streamlet*.js*
