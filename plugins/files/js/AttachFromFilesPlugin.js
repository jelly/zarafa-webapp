Ext.namespace('Zarafa.plugins.files');

/**
 * @class Zarafa.plugins.files.FilesAttachmentPlugin
 * @extends Zarafa.core.Plugin
 * This class is used for adding files from the users's Files folder
 * to his emails as attachments
 */
Zarafa.plugins.files.AttachFromFilesPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		Zarafa.plugins.files.AttachFromFilesPlugin.superclass.constructor.call(this, config);
	},

	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function() {
		Zarafa.plugins.files.AttachFromFilesPlugin.superclass.initPlugin.apply(this, arguments);
		
		// load attachments from files
		this.registerInsertionPoint('main.attachment.method', this.onAttachmentInsertion)
		Zarafa.core.data.SharedComponentType.addProperty('common.dialog.attachments.files');
	},

	/**
	 * Insert files option in all attachment suggestions
	 * @return {Array}
	 */
	onAttachmentInsertion : function(include, btn) {
		return {
			text : container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'),
			handler : this.showFilesAttachmentDialog.createDelegate(this, [btn]),
			scope: this,
			iconCls: 'icon_files_category'
		};
	},

	/**
	 * Initializes Dialog for adding attachment from Files to efiles
	 * @param {Object} btn
	 * @private
	 */
	showFilesAttachmentDialog : function(btn) {
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.dialog.attachments.files'], btn.record, {
			title : String.format(dgettext('plugin_files', 'Add attachment from {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
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
	bidSharedComponent : function(type, record) {
		var bid = -1;
		
		switch(type) {
			case Zarafa.core.data.SharedComponentType['common.dialog.attachments.files']:
				if (record instanceof Zarafa.core.data.IPMRecord) {
					if (record.supportsAttachments())
						bid = 1;
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
	getSharedComponent : function(type, record) {
		var component;

		switch(type) {
			case Zarafa.core.data.SharedComponentType['common.dialog.attachments.files']:
				component = Zarafa.plugins.files.dialogs.AttachFromFilesContentPanel;
				break;
		}

		return component;
	}
});

Zarafa.onReady(function() {
	if(Ext.isDefined(container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'))) { // check if user store is initialised
		if(container.getSettingsModel().get('zarafa/v1/plugins/files/enable') === true) { // make sure that the master plugin is enabled
			container.registerPlugin(new Zarafa.core.PluginMetaData({
				name : 'attachfromfiles',
				allowUserVisible : false,
				displayName : String.format(dgettext('plugin_files', 'Attach a file from {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
				pluginConstructor : Zarafa.plugins.files.AttachFromFilesPlugin
			}));
		}
	}
});
