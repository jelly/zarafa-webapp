Ext.namespace('Zarafa.plugins.webodf');

/**
 * @class Zarafa.plugins.webodf.WebOdfBox
 * @extends Object
 * 
 * WebOdfBox can be used to open the WebODF document in light box.
 * User can preview the ODF document without downloading the document.
 * There are three type of WebODF documents supported by this plugin ODP, ODS, ODT
 * 
 * @singleton
 */
Zarafa.plugins.webodf.WebOdfBox = Ext.extend(Object, {
	
	/**
	 * @cfg {Object} odfCanvas is Object of Odf.odfCanvas class.
	 * This object is responsible for rendering or opening 
	 * the WebODF document in light box.
	 */
	odfCanvas : null,

	/**
	 * @cfg {Array} pages The pages in which all pages(slide) should be placed.
	 * This is only useful for ODP type of document.
	 */
	pages : [],

	/**
	 * @cfg {Number} currentPage The currentPage which contain index of
	 * the current page(slide) of the ODP document.
	 */
	currentPage : 0,

	/**
	 * @cfg {Number} addMargin is uses to add custom margin in light box.
	 */
	addMargin : 10,

	/**
	 * @cfg {Array} element the element should contain 
	 * the all elements of default Ext.Template (light box).
	 * Using this config user can access any element from Ext.Template.
	 */
	elements : {},

	/**
	 * @constructor
	 */
	constructor : function()
	{
		this.initMarkup();
	},
	
	/**
	 * It should be generate the light box and hide 
	 * the light box and overlay at the first attempt.
	 */
	initMarkup : function()
	{
		this.generateLightBox();

		// It is hide overlay and webodfbox at first attempt.
		Ext.each([this.elements.overlay, this.elements.webodfbox], function(el){
			el.setVisibilityMode(Ext.Element.DISPLAY);
			el.hide();
		});
	},

	/**
	 * Initialize the Ext.Template from plain hyper text.
	 * Creates a set of css identifiers, and apply style set based on Ids.
	 */
	generateLightBox : function()
	{
		var elements = {};

		var webodfTpl = this.getTemplate();
		elements.webodfbox = webodfTpl.append(document.body, {close: '&#215;'}, true);

		var ids =
			['outerDocumentContainer', 'titlebar', 'title',
			'canvas', 'hoverNav', 'navPrev', 'navNext',
			'outerDataContainer', 'dataContainer', 'data',
			'details', 'caption', 'pageNumber', 'bottomNav',
			'navClose', 'outerContainer'];

		Ext.each(ids, function(id){
			elements[id] = Ext.get('ux-webodfbox-'+id);
		});
			
		/**
		 * Overlay is transparent layer on which light box is render.
		 * Overlay is appended on document body.
		 */
		elements.overlay = Ext.DomHelper.append(document.body, {
			id: 'ux-webodfbox-overlay'
		}, true);

		this.elements = elements;
		this.initEvents();
	},
	
	/**
	 * Registers the events for handling next, previous, close buttons.
	 */
	initEvents : function()
	{
		this.elements.overlay.on('click', this.closeODF, this);
		this.elements.navClose.on('click', this.closeODF, this);

		this.elements.navPrev.on('click', this.showPreviousPage, this);
		this.elements.navNext.on('click', this.showNextPage, this);
	},

	/**
	 * Return an Ext.template for WebOdf Document.
	 * @return {Ext.Template} return template for WebODF document.
	 */
	getTemplate : function()
	{
		var webodfTpl = new Ext.Template(
		'<div id="ux-webodfbox">',
			'<div id="ux-webodfbox-titlebar">',
				'<span id="ux-webodfbox-title"></span>',
			'</div>',
			'<div id="ux-webodfbox-outerContainer">',
				'<div id="ux-webodfbox-outerDocumentContainer">',
					'<div id="ux-webodfbox-canvas">',
					'</div>',
					'<div id="ux-webodfbox-hoverNav">',
						'<a href="#" id="ux-webodfbox-navPrev"></a>',
						'<a href="#" id="ux-webodfbox-navNext"></a>',
					'</div>',
				'</div>',
			'</div>',
			'<div id="ux-webodfbox-outerDataContainer">',
				'<div id="ux-webodfbox-dataContainer">',
					'<div id="ux-webodfbox-data">',
						'<div id="ux-webodfbox-details">',
							'<span id="ux-webodfbox-pageNumber"></span>',
						'</div>',
						'<div id="ux-webodfbox-bottomNav">',
							'<a href="#" id="ux-webodfbox-navClose"></a>',
						'</div>',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
		);
		return webodfTpl;
	},
	
	/**
	 * Enable visibility of the light box for ODF documents.
	 * @param {Object} odf the odf contains necessary information regarding 
	 * attached WebODF document.
	 */
	open : function(odf)
	{
		this.enableKeyClose();
		this.setViewSize();
		this.elements.overlay.fadeIn({
			duration : odf.overlayDuration
		});

		var viewSize = this.getViewSize();
		this.elements.webodfbox.setStyle({
			top : viewSize.domHeight + 'px'
		}).show();
		
		this.initialize(odf);
	},

	/**
	 * It is use to load the WebODF document in light box.
	 * @param {Object} odfInfo is contain the information regarding WebODF document.
	 */
	initialize : function(odfInfo)
	{
		this.loadMask = new Ext.LoadMask(Ext.getBody(), {msg:_("Please wait...")});
		this.loadMask.show();

		this.overlayDuration = odfInfo.overlayDuration;
		this.resizeDuration = odfInfo.resizeDuration;

		this.odfCanvas = new odf.OdfCanvas(this.elements.canvas.dom);
		this.odfCanvas.load(odfInfo.href);
		this.elements.title.update(odfInfo.title);

		var self = this;
		this.odfCanvas.addListener('statereadychange', function (){
			var root = self.odfCanvas.odfContainer().rootElement;
			var documentType = self.getDocumentType(self, root);
			
			if(documentType == 'presentation') {
				self.pages = self.getPages(root);
				self.showPage(1);
				self.enableKeyNav();
			} else {
				self.elements.pageNumber.hide();
				self.elements.hoverNav.hide();
				self.elements.navPrev.hide();
				self.elements.navNext.hide();
			}
			self.parseScale(documentType);
		});
	},
	
	/**
	 * Is uses to identify the WebODF document type.
	 * @param {Object} self is defined the current scope.
	 * @param {Object} root is root element of WebODF document which is in XML form
	 * @return {String} return document format either it is text or presentation 
	 * and for ODS it was return null.
	 */
	getDocumentType : function (self, root)
	{
		if (root.getElementsByTagNameNS(self.nsResolver('office'), 'text').length > 0) {
			return 'text';
		} else if (root.getElementsByTagNameNS(self.nsResolver('office'), 'presentation').length > 0) {
			return 'presentation';
		} else {
			return null;
		}
	},

	/**
	 * Is use to identify document type which is supported by WebODF document.
	 * This will match the namespace and return the prefix.
	 * Using this namespace default Css of selected document is applied.
	 * @param {String} prefix The prefix is contain the prefix of the ODF document.
	 * @return {Array} Return namespace of selected ODF document.
	 */
	nsResolver : function(prefix)
	{
		var ns = {  
			'draw' : "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
			'presentation' : "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
			'text' : "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
			'office' : "urn:oasis:names:tc:opendocument:xmlns:office:1.0"
		};
		return ns[prefix] || alert('prefix ['+prefix+'] unknown.');
	},

	/**
	 * Is use to get the total number of pages in document.
	 * This method is only useful for ODP document.
	 * @param {Object} root is root element of WebODF document which is in XML form.
	 * @return {Array} total number pages(slide).
	 */
	getPages : function(root) 
	{
		var pageNodes = root.getElementsByTagNameNS(this.nsResolver('draw'), 'page');
		var pages  = [];
		for (var i=0, len = pageNodes.length ; i < len ; i += 1) {
			var tuple = [
				pageNodes[i].getAttribute('draw:name'),
				pageNodes[i]
			];
			pages.push(tuple);
		}
		return pages;
	},

	/**
	 * It uses to set ODF document as per the canvas size.
	 * And also set the left and right offset of light box.
	 * @param {String} documentType must be define the type of WebODF document.
	 * It is either ODT, ODP, ODS.
	 */
	parseScale : function(documentType)
	{
		var viewSize = this.getViewSize();
		//return new width and height of document.
		var newSize = this.resizeCanvas(documentType);

		var leftOffset = Math.max(0, Math.round((viewSize.domWidth - newSize.newWidth)/2) - this.addMargin);
		var topOffset = Math.max(0, Math.round((viewSize.domHeight - newSize.newHeight)/2) - this.addMargin*4);
		
		if(documentType == 'presentation'){
			/**
			 * FIXME :
			 * It is lib problem so i have to call
			 * this fitToContainingElement() method tow time.
			 */
			this.odfCanvas.fitToContainingElement(newSize.newWidth, newSize.newHeight);
			this.odfCanvas.fitToContainingElement(newSize.newWidth, newSize.newHeight);

			var canvasWidth = this.elements.canvas.getWidth();
			var canvasHeight = this.elements.canvas.getHeight();
			
			//set the size of light box as per the ODP document.
			this.updateCanvas(canvasWidth, canvasHeight, newSize.overFlow, leftOffset, topOffset);
		} else {
			this.updateCanvas(newSize.newWidth, newSize.newHeight, newSize.overFlow, leftOffset, topOffset);
		} 
	},

	/**
	 * Is uses to resize the light box as per the document 
	 * format and document size.
	 * @param {String} documentType must be define the type of WebODF document.
	 * It is either ODT, ODP, ODS.
	 * @return {Object} return new Width and Height for light box 
	 * as per the WebODF document type.
	 */
	resizeCanvas : function(documentType)
	{
		var viewSize = this.getViewSize();
		var newWidth, newHeight = 0;
		var overFlow = "hidden";

		var newSize = this.checkSize();

		if(documentType == 'presentation'){
			newWidth = (viewSize.domWidth/2);
			newHeight = (viewSize.domHeight + viewSize.domWidth)/4;

		} else if(documentType == 'text'){
			newWidth = newSize.width;
			newHeight = newSize.height;
			overFlow = 'auto';

		} else {
			// spreadsheet file
			newWidth = newSize.width;
			newHeight = newSize.height;
			overFlow = 'auto';
		}

		return {
			newWidth : newWidth, 
			newHeight : newHeight,
			overFlow : overFlow
		};
	},

	/**
	 * It should checks the type of WebODF document(ODP, ODT) size if document size is 
	 * larger than window size then it will set the document as per 
	 * the window size. and if document size is smaller than default 
	 * light box then resize the light box as per the document size 
	 * @return {Object} return new Width and Height for canvas.
	 */
	checkSize : function()
	{
		var viewSize = this.getViewSize();
		var width = null, height = null;
		var lightBoxWidth = this.elements.webodfbox.getWidth(),
			lightBoxHeight = this.elements.webodfbox.getHeight();

		var canvasWidth = this.elements.canvas.getWidth(),
			canvasHeight = this.elements.canvas.getHeight();

		//for Width
		if(lightBoxWidth < viewSize.domWidth){
			if(lightBoxWidth > canvasWidth) {
				width = canvasWidth;
			} else if(canvasWidth > viewSize.domWidth) {
				width = viewSize.domWidth - 100;
			} else {
				width = canvasWidth + this.addMargin * 2;
			}
		} else if(lightBoxWidth > canvasWidth) {
			if(lightBoxWidth > viewSize.domWidth) {
				width = viewSize.domWidth - 100;
			} else {
				width = canvasWidth;
			}
		} else {
			//max-width 
				width = viewSize.domWidth - 100;
		}

		//for Height
		if(lightBoxHeight < viewSize.domHeight){
			if(lightBoxHeight > canvasHeight){
				height = canvasHeight;
			} else {
				height = (viewSize.domHeight + viewSize.domWidth)/4;
			}
		} else {
			if(lightBoxHeight > canvasHeight) {
				height = canvasHeight;
			} else {
			//max-height
				height = (viewSize.domHeight + viewSize.domWidth)/4;
			}
		}

		return {
			width : width, 
			height : height
		};
	},

	/**
	 * It must be use to update the canvas, hoverNav size and set the position of light box.
	 * @param {Number} newWidth is updated width of the webODF document.
	 * @param {Number} newHeight is updated height of the WebODF document.
	 * @param {String} overFlow is contain value 'auto' or 'hidden' for light box 
	 * to hide the big document and set the scroll bar for that.
	 * @param {Number} leftOffset is contains the left offset value for light box.
	 * @param {Number} topOffset is contains the top offset value for light box.
	 */
	updateCanvas : function(newWidth, newHeight, overFlow, leftOffset, topOffset)
	{
		this.elements.webodfbox.setStyle({
			left : leftOffset + 'px',
			top : topOffset + 'px'
		});

		this.elements.outerDocumentContainer.setStyle({
			width: newWidth + 'px',
			height: newHeight + 'px',
			overflow : overFlow
		});
		
		this.elements.hoverNav.setStyle({
			top : this.elements.titlebar.getHeight() + 'px',
			width : newWidth + (this.addMargin * 2) + 'px',
			height : newHeight + (this.addMargin * 2) + 'px'
		});

		this.elements.details.setStyle({
			height : this.elements.navClose.getHeight() + '%'
		});

		this.loadMask.hide();
	},

	/**
	 * It should be use to show the page(slide) as per the current page(slide) index of ODP document.
	 * @param {Number} index is containing the page index of ODP document
	 */
	showPage: function(index)
	{
		if (index <= 0){
			index = 1;
		} else if (index > this.pages.length){
			index = this.pages.length;
		}
		this.odfCanvas.showPage(index);
		this.currentPage = index;
		this.updateDetail();
	},

	/**
	 * It must be shows the information regarding ODP document 
	 * at the bottom of the light box.
	 */
	updateDetail :function()
	{
		if (this.pages.length > 1) {
			var pageDetail = String.format(_('Page {0} of {1}'), this.currentPage, this.pages.length);
			this.elements.pageNumber.update(pageDetail);
			this.elements.pageNumber.show();
		}
		//fadeIn effect for detail.
		this.elements.dataContainer.fadeIn({
			scope : this,
			callback : function() {
				this.updateNav();
			}
		});
	},

	/**
	 * It should control the navigation button for ODP document.
	 * at the last page(slide) of ODP document next button is hidden 
	 * and at the first page(slide) previous button is hidden.
	 */
	updateNav : function()
	{
		if(this.currentPage < this.pages.length){
			this.elements.navNext.show();
		} else {
			this.elements.navNext.hide();
		}

		if(this.currentPage === 1){
			this.elements.navPrev.hide();
		} else {
			this.elements.navPrev.show();
		}
	},

	/**
	 * Use to show the next page of ODP document.
	 */
	showNextPage : function()
	{
		this.showPage(this.currentPage + 1);
	},

	/**
	 * Use to show the previous page of ODP document.
	 */
	showPreviousPage : function()
	{
		this.showPage(this.currentPage - 1);
	},

	/**
	 * It is enable the key navigation for ODP document.
	 */
	enableKeyNav : function()
	{
		Ext.get(document).on('keydown', this.keyNavAction, this);
	},

	/**
	 * It is disable the key navigation of ODP document.
	 */
	disableKeyNav : function()
	{
		Ext.get(document).un('keydown', this.keyNavAction, this);
	},

	/**
	 * It is enable key to close the ODF document.
	 */
	enableKeyClose : function()
	{
		Ext.get(document).on('keydown', this.keyClose, this);
	},

	/**
	 * It is disable the key to close the ODF document.
	 */
	disableKeyClose : function()
	{
		Ext.get(document).un('keydown', this.keyClose, this);
	},

	/**
	 * Use to navigate the ODP document.
	 * It is only useful for ODP document.
	 * @param {Object} el is defined the event object 
	 */
	keyNavAction : function(el)
	{
		switch(el.keyCode) {
			case el.UP:
			case el.LEFT:
				el.preventDefault();
				this.showPreviousPage();
				break;
			case el.DOWN:
			case el.RIGHT:
				el.preventDefault();
				this.showNextPage();
				break;
		}
	},
	
	/**
	 * It must be close the light box when Esc key is pressed.
	 * @param {Object} el is defined the event object 
	 */
	keyClose : function(el)
	{
		switch(el.keyCode){
			case el.ESC:
				el.preventDefault();
				this.closeODF();
			break;
		}
	},

	/**
	 * It use to set the width and height of the overlay as per the window size.
	 */
	setViewSize : function()
	{
		var viewSize = this.getViewSize();
		this.elements.overlay.setStyle({
			width : viewSize.domWidth + 'px',
			height : viewSize.domHeight + 'px'
		});
	},

	/**
	 * Use to hide the light box with default value and 
	 * it must be disable the key navigation control.
	 */
	closeODF : function()
	{
		this.defaultCanvasSize();
		this.disableKeyNav();
		this.disableKeyClose();

		this.pages.clear();

		this.elements.webodfbox.hide();
		this.elements.overlay.fadeOut({
			duration: this.overlayDuration
		});
	},

	/**
	 * Use to set the light box with default values.
	 * It is also remove the unnecessary Css rules from head 
	 * which is creating issue for ODP document.
	 */
	defaultCanvasSize : function()
	{

		//WebODF is not able to control the scrollbar 
		var scrollBar = Ext.get(this.elements.outerDocumentContainer.dom);
		scrollBar.scrollTo('top', 0);
		scrollBar.scrollTo('left',0);

		this.elements.outerDocumentContainer.shift({
			width: 500,
			height: 500,
			callback : function(){
				this.elements.hoverNav.setStyle({
					width : 500 + 'px',
					height : 500 + 'px'
				});
			},
			scope : this
		});

		this.loadMask.hide();

		var head = document.getElementsByTagName('head')[0];
		var styleTag = head.getElementsByTagName('style');
		var tagLength = styleTag.length;
		while(tagLength--){
			var mediaAtt = styleTag[tagLength].getAttribute("media");
			if(mediaAtt === 'screen, print, handheld, projection'){
				styleTag[tagLength].parentNode.removeChild(styleTag[tagLength]);
			}
		}
	},
	
	/**
	 * Is Check the attached document is a WebODF document or not.
	 * @param {String} fileName contains the name of WebODF document.
	 * @return {boolean} true if attached document is a WebODF document 
	 * otherwise false.
	 */
	isODFDocument : function(fileName)
	{
		return fileName.match(/^.*\.od[tps]$/i) ? true : false;
	},

	/**
	 * It use to obtain the screen size of window.
	 * @return {Object} return the width and height of window.
	 */
	getViewSize: function()
	{
		return {
			domWidth : Ext.lib.Dom.getViewWidth(),
			domHeight : Ext.lib.Dom.getViewHeight()
		}
	}
});

Zarafa.plugins.webodf.WebOdfBox = new Zarafa.plugins.webodf.WebOdfBox();