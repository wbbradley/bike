OUTPUT_FILES = \
	comps.js \
	models.js \
	main.css


all: $(OUTPUT_FILES)

%.js: %.jsx
	@echo Compiling $<...
	@jsx $< > $@ || say 'j s x'
	@echo No errors in $<.


%.js: %.coffee
	@echo Compiling $<...
	@coffee -bcp $< > $@ || say 'coffee'
	@echo No errors in $<.

%.css: %.less
	@mkdir -p css
	@echo Compiling $<...
	@lessc $< > $@ || say 'less'
	@echo No errors in $<.


clean:
	@rm $(OUTPUT_FILES)
