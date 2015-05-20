Ext.namespace('Zarafa.settings.ui');

/**
 * @class Zarafa.settings.ui.SettingsAccountWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype zarafa.settingsaccountwidget
 *
 * The Account Information widget
 */
Zarafa.settings.ui.SettingsAccountWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	/**
	 * The language which is currently active in the interface
	 * @property
	 * @type String
	 * @private
	 */
	origLanguage : '',

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		var user = container.getUser();
		var languageStore = {
			xtype : 'jsonstore',
			autoDestroy : true,
			fields : ['lang', 'name'],
			data : container.getLanguages()
		};

		// Load the items from the maintabbar
		var items = container.populateInsertionPoint('main.maintabbar.left', this);
		items = Zarafa.core.Util.sortArray(items, 'ASC', 'tabOrderIndex');
		var startupStore = {
			xtype : 'jsonstore',
			autoDestroy : true,
			fields : ['context', 'text'],
			data : items
		};

		Ext.applyIf(config, {
			title : String.format(_('Account information - {0}'), user.getDisplayName()),
			layout : 'form',
			items : [{
				xtype : 'displayfield',
				fieldLabel : _('Display Name'),
				value : user.getDisplayName(),
				htmlEncode : true
			},{
				xtype : 'displayfield',
				fieldLabel : _('E-mail'),
				value : user.getSMTPAddress(),
				htmlEncode : true
			},{
				xtype : 'zarafa.compositefield',
				fieldLabel : _('Language'),
				items : [{
					xtype : 'combo',
					name : 'zarafa/v1/main/language',
					ref : '../languageCombo',
					width : 200,
					store : languageStore,
					mode: 'local',
					triggerAction: 'all',
					displayField: 'name',
					valueField: 'lang',
					lazyInit: false,
					forceSelection: true,
					editable: false,
					autoSelect: true,
					listeners : {
						select : this.onLanguageSelect,
						scope : this
					}
				},{
					xtype : 'displayfield',
					cls : 'zarafa-settings-reload-warning',
					ref : '../languageWarning'
				}]
			},{
				xtype : 'combo',
				fieldLabel : _('Startup folder'),
				name : 'zarafa/v1/main/default_context',
				ref : 'startupCombo',
				width : 200,
				store : startupStore,
				mode: 'local',
				triggerAction: 'all',
				displayField: 'text',
				valueField: 'context',
				lazyInit: false,
				forceSelection: true,
				editable: false,
				autoSelect: true,
				listeners : {
					select : this.onStartupSelect,
					scope : this
				}
			}]
		});

		Zarafa.settings.ui.SettingsAccountWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Event handler which is fired when a language in the {@link Ext.form.ComboBox combobox} 
	 * has been selected. This will inform the user that this setting requires a reload of the
	 * webapp to become active.
	 * @param {Ext.form.ComboBox} combo The combobox which fired the event
	 * @param {Ext.data.Record} record The selected record in the combobox
	 * @param {Number} index The selected index in the store
	 * @private
	 */
	onLanguageSelect : function(combo, record, index)
	{
		var value = record.get(combo.valueField);

		if (this.origLanguage !== value) {
			this.languageWarning.setValue(_('This change requires a reload of the WebApp'));
		} else {
			this.languageWarning.reset();
		}

		if (this.model) {
			this.model.set(combo.name, value);
		}
	},

	/**
	 * Event handler which is fired when a Startup Context in the {@link Ext.form.ComboBox combobox}
	 * has been selected.
	 * @param {Ext.form.ComboBox} combo The combobox which fired the event
	 * @param {Ext.data.Record} record The selected record in the combobox
	 * @param {Number} index The selected index in the store
	 * @private
	 */
	onStartupSelect : function(combo, record, index)
	{
		var value = record.get(combo.valueField);
		if (this.model) {
			this.model.set(combo.name, value);
		}
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategoryWidgetPanel widget panel}
	 * to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel)
	{
		Zarafa.settings.ui.SettingsAccountWidget.superclass.update.apply(this, arguments);

		this.model = settingsModel;

		// Load the original language from the settings
		this.origLanguage = settingsModel.get(this.languageCombo.name);

		this.languageCombo.setValue(this.origLanguage);
		this.languageWarning.reset();

		this.startupCombo.setValue(settingsModel.get(this.startupCombo.name));
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategoryWidgetPanel widget panel}
	 * to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
		Zarafa.settings.ui.SettingsAccountWidget.superclass.updateSettings.apply(this, arguments);

		settingsModel.beginEdit()
		settingsModel.set(this.languageCombo.name, this.languageCombo.getValue());
		settingsModel.set(this.startupCombo.name, this.startupCombo.getValue());
		settingsModel.endEdit();
	}
});

Ext.reg('zarafa.settingsaccountwidget', Zarafa.settings.ui.SettingsAccountWidget);
