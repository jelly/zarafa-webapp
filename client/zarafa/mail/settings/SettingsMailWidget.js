Ext.namespace('Zarafa.mail.settings');

/**
 * @class Zarafa.mail.settings.SettingsMailWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype zarafa.settingsmailwidget
 *
 * The {@link Zarafa.settings.ui.SettingsWidget widget} for configuring
 * the general mail options in the {@link Zarafa.mail.settings.SettingsMailCategory mail category}.
 */
Zarafa.mail.settings.SettingsMailWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		var previewStore = {
			xtype : 'jsonstore',
			autoDestroy : true,
			fields : ['name', 'value'],
			data : [{
				'name' : _('Off'),
				'value' : Zarafa.mail.data.ViewModes.NO_PREVIEW
			},{
				'name' : _('Right'),
				'value' : Zarafa.mail.data.ViewModes.RIGHT_PREVIEW
			},{
				'name' : _('Bottom'),
				'value' : Zarafa.mail.data.ViewModes.BOTTOM_PREVIEW
			}]
		};

		Ext.applyIf(config, {
			title : _('General mail settings'),
			layout : 'form',
			items : [{
				xtype : 'combo',
				name : 'zarafa/v1/state/contexts/mail/current_view_mode',
				ref : 'previewCombo',
				fieldLabel : _('Location of preview pane'),
				width : 200,
				store : previewStore,
				mode: 'local',
				triggerAction: 'all',
				displayField: 'name',
				valueField: 'value',
				lazyInit: false,
				forceSelection: true,
				editable: false,
				autoSelect: true,
				listeners : {
					select : this.onPreviewSelect,
					scope : this
				}
			},{
				xtype : 'checkbox',
				name : 'zarafa/v1/contexts/mail/close_on_respond',
				ref : 'closeCheck',
				fieldLabel : _('Close mail when responding'),
				lazyInit : false,
				listeners : {
					check : this.onCheck,
					scope : this
				}
			}]
		});

		Zarafa.mail.settings.SettingsMailWidget.superclass.constructor.call(this, config);
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

		this.previewCombo.setValue(settingsModel.get(this.previewCombo.name));
		this.closeCheck.setValue(settingsModel.get(this.closeCheck.name));
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel)
	{
		settingsModel.set(this.previewCombo.name, this.previewCombo.getValue());
		settingsModel.set(this.closeCheck.name, this.closeCheck.getValue());
	},

	/**
	 * Event handler which is called when a selection has been made in the
	 * Preview Panel type {@link Ext.form.ComboBox combobox}.
	 * @param {Ext.form.ComboBox} field The field which fired the event
	 * @param {Ext.data.Record} record The selected record
	 */
	onPreviewSelect : function(field, record)
	{
		if (this.model) {
			var set = record.get(field.valueField);

			// FIXME: The settings model should be able to detect if
			// a change was applied
			if (this.model.get(field.name) !== set) {
				this.model.set(field.name, set);
			}
		}
	},

	/**
	 * Event handler called when checkbox has been modified
	 *
	 * @param {Ext.form.CheckBox} checkbox Checkbox element from which the event originated
	 * @param {Boolean} checked State of the checkbox
	 * @private
	 */
	onCheck : function(checkbox, checked)
	{
		if(this.model) {
			// FIXME: The settings model should be able to detect if
			// a change was applied
			if (this.model.get(checkbox.name) !== checked) {
				this.model.set(checkbox.name, checked);
			}
		}
	}
});

Ext.reg('zarafa.settingsmailwidget', Zarafa.mail.settings.SettingsMailWidget);
