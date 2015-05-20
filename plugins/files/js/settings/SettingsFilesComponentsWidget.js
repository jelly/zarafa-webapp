Ext.namespace('Zarafa.plugins.files.settings');

/**
 * @class Zarafa.plugins.files.settings.SettingsFilesComponentsWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype Zarafa.plugins.files.settingsfileswidget
 *
 * The {@link Zarafa.settings.ui.SettingsWidget widget} for configuring
 * the general files options in the {@link Zarafa.files.settings.SettingsFilesComponentsCategory files category}.
 */
Zarafa.plugins.files.settings.SettingsFilesComponentsWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};

		Ext.applyIf(config, {
			title : String.format(dgettext('plugin_files', 'Enable/Disable {0} components'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			layout : 'form',
			items : [{
				xtype : 'checkbox',
				name : 'zarafa/v1/plugins/attachfromfiles/enable',
				ref : 'attachFrom',
				fieldLabel : String.format(dgettext('plugin_files', 'Attach a file from {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
				lazyInit : false
			},
			{
				xtype : 'checkbox',
				name : 'zarafa/v1/plugins/savetofiles/enable',
				ref : 'attachTo',
				fieldLabel : String.format(dgettext('plugin_files', 'Save received attachments to {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
				lazyInit : false
			},
			{
				xtype : 'checkbox',
				name : 'zarafa/v1/plugins/filescontext/enable',
				ref : 'enableBrowser',
				fieldLabel : dgettext('plugin_files', 'Enable file browser'),
				lazyInit : false
			}]
		});

		Zarafa.plugins.files.settings.SettingsFilesComponentsWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
	 * This is used to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel) {
		this.model = settingsModel;
		this.attachFrom.setValue(settingsModel.get(this.attachFrom.name));
		this.attachTo.setValue(settingsModel.get(this.attachTo.name));
		this.enableBrowser.setValue(settingsModel.get(this.enableBrowser.name));
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel) {
		settingsModel.set(this.attachFrom.name, this.attachFrom.getValue());
		settingsModel.set(this.attachTo.name, this.attachTo.getValue());
		settingsModel.set(this.enableBrowser.name, this.enableBrowser.getValue());
	}
});

Ext.reg('Zarafa.plugins.files.settingsfilescomponentswidget', Zarafa.plugins.files.settings.SettingsFilesComponentsWidget);
