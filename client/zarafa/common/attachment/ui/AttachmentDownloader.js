Ext.namespace('Zarafa.common.attachment.ui');
/**
 * @class Zarafa.common.attachment.ui.AttachmentDownloader
 * @extends Ext.Component
 * @xtype zarafa.attachmentdownloader
 *
 * Independent component to encapsulate process of downloading attachments,
 * this is achieved by use of hidden iframe, in which we will set url of the
 * attachment that needs to be downloaded. The file pointed by url should
 * return attachment data with content disposition type as attachment, so
 * browser will show a dialog to open/save attachment, but if the server side
 * needs to send an error then make sure it returns it with content disposition
 * type as inline, so that iframe's onload event will be fired and proper error
 * message will be displayed to user.
 */
Zarafa.common.attachment.ui.AttachmentDownloader = Ext.extend(Ext.Component, {
	/**
	 * @constructor
	 * @param {Object} config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			xtype : 'zarafa.attachmentdownloader',
			renderTo : Ext.getBody(),
			hidden : true,
			autoEl: {
				tag: 'iframe',
				src: Ext.SSL_SECURE_URL
			}
		});

		Zarafa.common.attachment.ui.AttachmentDownloader.superclass.constructor.call(this, config);

		//Register a listener to onload event of iframe, but please take a note that
		//the 'load' event is fired only if content disposition type is configured as 'inline'.
		Ext.EventManager.on(this.getEl(), 'load', this.onIframeLoad, this);
	},

	/**
	 * Will get iframe element and set its src property to the supplied url.
	 * After successfull response, iframe will pops up and ask user to start/cancel
	 * downloading of that particular message as file.
	 * @param {String} url The url to download message as file, containing necessary parameters.
	 */
	downloadMessage : function(url)
	{
		var iframeElement = Ext.getDom(this.getEl());

		//setting iframe's location to the download url
		iframeElement.src = url;
	},

	/**
	 * Handler for the 'load' event of iframe, fired immediately after iframe is loaded.
	 * The exception response is received in json format, so we are using {@link Ext.util.JSON#decode}
	 * to decode (parse) a JSON string to an object.
	 * @private
	 */
	onIframeLoad : function()
	{
		var contentDocument;
		var responseText;

		contentDocument = this.getEl().dom.contentDocument;

		if (!Ext.isEmpty(contentDocument)) {
			responseText = contentDocument.body.textContent;
		}

		if (!Ext.isEmpty(responseText)) {
			var responseObject = Ext.util.JSON.decode(responseText);
			this.displaySaveEmailException(responseObject);
		}
	},

	/**
	 * It displays proper message to user, as per the exception received
	 * while unsuccessful download.
	 * @param {Object} responseObject Object contained the exception details.
	 * @private
	 */
	displaySaveEmailException : function(responseObject)
	{
		Ext.MessageBox.show({
			title : _('Zarafa WebApp'),
			msg : responseObject.zarafa.error.info.display_message,
			icon: Ext.MessageBox.ERROR,
			buttons : Ext.MessageBox.OK
		});
	}
});
Ext.reg('zarafa.attachmentdownloader', Zarafa.common.attachment.ui.AttachmentDownloader);
