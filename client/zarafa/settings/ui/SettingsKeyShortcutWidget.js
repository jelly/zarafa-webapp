Ext.namespace('Zarafa.settings.ui');

/**
 * @class Zarafa.settings.ui.SettingsKeyShortcutWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype zarafa.settingskeyshortcutwidget
 *
 * The WebApp Keyboard Shortcut widget
 */
Zarafa.settings.ui.SettingsKeyShortcutWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			title : _('Keyboard Shortcuts'),
			layout : 'form',
			items : [{
				xtype : 'zarafa.compositefield',
				hideLabel : true,
				items : [{
					xtype : 'checkbox',
					ref : '../keyShortcutsCheck',
					boxLabel : _('Enable Keyboard Shortcuts'),
					name : 'zarafa/v1/main/keycontrols_enabled',
					listeners : {
						change : this.enableKeyboardShortcuts,
						check : this.displayWarning,
						scope : this
					},
					flex : 1
				},{
					xtype : 'displayfield',
					hideLabel : true,
					height : 20,
					ref : '../keyShortcutWarning',
					flex : 2
				}]
			}]
		});

		Zarafa.settings.ui.SettingsKeyShortcutWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Function initializes 'savesettings' event on {link #settingsContext} for the
	 * {@link Zarafa.settings.ui.SettingsKeyShortcutWidget}.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.settings.ui.SettingsKeyShortcutWidget.superclass.initEvents.call(this);

		// listen to savesettings to enable/disable Keyboard controls.
		var contextModel = this.settingsContext.getModel();

		this.mon(contextModel, 'savesettings', this.onSaveSettings, this);
	},

	/**
	 * Event handler will be called when
	 * {@link Zarafa.settings.SettingsContextModel#savesettings} event is fired.
	 * Function will enable/disable all keymaps registered with {@link Zarafa.core.KeyMapMgr}
	 * based on setting zarafa/v1/main/keycontrols_enabled.
	 * 
	 * @param {Zarafa.settings.SettingsContextModel} settingsContextModel The
	 * context model of settings context.
	 * @param {Zarafa.settings.SettingsModel} settingsEditModel The settingsModel which is being saved.
	 * 
	 * @private
	 */
	onSaveSettings : function(settingsContextModel, settingsEditModel)
	{
		var changed = false;
		var modifiedSettings = settingsEditModel.modified;

		if(!Ext.isEmpty(modifiedSettings)) {
			// Check whether keyboard settings are changed or not.
			for(var i = 0; i < modifiedSettings.length; i++) {
				if(modifiedSettings[i].path === 'zarafa/v1/main/keycontrols_enabled') {
					changed = true;
					break;
				}
			}
		}

		// keyboard control setting is toggled.
		if(changed === true) {
			if(settingsEditModel.get('zarafa/v1/main/keycontrols_enabled')) {
				Zarafa.core.KeyMapMgr.enableAllKeymaps();
			} else {
				Zarafa.core.KeyMapMgr.disableAllKeymaps();
			}
		}
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
	 * This is used to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel)
	{
		this.model = settingsModel;
		this.keyShortcutsCheck.setValue(settingsModel.get(this.keyShortcutsCheck.name));
		this.keyShortcutWarning.reset();
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
		settingsModel.set(this.keyShortcutsCheck.name, this.keyShortcutsCheck.getValue());
	},

	/**
	 * event handler which is fired when the value of "Enable Keyboard Shortcuts" checkbox has been changed.
	 * @param {Ext.form.CheckBox} field The field which fired the event
	 * @param {Mixed} check The new value for the field
	 * @private
	 */
	enableKeyboardShortcuts : function(field, check)
	{
		if (this.model) {
			if (this.model.get(field.name) !== check) {
				this.model.set(field.name, check);
			}
		}
	},

	/**
	 * Event handler which is fired when the value of checkbox has been changed.
	 * This will inform the user that this setting requires a reload of the
	 * webapp to become active.
	 * @param {Ext.form.CheckBox} checkbox Checkbox element from which the event originated
	 * @param {Boolean} check State of the checkbox
	 * @private
	 */
	displayWarning : function(checkbox, check)
	{
		if (this.model.get(checkbox.name) !== check) {
			this.keyShortcutWarning.setValue(_('This change requires a reload of the WebApp'));
		} else {
			this.keyShortcutWarning.reset();
		}
		this.model.requiresReload = true;
	}
});

Ext.reg('zarafa.settingskeyshortcutwidget', Zarafa.settings.ui.SettingsKeyShortcutWidget);
