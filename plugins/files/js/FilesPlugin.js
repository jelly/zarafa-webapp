Ext.namespace('Zarafa.plugins.files');

/**
 * @class Zarafa.plugins.files.FilesPlugin
 * @extends Zarafa.core.Plugin
 * This cplugin is used to load the settings widget!
 */
Zarafa.plugins.files.FilesPlugin = Ext.extend(Zarafa.core.Plugin, {
	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		
		Zarafa.plugins.files.FilesPlugin.superclass.constructor.call(this, config);
	},

	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function() {
		Zarafa.plugins.files.FilesPlugin.superclass.initPlugin.apply(this, arguments);
		
		// Initialise Version Manager
		Zarafa.plugins.files.data.Version.init();
		
		// Initialise dynamic server values
		Zarafa.plugins.files.data.Dynamics.init();
		
		// settingswidget
		// Register the Mail category for the settings
		this.registerInsertionPoint('context.settings.categories', this.createSettingCategories, this);
		// use zarafa user as default user
		if(container.getSettingsModel().get('zarafa/v1/contexts/files/username') == "defaultusername")
			container.getSettingsModel().set('zarafa/v1/contexts/files/username', container.getUser().getUserName());
			
		// some init for the context
		var files_icon = Zarafa.core.mapi.IconIndex.addProperty("files");
		container.getSettingsModel().set('zarafa/v1/contexts/files/iconid', files_icon);

		this.updateSesion();
	},
	
	/**
	 * Create the files {@link Zarafa.settings.ui.SettingsCategory Settings Category}
	 * to the {@link Zarafa.settings.SettingsContext}. This will create new
	 * {@link Zarafa.settings.ui.SettingsCategoryTab tabs} for the
	 * {@link Zarafa.plugins.files.settings.SettingsFilesCategory Files} and the 
	 * in the {@link Zarafa.settings.ui.SettingsCategoryWidgetPanel Widget Panel}.
	 * @return {Array} configuration object for the categories to register
	 * @private
	 */
	createSettingCategories: function() {
		return {
			xtype : 'Zarafa.plugins.files.settingsfilescategory'
		}
	},
	
	/**
	 * Update the php session variables
	 * Load them from settings
	 * @private
	 */
	updateSesion: function() {
		// also update the session to make sure we use the actual data
		container.getRequest().singleRequest(
			'filesmodule',
			'updatesession',
			{},
			null
		);
	}
});

/**
 * registers plugin
 */
Zarafa.onReady(function() {
	if(Ext.isDefined(container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'))) { // check if user store is initialised
		container.registerPlugin(new Zarafa.core.PluginMetaData({
			name : 'files',
			displayName : String.format(dgettext('plugin_files', '{0} Plugin'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			about : Zarafa.plugins.files.ABOUT,
			allowUserDisable : true,
			pluginConstructor : Zarafa.plugins.files.FilesPlugin
		}));
	}
});
