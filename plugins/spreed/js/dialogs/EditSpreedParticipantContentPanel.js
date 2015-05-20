Ext.namespace('Zarafa.plugins.spreed.dialogs');

/**
 * @class Zarafa.plugins.spreed.dialogs.EditSpreedParticipantContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype spreed.spreededitparticipantcontentpanel
 *
 * This content panel allows editing of a recipient in spreed meeting.
 */
Zarafa.plugins.spreed.dialogs.EditSpreedParticipantContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
	/**
	 * @cfg {Zarafa.plugins.spreed.data.SpreedParticipantRecord} record The participant which
	 * is being edited by this panel.
	 */
	record : undefined,

	/**
	 * The form panel which is loaded inside this panel.
	 * @property
	 * @type Ext.form.FormPanel
	 */
	formPanel : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		var timezonesStore = new Ext.data.JsonStore({
			xtype   : 'jsonstore',
			fields  : ['name', 'value'],
			data    : Zarafa.plugins.spreed.data.SpreedTimezones
		});
		timezonesStore.sort('name', 'ASC');

		var languageStore = new Ext.data.JsonStore({
			xtype : 'jsonstore',
			fields : ['name', 'value'],
			data: Zarafa.plugins.spreed.data.SpreedLanguages,
			sortInfo: {
				field: 'name',
				direction: 'ASC'
			}
		});

		var displayName=config.record.get('display_name');
		var email=config.record.get('smtp_address');
		var moderatorStatus=config.record.get('isModerator');
		var language=config.record.get('language');
		var timezone=config.record.get('timezone');

		Ext.applyIf(config, {
			title  : _('Edit Spreed Participant'),
			layout : 'fit',
			width  : 400,
			height : 180,
			items  : [{
				xtype  : 'form',
				layout : 'form',
				border : false,
				ref    : 'formPanel',
				items  : [
					{
						xtype      : 'textfield',
						fieldLabel : _('Display Name'),
						name       : 'display_name',
						value      : displayName,
						anchor     : '100%'
					},

					{
						xtype      : 'textfield',
						fieldLabel : _('Email Address'),
						name       : 'smtp_address',
						value      : email,
						anchor     : '100%'
					},

					{
						xtype      : 'checkbox',
						name       : 'isModerator',
						fieldLabel : _('Is Moderator'),
						checked    : moderatorStatus,
						value      : moderatorStatus,
						anchor     : '100%'
					},

					{
						xtype           : 'combo',
						name            : 'timezone',
						width           : 150,
						store           : timezonesStore,
						value           : timezone,
						mode            : 'local',
						displayField    : 'name',
						valueField      : 'value',
						triggerAction   : 'all',
						forceSelection  : true,
						editable        : false,
						lazyInit        : false,
						fieldLabel      : _('Timezone'),
						anchor     : '100%'
					},

					{
						xtype		: 'combo',
						name		: 'language',
						value		: language,
						fieldLabel	: _('Language'),
						width		: 200,
						store		: languageStore,
						mode		: 'local',
						triggerAction: 'all',
						displayField: 'name',
						valueField	: 'value',
						lazyInit	: false,
						forceSelection: true,
						editable	: false,
						autoSelect	: true,
						anchor		: '100%'
					}


				],
				buttons: [{
					text: _('Ok'),
					handler: this.onOk,
					scope: this
				},
					{
						text: _('Cancel'),
						handler: this.onCancel,
						scope: this
					}
				]
			}]
		});
		Zarafa.plugins.spreed.dialogs.EditSpreedParticipantContentPanel.superclass.constructor.call(this, config);
		this.mon(this, 'afterlayout', this.onAfterFirstLayout, this, { single: true });
	},

	/**
	 * Event handler which is fired when {@link #afterlayout} has been called for the first time.
	 * This will load the {@link #record} into {@link #formPanel}.
	 * @private
	 */
	onAfterFirstLayout : function()
	{
		this.formPanel.getForm().loadRecord(this.record);
	},

	/**
	 * Event handler which is raised when the user clicks the "Ok" {@link Ext.Button button}
	 * @private
	 */
	onOk : function()
	{
		this.formPanel.getForm().updateRecord(this.record);
		this.close();
	},

	/**
	 * Event handler which is raised when the user clicks the "Cancel" {@link Ext.Button button}
	 * @private
	 */
	onCancel : function()
	{
		this.close();
	}
});

Ext.reg('spreed.spreededitparticipantcontentpanel', Zarafa.plugins.spreed.dialogs.EditSpreedParticipantContentPanel);
