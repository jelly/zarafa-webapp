Ext.namespace('Zarafa.plugins.pdfbox');

/**
 * @class Zarafa.plugins.pdfbox.PdfBoxPlugin
 * @extends Zarafa.core.Plugin
 */
Zarafa.plugins.pdfbox.PdfBoxPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Fired when the user doubleclicked on a box
	 * @param {Zarafa.common.ui.BoxField} boxField Parent of the box
	 * @param {Zarafa.common.ui.Box} box The box that has been doubleclicked
	 * @param {Ext.data.Record} record The record that belongs to the box
	 */
	doOpen: function(record)
	{
		var filename = record.get('name');
		var pdfBoxCfg = {
			easing: 'elasticOut', 
			resizeDuration: 0.6, 
			close: '&#215;',
			hideInfo: 'auto',
			href: record.getInlineImageUrl(),
			title: filename
		};
		Ext.ux.PdfBox.open(pdfBoxCfg);
	},
	
	/**
	 * Bid for the type of shared component and the given record.
	 * This will bid on a common.create or common.view for a
	 * record with a message class set to IPM or IPM.Note.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent: function(type, record)
	{
		var bid = -1;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['common.view']:
			{
				if (record instanceof Zarafa.core.data.IPMAttachmentRecord) {
					var filename = record.get('name');
					if(Ext.ux.PdfBox.isDocument(filename))
					{
						bid=1;
					}
				}
				break;
			}
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
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

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'pdfbox',
		displayName : _('PDF Box Plugin'),
		about : Zarafa.plugins.pdfbox.ABOUT,
		pluginConstructor : Zarafa.plugins.pdfbox.PdfBoxPlugin
	}));
});
