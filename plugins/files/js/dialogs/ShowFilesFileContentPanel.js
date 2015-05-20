Ext.namespace('Zarafa.plugins.files.dialogs');

/**
 * @class Zarafa.plugins.files.dialogs.ShowFilesFileContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype zarafa.showfilesfilepanel
 */
Zarafa.plugins.files.dialogs.ShowFilesFileContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
 	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};

		// Add in some standard configuration data.
		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'zarafa.showfilesfilepanel',
			// Override from Ext.Panel
			layout : 'fit',
			title : dgettext('plugin_files', 'File information'),
			items: [ this.createPanel(config) ]
		});
		
		// Call parent constructor
		Zarafa.plugins.files.dialogs.ShowFilesFileContentPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Add the main Window Panel to the content panel. This will contain
	 * a {@link Zarafa.core.ui.ContentPanelToolbar} and a {@link Zarafa.plugins.files.ui.FilesFileInfo}.
	 * @return {Object} The configuration object for the panel.
	 * @private
	 */
	createPanel : function(config) {	
		// Create a new panel and add it.
		return {
			xtype: 'zarafa.filesfileinfo',
			record : config.record
		};
	}
});

Ext.reg('zarafa.showmailcontentpanel', Zarafa.plugins.files.dialogs.ShowFilesFileContentPanel);
