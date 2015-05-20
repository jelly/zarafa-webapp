Ext.namespace('Zarafa.plugins.files.settings');

/**
 * @class Zarafa.plugins.files.settings.SettingsFilesCategory
 * @extends Zarafa.settings.ui.SettingsCategory
 * @xtype Zarafa.plugins.files.settingsfilescategory
 *
 * The files category for users which will
 * allow the user to configure Files related settings
 */
Zarafa.plugins.files.settings.SettingsFilesCategory = Ext.extend(Zarafa.settings.ui.SettingsCategory, {
	// Insertion points for this class
	/**
	 * @insert context.settings.category.files
	 * Insertion point to register new {@link Zarafa.settings.ui.SettingsWidget widgets}
	 * for the {@link Zarafa.files.settings.SettingsFilesCategory Owncoud Category}.
	 * @param {Zarafa.files.settings.SettingsFilesCategory} category The files
	 * category to which the widgets will be added.
	 */

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};

		Ext.applyIf(config, {
			title : container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'),
			categoryIndex : 1,
			iconCls : 'icon_files_category',
			items : [{
				xtype : 'Zarafa.plugins.files.settingsfilescomponentswidget'	// enable/disable plugins
			},
			{
				xtype : 'Zarafa.plugins.files.settingsfileswidget'			// files specific settings like server address...
			},
			{
				xtype : 'Zarafa.plugins.files.settingsfilesquotawidget'		// files plugin quota
			},
			{
				xtype : 'Zarafa.plugins.files.settingsfilesversionwidget'		// files plugin version
			},
			{
				xtype : 'Zarafa.plugins.files.settingsfilesresetsettingswidget'		// files plugin reset
			},
			container.populateInsertionPoint('context.settings.category.files', this)
			]
		});

		Zarafa.plugins.files.settings.SettingsFilesCategory.superclass.constructor.call(this, config);
	}
});

Ext.reg('Zarafa.plugins.files.settingsfilescategory', Zarafa.plugins.files.settings.SettingsFilesCategory);
