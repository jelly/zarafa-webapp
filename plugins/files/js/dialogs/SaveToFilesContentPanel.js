Ext.namespace('Zarafa.plugins.files.dialogs');

/**
 * @class Zarafa.plugins.files.dialogs.SaveToFilesContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype Zarafa.plugins.files.savetofilescontentpanel
 *
 * The content panel which shows the hierarchy tree of Files account files.
 */
Zarafa.plugins.files.dialogs.SaveToFilesContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};

		Ext.applyIf(config, {
			layout : 'fit',
			title : String.format(dgettext('plugin_files', '{0} Attachment'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			closeOnSave : true,
			width : 400,
			height : 300,
			//Add panel
			items : [{
				xtype : 'Zarafa.plugins.files.savetofilestreepanel',
				ref : 'treePanel',
				response : config.record
			}]
		});

		Zarafa.plugins.files.dialogs.SaveToFilesContentPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('Zarafa.plugins.files.savetofilescontentpanel' , Zarafa.plugins.files.dialogs.SaveToFilesContentPanel);
