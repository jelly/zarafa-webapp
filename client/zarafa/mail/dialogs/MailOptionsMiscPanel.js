Ext.namespace('Zarafa.mail.dialogs');

/**
 * @class Zarafa.mail.dialogs.MailOptionsMiscPanel
 * @extends Ext.form.FormPanel
 * @xtype zarafa.mailoptionsmiscpanel
 *
 * Panel for users to set miscellaneous options on a given {@link Zarafa.mail.MailRecord record},
 * like the categories.
 */
Zarafa.mail.dialogs.MailOptionsMiscPanel = Ext.extend(Ext.form.FormPanel, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.recordcomponentupdaterplugin');

		config = Ext.applyIf(config, {
			xtype : 'zarafa.mailoptionsmiscpanel',
			title: _('Miscellaneous Options'),
			layout: 'form',
			items: [{
				xtype: 'zarafa.compositefield',
				hideLabel: true,
				anchor: '100%',
				items: [{
					xtype: 'button',
					width: 100,
					text: _('Categories'),
					handler: this.onCategoriesHandler,
					scope: this
				},{
					xtype: 'textfield',
					ref: '../categoriesTextField',
					name: 'categories',
					flex : 1,
					listeners: {
						'change' : this.onPropertyChange,
						scope : this
					}		
				}]
			},{
				xtype: 'textarea',
				fieldLabel: _('Internet Headers'),
				name: 'transport_message_headers',
				readOnly: true,
				// Anchor -32 pixels from the bottom to compensate for the extra
				// horizontal scrollbar, we are forcing during rendering.
				anchor: '0 -32',
				autoScroll: true,
				border: false,
				// Make sure the text is not wrapped
				style: 'word-wrap: normal',
				ref: 'headersTextArea'
			}]
		});

		Zarafa.mail.dialogs.MailOptionsMiscPanel.superclass.constructor.call(this, config);
	},
	
	/**
	 * Event handler which is triggered when the Input field for category
	 * has been changed by the user.
	 * and will apply it to the {@link Zarafa.core.data.IPMRecord record}.
	 * @param {Ext.form.Field} field The {@link Ext.form.Field field} which was changed.
	 * @param {Mixed} newValue The new value
	 * @param {Mixed} oldValue The old value
	 * @private
	 */
	onPropertyChange : function(field, newValue, oldValue)
	{
		if (!Ext.isEmpty(field.name)) {
			this.record.set(field.name, newValue);
		}
	},
	
	/**
	 * Handler which is called when the categories button has been pressed. this will open the
	 * categories dialog.
	 * @private
	 */
	onCategoriesHandler : function()
	{
		if (this.record) {
			Zarafa.common.Actions.openCategoriesContent(this.record, {autoSave : false});
		}
	},

	/**
	 * Update the {@link Ext.Panel Panel} with the given {@link Zarafa.core.data.IPMRecord IPMRecord}
	 * @param {Zarafa.core.data.IPMRecord} record The record to update the panel with
	 * @param {Boolean} contentReset force the component to perform a full update of the data.
	 */
	update : function(record, contentReset)
	{
		this.record = record;

		if (record) {
			this.getForm().loadRecord(record);
		} else {
			this.categoriesTextField.setValue('');
			this.headersTextArea.setValue('');
		}
	},

	/**
	 * Update the {@link Zarafa.core.data.IPMRecord IPMRecord} with the data from the {@link Ext.Panel Panel}.
	 * @param {Zarafa.core.data.IPMRecord} record The record which has to be updated
	 */
	updateRecord : function(record)
	{
		this.getForm().updateRecord(record);
	}
});

Ext.reg('zarafa.mailoptionsmiscpanel', Zarafa.mail.dialogs.MailOptionsMiscPanel);
