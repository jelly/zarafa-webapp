Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesToolbar
 * @extends Ext.Toolbar
 * The toolbar shown in the files context
 */
Zarafa.plugins.files.ui.FilesToolbar = Ext.extend(Ext.Toolbar, {

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		
		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.recordcomponentupdaterplugin');

		Ext.applyIf(config, {
			items: [{
				xtype : 'zarafa.filesuploadbutton',
				ref : 'uploadbutton',
				plugins : [ 'zarafa.recordcomponentupdaterplugin' ],
				model : config.context.getModel(),
				overflowText : dgettext('plugin_files', 'Create something new') + '...',
				tooltip : {
					title : dgettext('plugin_files', 'New'),
					text : dgettext('plugin_files', 'Upload file / Create folder')
				},
				iconCls : 'icon_attachment'
			},
			{
				xtype: 'zarafa.toolbarbutton',
				tooltip : {
					title : dgettext('plugin_files', 'Up'),
					text : dgettext('plugin_files', 'Go to parent directory')
				},
				overflowText: dgettext('plugin_files', 'Go to parent directory'),
				iconCls: 'icon_up',
				handler: this.onMoveUp,
				model: config.context.getModel()
			},
			{
				xtype: 'tbfill'
			},
			{
				xtype: 'zarafa.toolbarbutton',
				tooltip: dgettext('plugin_files', 'Clear cache'),
				overflowText: dgettext('plugin_files', 'Clear cache'),
				iconCls: 'icon_cache',
				hidden: !container.getSettingsModel().get('zarafa/v1/contexts/files/enable_caching'),
				handler: this.onClearCache,
				model: config.context.getModel()
			},
			container.populateInsertionPoint('context.filescontext.toolbar.item', this),
			{
				xtype: 'tbseparator'
			},
			{
				xtype: 'tbtext', 
				text: 'Version: ' + Zarafa.plugins.files.data.Version.getFilesVersion()
			}]
		});
		Zarafa.plugins.files.ui.FilesToolbar.superclass.constructor.call(this, config);
	},
	
	/**
	 * Clear the webdav request cache!
	 * @private
	 */
	onClearCache : function() {
		Zarafa.plugins.files.data.Actions.clearCache();
	},
	
	/**
	 * Move one directory up
	 * @private
	 */
	onMoveUp : function() {
		var currentDir = Zarafa.plugins.files.data.ComponentBox.getStore().getPath();
		
		if(currentDir === "/")
			return;
		
		// remove trailing slash
		if(currentDir.substring(currentDir.length - 1) === '/') {
			currentDir = currentDir.substring(0, currentDir.length - 1);
		}
		
		var parentDir = currentDir.substring( 0, currentDir.lastIndexOf( "/" ) + 1);

		Zarafa.plugins.files.data.ComponentBox.getStore().loadPath(parentDir);
		Zarafa.plugins.files.data.Actions.reloadCurrentDir();
	}
});

Ext.reg('zarafa.filestoolbar',Zarafa.plugins.files.ui.FilesToolbar);
