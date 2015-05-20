Ext.namespace('Zarafa.mail.settings');

/**
 * @class Zarafa.mail.settings.SettingsOofWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype zarafa.settingsoofwidget
 *
 * The {@link Zarafa.settings.ui.SettingsWidget widget} for configuring
 * the Out of Office settings in the {@link Zarafa.mail.settings.SettingsMailCategory mail category}.
 */
Zarafa.mail.settings.SettingsOofWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			title : _('Out of Office'),
			favorite : true,
			iconCls : 'zarafa-settings-favorite-oof',
			items : [{
				xtype : 'radiogroup',
				name : 'zarafa/v1/contexts/mail/outofoffice/set',
				ref : 'oofField',
				columns : 1,
				hideLabel : true,
				items : [{
					xtype : 'radio',
					name : 'enableOof',
					// ExtJs demands inputValue to be a string
					inputValue : 'false',
					boxLabel : _('I am currently in the office')
				},{
					xtype : 'radio',
					name : 'enableOof',
					// ExtJs demands inputValue to be a string
					inputValue : 'true',
					boxLabel : _('I am currently out of the office')
				}],
				listeners : {
					change : this.onRadioChange,
					scope : this
				}
			},{
				xtype : 'textfield',
				name : 'zarafa/v1/contexts/mail/outofoffice/subject',
				ref : 'subjectField',
				fieldLabel : _('Subject'),
				emptyText : _('Out of Office'),
				anchor : '100%',
				listeners : {
					change : this.onFieldChange,
					scope : this
				}
			},{
				xtype : 'displayfield',
				hideLabel : true,
				value : _('AutoReply only once to each sender with the following text') + ':'
			},{
				xtype : 'textarea',
				name : 'zarafa/v1/contexts/mail/outofoffice/message',
				ref : 'bodyField',
				hideLabel : true,
				emptyText : _('User is currently out of office.'),
				anchor : '100%',
				listeners : {
					change : this.onFieldChange,
					scope : this
				}
			}]
		});

		Zarafa.mail.settings.SettingsOofWidget.superclass.constructor.call(this, config);
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

		this.oofField.setValue(settingsModel.get(this.oofField.name).toString());
		this.subjectField.setValue(settingsModel.get(this.subjectField.name));
		this.bodyField.setValue(settingsModel.get(this.bodyField.name));
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
		var set = this.oofField.getValue().inputValue === 'true';

		// We must either set the requested subject, or the default subject
		var subject = this.subjectField.getValue() || this.subjectField.emptyText;

		// We must either set the requested body, or the default body
		var body = this.bodyField.getValue() || this.bodyField.emptyText;

		settingsModel.beginEdit();
		settingsModel.set(this.oofField.name, set);
		settingsModel.set(this.subjectField.name, subject);
		settingsModel.set(this.bodyField.name, body);
		settingsModel.endEdit();
	},

	/**
	 * Event handler which is fired when a {@link Ext.form.Radio} in the
	 * {@link Ext.form.RadioGroup} has been changed. This will toggle the
	 * visibility of the other fields.
	 * @param {Ext.form.RadioGroup} group The radio group which fired the event
	 * @param {Ext.form.Radio} radio The radio which was enabled
	 * @private
	 */
	onRadioChange : function(group, radio)
	{
		var set = radio.inputValue === 'true';

		if (this.model) {
			// FIXME: The settings model should be able to detect if
			// a change was applied
			if (this.model.get(group.name) !== set) {
				this.model.set(group.name, set);
			}
		}

		this.subjectField.setDisabled(!set);
		this.bodyField.setDisabled(!set);
	},

	/**
	 * Event handler which is called when one of the textfields has been changed.
	 * This will apply the new value to the settings (or if the text is empty,
	 * the {@link Ext.form.Field#emptyText} will be saved).
	 * @param {Ext.form.Field} field The field which has fired the event
	 * @param {String} value The new value
	 * @private
	 */
	onFieldChange : function(field, value)
	{
		if (this.model) {
			this.model.set(field.name, value || field.emptyText);
		}
	}
});

Ext.reg('zarafa.settingsoofwidget', Zarafa.mail.settings.SettingsOofWidget);
