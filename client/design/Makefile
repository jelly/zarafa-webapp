all : images document.pdf

images: dot/ui.classdef.ps

%.pdf : %.dvi
	dvipdf $(<)
	
%.dvi : %.tex chapters/introduction.tex chapters/architecture.tex chapters/communication.tex chapters/cookbook.tex chapters/style.tex
	latex $(<)
	latex $(<)
	latex $(<)
	
%.ps : %.js
	cat dot/shenanigans.js $(<) | js | dot -T ps -o $(<:.js=.ps)
	

clean:
	rm -f *.dvi *.pdf *.log *.aux dot/*.ps
