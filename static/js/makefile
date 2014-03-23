OUTPUT_FILES = \
	comps.js \
	models.js


all: $(OUTPUT_FILES)

%.js: %.jsx
	@echo Compiling $<...
	@jsx $< > $@
	@echo No errors in $<.


%.js: %.coffee
	@echo Compiling $<...
	@coffee -bcp $< > $@
	@echo No errors in $<.


clean:
	@rm $(OUTPUT_FILES)
