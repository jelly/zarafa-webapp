Ext.namespace('Zarafa.plugins.dropboxattachment');

/**
 * @class Zarafa.plugins.dropboxattachment.DropboxAttachmentPlugin
 * @extends Zarafa.core.Plugin
 * This class is used for adding files from the users's Dropbox folder
 * to his emails as attachments
 */
Zarafa.plugins.dropboxattachment.DropboxAttachmentPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.dropboxattachment.DropboxAttachmentPlugin.superclass.initPlugin.apply(this, arguments);

		this.registerInsertionPoint('main.attachment.method', this.onAttachmentInsertion)
		Zarafa.core.data.SharedComponentType.addProperty('common.dialog.attachments.dropbox');
	},

	/**
	 * Insert dropbox option in all attachment suggestions
	 */
	onAttachmentInsertion : function(include, btn) {
		return {
			text : _('Dropbox'),
			handler : this.showDropboxAttachmentDialog.createDelegate(this, [btn]),
			scope: this,
			iconCls: 'icon_dropbox'
		};
	},

	/**
	 * Initializes Dialog for adding attachment from Dropbox to email
	 * @param {Object} btn
	 * @private
	 */
	showDropboxAttachmentDialog : function(btn)
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.dialog.attachments.dropbox'], btn.record, {
			title : _('Add attachment from Dropbox'),
			manager : Ext.WindowMgr
		});
	},
	
	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * This will bid on calendar.dialogs.importevents
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, record)
	{
		var bid = -1;
		
		switch(type)
		{
			case Zarafa.core.data.SharedComponentType['common.dialog.attachments.dropbox']:
				if (record instanceof Zarafa.core.data.IPMRecord) {
					if (record.supportsAttachments()) {
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
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent : function(type, record)
	{
		var component;

		switch(type)
		{
			case Zarafa.core.data.SharedComponentType['common.dialog.attachments.dropbox']:
				component = Zarafa.plugins.dropboxattachment.dialogs.AttachmentContentPanel;
				break;
		}

		return component;
	}	
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'dropbox',
		displayName : _('Dropbox Attachment Plugin'),
		about : Zarafa.plugins.dropboxattachment.ABOUT,
		pluginConstructor : Zarafa.plugins.dropboxattachment.DropboxAttachmentPlugin
	}));
});
