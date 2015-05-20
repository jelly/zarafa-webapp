Ext.namespace('Zarafa.plugins.files.settings');

/**
 * @class Zarafa.files.settings.SettingsFilesVersionWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype Zarafa.plugins.files.settingsfileswidget
 *
 * The {@link Zarafa.settings.ui.SettingsWidget widget} for configuring
 * the general files options in the {@link Zarafa.files.settings.SettingsFilesCategory files category}.
 */
Zarafa.plugins.files.settings.SettingsFilesVersionWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};
		
		Ext.applyIf(config, {
			title : dgettext('plugin_files', 'Version information'),
			layout : 'form',
			items :[{
				xtype : 'displayfield',
				fieldLabel : dgettext('plugin_files', 'Files Backend'),
				value : Zarafa.plugins.files.data.Version.getFilesVersion(),
				htmlEncode : true
			},
			{
				xtype : 'displayfield',
				fieldLabel : dgettext('plugin_files', 'Plugin'),
				value : Zarafa.plugins.files.data.Version.getPluginVersion(),
				htmlEncode : true
			},
			{
				xtype : 'displayfield',
				fieldLabel : dgettext('plugin_files', 'Maximum upload size'),
				value : Ext.util.Format.fileSize(Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize()),
				htmlEncode : true
			}]
		});

		Zarafa.plugins.files.settings.SettingsFilesVersionWidget.superclass.constructor.call(this, config);
	}
});

Ext.reg('Zarafa.plugins.files.settingsfilesversionwidget', Zarafa.plugins.files.settings.SettingsFilesVersionWidget);
