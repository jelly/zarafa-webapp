Ext.namespace('Zarafa.common.ui.messagepanel');

/**
 * @class Zarafa.common.ui.messagepanel.MessageBody
 * @extends Ext.Container
 * @xtype zarafa.messagebody
 */
Zarafa.common.ui.messagepanel.MessageBody = Ext.extend(Ext.Container, {
	/**
	 * @cfg {Ext.Template/String} plaintextTemplate The {@link Ext.Template} or String which must be used
	 * for the contents of the {@link #iframe} when the record has been opened, and it contains a plain-text
	 * body. The data passed to this template will be the 'body' field which must be loaded as body.
	 */
	plaintextTemplate : '<html><body>{body}</body></html>',

	/**
	 * The {RegExp} of emailPattern, this regular expression finds mailto links or email address
	 * inside string.
	 */
	emailPattern : /((mailto:)[\w@,;.?=&%:///+ ]+)|([\w-\._\+%]+@(?:[\w-]+\.)+[\w]*)/gi,

	/**
	 * The {RegExp} of linkPattern, this regular expression finds urls inside string.
	 * Urls like http, https, ftp or www.
	 */
	linkPattern : /((?:http|ftp)s?:\/\/|www.)([\w\.\-]+)\.(\w{2,6})([\w\/\-\_\+\.\,\?\=\&\!\:\;\%\#\|]+)*/gi,

	/**
	 * @constructor
	 * @param {Object} config configuration object.
	 */
	constructor : function(config)
	{
		config = config || {};

		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.recordcomponentupdaterplugin');

		config = Ext.applyIf(config, {
			xtype: 'zarafa.messagebody',
			autoScroll:true,
			anchor : '100%',
			layout: 'fit',
			autoEl : {
				tag: 'iframe',
				cls: 'preview-iframe',
				frameborder: 0,
				src: Ext.SSL_SECURE_URL
			},
			border : false
		});

		Zarafa.common.ui.messagepanel.MessageBody.superclass.constructor.call(this, config);

		if (Ext.isString(this.plaintextTemplate)) {
			this.plaintextTemplate = new Ext.Template(this.plaintextTemplate, {
				compiled: true
			});
		}
	},

	/**
	 * Updates the container by loading data from the record data into the {@link #template}
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to update the header panel with
	 */
	update: function(record)
	{
		var iframeWindow = this.getEl().dom.contentWindow;
		var iframeDocument = iframeWindow.document;
		var iframeDocumentElement = new Ext.Element(iframeDocument);
		var body = '';
		var html;

		// Clear the iframe.
		if (!Ext.isEmpty(iframeDocument.body)) {
			iframeDocument.body.innerHTML = '';

			// Remove and disable old keymaps that are registered on the document element.
			Zarafa.core.KeyMapMgr.deactivate(iframeDocumentElement);
		}

		if (Ext.isDefined(record)) {
			// Display a 'loading' message. If the message is in HTML we can directly render it,
			// otherwise we have to surround it with HTML tags for displaying plain-text.
			body = record.getBody(true);
			html = record.get('isHTML');

			if (!body) {
				body = '';
			} else  if (html === false) {
				body = this.plaintextTemplate.applyTemplate({ body: body });
			}
		}

		iframeDocument.open();
		iframeDocument.write(body);
		iframeDocument.close();

		// Disable drag and drop
		Ext.EventManager.on(iframeWindow, 'dragover', Zarafa.onWindowDragDrop);
		Ext.EventManager.on(iframeWindow, 'drop', Zarafa.onWindowDragDrop);

		// Add CSS document to the previewbody
		// so the text can be styled.
		this.addCSSLink(iframeDocument);

		this.ownerCt.doLayout();

		this.scanDOMForLinks(iframeDocument);
		this.handleMailToLinks(iframeDocumentElement);

		var rootContainer = this.recordComponentUpdaterPlugin.rootContainer;
		if(rootContainer) {
			// Here we are passing rootContainer i.e. previewpanel as a component and editor's document
			// as element, so that when key events are fired on the element it will pass dialog
			// rootContainer as an argument in callback function.
			Zarafa.core.KeyMapMgr.activate(rootContainer, 'global', iframeDocumentElement);
			Zarafa.core.KeyMapMgr.activate(rootContainer, 'contentpanel.record.message.showmail', iframeDocumentElement);
		}
	},

	/**
	 * Funtion recursively scans dom to get text nodes which contain email addresses or URLs so we can 
	 * replace them with an anchor tag.
	 * @param {HTMLElement} node The parent node that will be examined to find the child text nodes
	 * @private
	 */
	scanDOMForLinks : function(node)
	{
		for(var i = 0; i < node.childNodes.length; i++) {
			var cnode = node.childNodes[i];
			if(cnode.nodeType == 1) { // Tag-node
				if(cnode.nodeName != 'A') { // Igonre Anchor-node as they are already linified
					this.scanDOMForLinks(cnode);
				}
			} else if(cnode.nodeType == 3) { // Text-node
				if(cnode.nodeValue.trim().length > 0) {
					// check if this text node is HTML link or email address
					if(cnode.nodeValue.search(this.emailPattern) != -1 || cnode.nodeValue.search(this.linkPattern) != -1) {
						this.linkifyDOMNode(cnode, node);
					}
				}
			}
		}
	},

	/**
	 * Function will replace text nodes with element nodes which contains anchor tag.
	 * @param {HTMLElement} node The node that has to be examined for links or emails
	 * @parem {HTMLElement} parentNode The parent of the passed node
	 * @private
	 */
	linkifyDOMNode : function(node, parentNode)
	{
		var str = node.nodeValue;

		// Split the strings up in pieces that are normal text and pieces that contain an URL
		// We do this before checking for email addresses as an ftp-URL with username/password within will otherwise be seen as an email address
		var lookupParts = Zarafa.core.Util.splitStringByPattern(str, this.linkPattern);
		var parts = [];
		// Now loop through all the pieces split them up based on whether they contain an email address
		for(var i=0;i<lookupParts.length;i++){
			// Do not examine the piece that already contains a link
			if(lookupParts[i].search(this.linkPattern) == -1){
				// Split the pieces up based on whether they contain a link
				var tmpParts = Zarafa.core.Util.splitStringByPattern(lookupParts[i], this.emailPattern);
				parts.push.apply(parts, tmpParts);
			}else{
				parts.push(lookupParts[i]);
			}
		}

		// Create a container node to append all the textnodes and anchor nodes to
		var containerNode = Ext.DomHelper.createDom({
			tag : 'span'
		});
		for(var i=0;i<parts.length;i++){
			// Create the node for a normal link
			if(parts[i].search(this.linkPattern) != -1){
				// Create a new anchor-node for making url clickable.
				var anchorNode = Ext.DomHelper.append(containerNode, {tag: 'a', html: parts[i]});
				var link = parts[i];
				if(link.search(/(http|ftp)(s)?:\/\//gi) != 0) {
					// Link has url in the pattern of www.something.com
					link = 'http://' + link;
				}
				anchorNode.setAttribute('href', link);
				anchorNode.setAttribute('target', '_blank');
			}else if(parts[i].search(this.emailPattern) != -1){
				// Create a new anchor-node for making an e-mail address clickable.
				var anchorNode = Ext.DomHelper.append(containerNode, {tag: 'a', html: parts[i]});
				var link = parts[i];
				if(link.indexOf('mailto:') != 0){
					link = 'mailto:' + link;
				}
				anchorNode.setAttribute('href', link);
			}else{
				Ext.DomHelper.append(containerNode, Ext.util.Format.htmlEncode(parts[i]));
			}
		}

		// Replace the original text node under the parent with the new anchor nodes and split up text nodes.
		for(var i=0, count=containerNode.childNodes.length;i<count;i++){
			// We remove the childNode from the parent by using this line so every loop we can add the first as the list shrinks
			parentNode.insertBefore(containerNode.childNodes.item(0), node);
		}

		// Remove the original node
		parentNode.removeChild(node);
	},

	/**
	 * Function registers handler on mailto links in {@link Zarafa.common.ui.messagepanel.MessageBody}
	 * @param {Ext.Element} iframeDocumentElement The document element of iframe
	 * @private
	 */
	handleMailToLinks : function(iframeDocumentElement)
	{
		var mailtoElements = iframeDocumentElement.query('a[href^="mailto:"]');

		if(!Ext.isEmpty(mailtoElements)){
			for (var i=0; i<mailtoElements.length ; i++)
			{
				Ext.EventManager.on(mailtoElements[i], 'click', this.onMailtoClick);
			}
		}
	},

	/**
	 * Called when any mailto links in {@link Zarafa.common.ui.messagepanel.MessageBody} is clocked
	 * This will pass url of the mailto link to URLActionMgr and it will handle the URL.
	 * @param {Ext.EventObject} event The event object
	 * @param {HTMLElement} element The element which was focussed
	 * @private
	 */
	onMailtoClick : function(event, element)
	{
		// Prevent the browsers default handling of the event.
		// i.e. opening mailto handler for the link
		event.preventDefault();

		var href = this.href || element.href;
		Zarafa.core.URLActionMgr.execute({mailto : href});
	},

	/**
	 * Adds a <link> element into the <head> tag of the given document,
	 * this will refer to a special stylesheet which can be used to apply
	 * to styling to the previewpanel.
	 * @param {Document} doc The document to which the link should be added
	 * @private
	 */
	addCSSLink : function(doc)
	{
		var head = doc.getElementsByTagName('head')[0];
		var css = doc.createElement('link');
		css.setAttribute('rel', 'stylesheet');
		css.setAttribute('type', 'text/css');
		css.setAttribute('href', container.getBasePath() + 'client/resources/css-extern/style.previewbody.css');
		head.appendChild(css);
	},

	/**
	 * Called when this component is being rendered into a container.
	 * This will create a {@link #wrap} element around the iframe for
	 * better organize the scrolling.
	 *
	 * @param {Ext.Container} ct The container into which this component is being rendered
	 * @param {Number} position The position inside the container where this component is being rendered
	 * @private
	 */
	onRender : function(ct, position)
	{
		Zarafa.common.ui.messagepanel.MessageBody.superclass.onRender.call(this, ct, position);

		this.wrap = this.el.wrap({cls: 'preview-body'});
		this.resizeEl = this.positionEl = this.wrap;
	}
});

Ext.reg('zarafa.messagebody', Zarafa.common.ui.messagepanel.MessageBody);
