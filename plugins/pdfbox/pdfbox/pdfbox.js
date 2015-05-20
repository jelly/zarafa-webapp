/*!
 * Ext Core Library $version&#xD;&#xA;http://extjs.com/&#xD;&#xA;Copyright(c) 2006-2009, $author.&#xD;&#xA;&#xD;&#xA;The MIT License&#xD;&#xA;&#xD;&#xA;Permission is hereby granted, free of charge, to any person obtaining a copy&#xD;&#xA;of this software and associated documentation files (the &quot;Software&quot;), to deal&#xD;&#xA;in the Software without restriction, including without limitation the rights&#xD;&#xA;to use, copy, modify, merge, publish, distribute, sublicense, and/or sell&#xD;&#xA;copies of the Software, and to permit persons to whom the Software is&#xD;&#xA;furnished to do so, subject to the following conditions:&#xD;&#xA;&#xD;&#xA;The above copyright notice and this permission notice shall be included in&#xD;&#xA;all copies or substantial portions of the Software.&#xD;&#xA;&#xD;&#xA;THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR&#xD;&#xA;IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,&#xD;&#xA;FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE&#xD;&#xA;AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER&#xD;&#xA;LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,&#xD;&#xA;OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN&#xD;&#xA;THE SOFTWARE.&#xD;&#xA;
 */
Ext.ns('Ext.ux');

