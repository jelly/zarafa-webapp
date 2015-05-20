Ext.namespace('Zarafa.plugins.webodf');

/**
 * @class Zarafa.plugins.webodf.WebOdfPlugin
 * @extends Zarafa.core.Plugin
 * 
 * WebOdfBoxPlugin can show OpenDocument Format office documents in a light box.
 * WebODF supports three different type of document format  like ODT(Doc), ODP(Presentation), ODS(Spreadsheet)
 * 
 * If any openoffice document is attached in mail by user then this plugin will bid for opening that
 * attachment and will show a preview of the document in the lightbox ui.
 * 
 * This plugin will actually make use of {@link Zarafa.plugins.webodf.WebOdfBox WebODFBox} bridge that is created to
 * show ODF documents in LightBox.
 */
Zarafa.plugins.webodf.WebOdfPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Fired when the user doubleclicked on an attachment box.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record The record that belongs to the attachment box.
	 */
	doOpen : function(record)
	{
		var webodfCfg = {
			resizeDuration : 0.40,
			overlayDuration : 0.6,
			//get the attached item url from Zarafa.core.data.IPMAttachmentRecord
			href : record.getInlineImageUrl(),
			title : record.get('name')
		};
		Zarafa.plugins.webodf.WebOdfBox.open(webodfCfg);
	},
	
	/**
	 * Bid for the type of shared component and the given record.
	 * This will bid on common.view for Attachment record.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, record)
	{
		var bid = -1;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['common.view']:
				if (record instanceof Zarafa.core.data.IPMAttachmentRecord) {
					var filename = record.get('name');
					if(Zarafa.plugins.webodf.WebOdfBox.isODFDocument(filename)){
						bid = 1;
					}
				}
				break;
		}
		return bid; 
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record Optionally passed record.
	 * @return {Zarafa.plugins.webodf.WebOdfPlugin} component instance of (@link Zarafa.plugins.webodf.WebOdfPlugin WebOdfPlugin)
	 */
	getSharedComponent: function(type, record)
	{
		var component;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['common.view']:
				component = this;
				break;
		}
		return component;
	}
});

Zarafa.onReady(function(){
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'webodf',
		displayName : _('WebODF Plugin'),
		about : Zarafa.plugins.webodf.ABOUT,
		pluginConstructor : Zarafa.plugins.webodf.WebOdfPlugin
	}));
});