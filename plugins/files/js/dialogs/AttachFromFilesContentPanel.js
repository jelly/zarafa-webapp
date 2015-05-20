Ext.namespace('Zarafa.plugins.files.dialogs');

/**
 * @class Zarafa.plugins.files.dialogs.AttachFromFilesContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype Zarafa.plugins.files.attachfromfilescontentpanel
 *
 * The content panel which shows the hierarchy tree of Files account files.
 */
Zarafa.plugins.files.dialogs.AttachFromFilesContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * @cfg {Zarafa.core.data.IPMRecord} record The record to which
	 * we need to add attachment.
	 */
	record : null,

	/**
	 * @constructor
	 * @param {Object} config Configuration structure
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
				xtype : 'Zarafa.plugins.files.attachfromfilestreepanel',
				emailrecord : config.emailrecord,
				ref : 'treePanel'
			}]
		});

		Zarafa.plugins.files.dialogs.AttachFromFilesContentPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('Zarafa.plugins.files.attachfromfilescontentpanel', Zarafa.plugins.files.dialogs.AttachFromFilesContentPanel);