Ext.ux.PdfBox = (function(){
	var els = {},
		pdfDoc = null,
		currentPage,
		initialized = false,
		selectors = [];

	return {
		overlayOpacity: 0.85,
		animate: true,
		resizeSpeed: 8,
		borderSize: 10,
		labelPage: "Page",
		labelOf: "of",

		init: function() {
			this.resizeDuration = this.animate ? ((11 - this.resizeSpeed) * 0.15) : 0;
			this.overlayDuration = this.animate ? 0.2 : 0;
			PDFJS.disableWorker = true;
			if(!initialized) {
				Ext.apply(this, Ext.util.Observable.prototype);
				Ext.util.Observable.constructor.call(this);
				this.addEvents('open', 'close');
				this.initMarkup();
				this.initEvents();
				initialized = true;
			}
		},

		initMarkup: function() {
			els.shim = Ext.DomHelper.append(document.body, {
				tag: 'iframe',
				id: 'ux-pdfbox-shim'
			}, true);
			els.overlay = Ext.DomHelper.append(document.body, {
				id: 'ux-pdfbox-overlay'
			}, true);

			var pdfboxTpl = new Ext.Template(this.getTemplate());
			els.pdfbox = pdfboxTpl.append(document.body, {close: '&#215;'}, true);

			var ids =
				['outerImageContainer', 'imageContainer', 'canvas', 'hoverNav', 'navPrev', 'navNext', 'loading', 'loadingLink',
				'outerDataContainer', 'dataContainer', 'data', 'details', 'caption', 'pageNumber', 'bottomNav', 'navClose'];

			Ext.each(ids, function(id){
				els[id] = Ext.get('ux-pdfbox-' + id);
			});

			Ext.each([els.overlay, els.pdfbox, els.shim], function(el){
				el.setVisibilityMode(Ext.Element.DISPLAY)
				el.hide();
			});

			var size = (this.animate ? 250 : 1) + 'px';
			els.outerImageContainer.setStyle({
				width: size,
				height: size
			});
		},

		getTemplate : function() {
			return [
				'<div id="ux-pdfbox">',
					'<div id="ux-pdfbox-outerImageContainer">',
						'<div id="ux-pdfbox-imageContainer">',
							'<canvas id="ux-pdfbox-canvas">',
							'</canvas>',
							'<div id="ux-pdfbox-hoverNav">',
								'<a href="#" id="ux-pdfbox-navPrev"></a>',
								'<a href="#" id="ux-pdfbox-navNext"></a>',
							'</div>',
							'<div id="ux-pdfbox-loading">',
								'<a id="ux-pdfbox-loadingLink"></a>',
							'</div>',
						'</div>',
					'</div>',
					'<div id="ux-pdfbox-outerDataContainer">',
						'<div id="ux-pdfbox-dataContainer">',
							'<div id="ux-pdfbox-data">',
								'<div id="ux-pdfbox-details">',
									'<span id="ux-pdfbox-caption"></span>',
									'<span id="ux-pdfbox-pageNumber"></span>',
								'</div>',
								'<div id="ux-pdfbox-bottomNav">',
									'<a href="#" id="ux-pdfbox-navClose"></a>',
								'</div>',
							'</div>',
						'</div>',
					'</div>',
				'</div>'
			];
		},

		initEvents: function() {
			var close = function(ev) {
				ev.preventDefault();
				this.close();
			};

			els.overlay.on('click', close, this);
			els.loadingLink.on('click', close, this);
			els.navClose.on('click', close, this);

			els.pdfbox.on('click', function(ev) {
				if(ev.getTarget().id == 'ux-pdfbox') {
					this.close();
				}
			}, this);

			els.navPrev.on('click', function(ev) {
				ev.preventDefault();
				currentPage--;
				this.setPage(currentPage);
			}, this);

			els.navNext.on('click', function(ev) {
				ev.preventDefault();
				currentPage++;
				this.setPage(currentPage);
			}, this);
		},

		register: function(sel) {
			if(selectors.indexOf(sel) === -1) {
				selectors.push(sel);

				Ext.fly(document).on('click', function(ev){
					var target = ev.getTarget(sel);

					if (target) {
						ev.preventDefault();
						this.open(target, sel);
					}
				}, this);
			}
		},

		open: function(pdf, sel) {
			this.setViewSize();
			this.pdfDoc = pdf;
			els.overlay.fadeIn({
				duration: this.overlayDuration,
				endOpacity: this.overlayOpacity,
				callback: function() {
                    PDFJS.getDocument(this.pdfDoc.href, this).then( function(_pdfDoc){
                        currentPage = 1;
                        pdfDoc = _pdfDoc;
                        var pageScroll = Ext.fly(document).getScroll();
                        var lightboxTop = Math.round(pageScroll.top + (Ext.lib.Dom.getViewportHeight() / 10));
                        var lightboxLeft = Math.round(pageScroll.left);
                        els.pdfbox.shift({
                            top: lightboxTop + 'px',
                            left: lightboxLeft + 'px'
                        }).show();
                        this.setPage(currentPage);
                        this.fireEvent('open', pdfDoc);
                    });
                },
				scope: this
			});
		},
		setViewSize: function(){
			var viewSize = this.getViewSize();
			els.overlay.setStyle({
				width: viewSize[0] + 'px',
				height: viewSize[1] + 'px'
			});
			els.shim.setStyle({
				width: viewSize[0] + 'px',
				height: viewSize[1] + 'px'
			}).show();
		},

		setPage: function(index){
			pdfDoc.getPage(index).then(this.renderPage);
		},
		renderPage: function(page){
			els.canvas.hide();
			this.disableKeyNav();
			if (this.animate) {
				els.loading.show();
			}

			els.hoverNav.hide();
			els.navPrev.hide();
			els.navNext.hide();
			els.dataContainer.setOpacity(0.0001);
			els.pageNumber.hide();
			var canvasContext = els.canvas.dom.getContext('2d');
			var viewport = page.getViewport(0.8);
			var viewSize = this.getViewSize();
			var aspect = Math.min((viewSize[0]-this.borderSize*2)/viewport.width, (viewSize[1]-this.borderSize*2-els.navClose.getHeight()*2)/viewport.height);
			//we don't want resizing if the pages are *smaller* than the screen
			var w = viewport.width*Math.min(aspect, 1);
			var h = viewport.height*Math.min(aspect, 1);
			var l = Math.max(0, Math.round((viewSize[0]-w)/2)-this.borderSize);
			var t = Math.max(0, Math.round((viewSize[1]-h)/2)-this.borderSize*2);
			els.canvas.dom.width = w;
			els.canvas.dom.height = h;
			els.canvas.applyStyles({'width': w + 'px', 'height': h + 'px'});
			this.resizeCanvas(w, h);
			viewport.width=w*aspect;
			viewport.height=h*aspect;
			
			var renderContext = {
			  canvasContext: canvasContext,
			  viewport: viewport
			};
			page.render(renderContext);
			els.pdfbox.shift({
			  x: l,
			  y: t
			}).show();
			//set size - take aspect from page, make canvas fit the view
			//call resizeCanvas
			//draw page on canvas 
			//center and show lightbox
		},
		resizeCanvas: function(w, h){
			var wCur = els.outerImageContainer.getWidth();
			var hCur = els.outerImageContainer.getHeight();

			var wNew = (w + this.borderSize * 2);
			var hNew = (h + this.borderSize * 2);

			var wDiff = wCur - wNew;
			var hDiff = hCur - hNew;
			
			var afterResize = function(){
				els.hoverNav.setWidth(els.imageContainer.getWidth() + 'px');

				els.navPrev.setHeight(h + 'px');
				els.navNext.setHeight(h + 'px');

				els.outerDataContainer.setWidth(wNew + 'px');

				this.showDocument();
			};

			if (hDiff != 0 || wDiff != 0) {
				els.outerImageContainer.shift({
					height: hNew,
					width: wNew,
					duration: this.resizeDuration,
					scope: this,
					callback: afterResize,
					delay: 50
				});
			}
			else {
				afterResize.call(this);
			}
		},

		showDocument: function(){
			els.loading.hide();
			els.canvas.fadeIn({
				duration: this.resizeDuration,
				scope: this,
				callback: function(){
					this.updateDetails();
				}
			});
			
		},

		updateDetails: function(){
			var detailsWidth = els.data.getWidth(true) - els.navClose.getWidth() - 10;
			els.details.setWidth((detailsWidth > 0 ? detailsWidth : 0) + 'px');

			els.caption.update(pdfDoc.title);

			els.caption.show();
			if (pdfDoc.numPages > 1) {
				els.pageNumber.update(this.labelPage + ' ' + (currentPage) + ' ' + this.labelOf + '  ' + pdfDoc.numPages);
				els.pageNumber.show();
			}

			els.dataContainer.fadeIn({
				duration: this.resizeDuration/2,
				scope: this,
				callback: function() {
					var viewSize = this.getViewSize();
					els.overlay.setHeight(viewSize[1] + 'px');
					this.updateNav();
				}
			});
		},

		updateNav: function(){
			this.enableKeyNav();

			els.hoverNav.show();

			// if not first image in set, display prev image button
			if (currentPage > 1)
				els.navPrev.show();

			// if not last image in set, display next image button
			if (currentPage < pdfDoc.numPages)
				els.navNext.show();
		},

		enableKeyNav: function() {
			Ext.fly(document).on('keydown', this.keyNavAction, this);
		},

		disableKeyNav: function() {
			Ext.fly(document).un('keydown', this.keyNavAction, this);
		},
		isDocument: function (url) {
			return url.match(/^.*\.(pdf)$/i) ? true : false;
		},
		keyNavAction: function(ev) {
			var keyCode = ev.getKey();

			if (
				keyCode == 88 || // x
				keyCode == 67 || // c
				keyCode == 27
			) {
				this.close();
			}
			else if (keyCode == 80 || keyCode == 37){ // display previous image
				if (currentPage > 1){
					currentPage--;
					this.setPage(currentPage);
				}
			}
			else if (keyCode == 78 || keyCode == 39){ // display next image
				if (currentPage < pdfDoc.numPages){
					currentPage++;
					this.setPage(currentPage);
				}
			}
		},

		close: function(){
			this.disableKeyNav();
			els.pdfbox.hide();
			els.overlay.fadeOut({
				duration: this.overlayDuration
			});
			els.shim.hide();
			this.fireEvent('close', currentPage);
		},

		getViewSize: function() {
			return [Ext.lib.Dom.getViewWidth(), Ext.lib.Dom.getViewHeight()];
		}
	}
})();

Ext.onReady(Ext.ux.PdfBox.init, Ext.ux.PdfBox);
