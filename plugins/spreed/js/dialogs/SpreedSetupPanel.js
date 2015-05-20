Ext.namespace('Zarafa.plugins.spreed.dialogs');

/**
 * @class Zarafa.plugins.spreed.dialogs.SpreedSetupPanel
 * @extends Ext.Panel
 * Main panel of spreed setup dialog.
 *
 * @xtype spreed.spreedsetuppanel
 */
Zarafa.plugins.spreed.dialogs.SpreedSetupPanel = Ext.extend(Ext.form.FormPanel, {

	/**
	 * Number of boxes after adding which
	 * the warning must be shown.
	 *
	 * @property
	 * @type Integer
	 * @private
	 */
	maxParticipants : 2,

	/**
	 * The spreed record with initial date to render in
	 * timeperiod field.
	 * @property
	 * @type Zarafa.plugins.spreed.data.SpreedRecord
	 * @private
	 */
	record:undefined,

	/**
	 * The Spreed warning message used to check if rendred.
	 * @property
	 * @private
	 */
	warning: undefined,
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 *
	 */
	constructor : function(config)
	{
		config = config || {};

		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.recordcomponentupdaterplugin');
		this.maxParticipants = container.getSettingsModel().get('zarafa/v1/plugins/spreed/max_participants');
		Ext.apply(config, {
			xtype     : 'spreed.spreedsetuppanel',
			layout    : {
				type  : 'vbox',
				align : 'stretch'
			},
			bodyStyle : 'background-color: inherit;',
			defaults  : {
				border      : true,
				bodyStyle   : 'background-color: inherit; padding: 3px 0px 3px 0px; border-style: none none solid none;'
			},
			items     : [
				this.createParticipantPanel(),
				this.createSubjectPanel(),
				this.createTimePanel(),
				this.createAttachmentsPanel(),
				this.createDescriptionPanel()
			]
		});
		//Call parent constructor
		Zarafa.plugins.spreed.dialogs.SpreedSetupPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Creates the participant panel {@link Ext.Panel panel} with Participant field.
	 * @return {Object} Configuration object for the participant panel
	 * @private
	 */
	createParticipantPanel:function()
	{
		return [{
			xtype      : 'panel',
			layout     : 'form',
			autoHeight : true,
			items      : [{
				xtype       : 'zarafa.compositefield',
				anchor      : '100%',
				hideLabel   : true,
				items       : [{
					xtype       : 'button',
					width       : 100,
					text        : _('Participants')+':',
					handler     : this.addParticipantsFromAddressBook,
					scope       : this
				},{
					xtype       : 'spreed.spreedparticipantfield',
					plugins     : [ 'zarafa.recordcomponentupdaterplugin' ],
					ref	    : '../../spreedparticipantfield',
					flex        : 1
				}]
			},{
				xtype       : 'displayfield',
				anchor      : '100%',
				autoShow    : true,
				ref         : '../spreed_warning',
				cls         : 'spreed-Warning',
				hidden      : true,
				value       : String.format(_('You have too many participants selected. You are allowed to add {0} additional participants to the web meeting.'), this.maxParticipants)
			}]
		}]
	},

	/**
	 * Creates the subject panel {@link Ext.Panel panel} with subject field.
	 * @return {Object} Configuration object for the subject panel
	 * @private
	 */
	createSubjectPanel:function()
	{
		return {
			xtype      : 'panel',
			layout     : 'form',
			autoHeight : false,
			items      : [{
				xtype      : 'textfield',
				fieldLabel : _('Subject'),
				name       : 'subject',
				labelWidth : 100,
				anchor     : '100%',
				listeners  : {
					scope		 : this,
					change		 : this.onFieldChange
				}
			}]
		}
	},

	/**
	 * Creates the Panel with time range fields.
	 * @return configuration object for form panel
	 * @private
	 */
	createTimePanel : function()
	{
		var timezonesStore = new Ext.data.JsonStore({
			xtype   : 'jsonstore',
			fields  : ['name', 'value'],
			data    : Zarafa.plugins.spreed.data.SpreedTimezones,
			sortInfo: {
				field: 'name',
				direction: 'ASC'
			}
		});

		var duration = container.getSettingsModel().get('zarafa/v1/contexts/calendar/default_appointment_period');
		//delay of spreed meeting based on default reminder time from calendar settings
		var delay = container.getSettingsModel().get('zarafa/v1/contexts/calendar/default_zoom_level');
		var startTime = new Date().ceil(Date.MINUTE, delay);

		//we need default value to render correctly start time, when changing the value of timeperiod field
		var defValue = new Zarafa.core.DateRange({
			startDate	: startTime,
			dueDate		: startTime.add(Date.MINUTE, duration)
		});

		var timepanel= {
			xtype       : 'panel',
			layout      : 'hbox',
			items       : [{
				xtype		: 'zarafa.timeperiodfield',
				timeIncrement	: delay,
				defaultValue	: defValue,
				name		: 'timeperiod',
				defaultPeriod	: duration,
				defaultPeriodType   : Date.MINUTE,
				ref	  	: '../toTime',
				listeners 	: {
					scope : this,
					change : this.onTimePeriodFieldChange
				},
				spacerConfig        : {
					width : 5
				},
				startFieldConfig    : {
					name  		: 'start_time',
					width 		: 80,
					minValue	: new Date().clearTime(),
					maxValue	: new Date().clearTime().add(Date.DAY, 1)
				},
				endFieldConfig      : {
					name  		: 'end_time',
					minValue	: new Date().clearTime(),
					maxValue	: new Date().clearTime().add(Date.DAY, 1),
					width : 80
				},
				width: 220
			},{
				xtype           : 'combo',
				name            : 'timezone',
				plugins		: [ 'zarafa.fieldlabeler' ],
				fieldLabel	: _('Timezone'),
				width           : 275,
				store           : timezonesStore,
				value           : container.getSettingsModel().get('zarafa/v1/plugins/spreed/default_timezone'),
				mode            : 'local',
				displayField    : 'name',
				valueField      : 'value',
				triggerAction   : 'all',
				forceSelection  : true,
				editable        : false,
				lazyInit        : false,
				listeners : {
					scope : this,
					select : this.onTimezoneFieldSelect
				}
			}]
		};
		return timepanel;
	},

	/**
	 * Creates the attachment panel {@link Ext.Panel panel} with attachment field.
	 * @return {Object} Configuration object for the attachment panel.
	 * @private
	 */
	createAttachmentsPanel:function()
	{
		return  {
			xtype   : 'panel',
			layout  : 'fit',
			border  : true,
			items   : [{
				xtype     : 'zarafa.compositefield',
				hideLabel : true,
				anchor    : '100%',
				autoHeight: true,
				items     : [{
					xtype     : 'zarafa.attachmentbutton',
					width     : 100,
					text      : _('Attachments') + ':',
					plugins   : [ 'zarafa.recordcomponentupdaterplugin' ]
				},{
					xtype    : 'zarafa.attachmentfield',
					boxtype  : 'zarafa.attachmentbox',
					plugins   : [ 'zarafa.recordcomponentupdaterplugin' ],
					flex     : 1,
					hideLabel: true,
					value    : undefined
				}]
			}]
		}
	},

	/**
	 * Creates the description panel {@link Ext.Panel panel} with description field.
	 * @return {Object} Configuration object for the description panel.
	 * @private
	 */
	createDescriptionPanel:function()
	{
		return {
			xtype   : 'panel',
			flex: 1,
			layout    : 'fit',
			border  : false,
			items   : [{
				xtype      : 'textarea',
				autoScroll : true,
				hideLabel : true,
				name      : 'description',
				listeners : {
					scope : this,
					change : this.onFieldChange
				}
			}]
		}
	},

	/**
	 * Load record into spreed setup panel
	 * and update the ui timeperiod field with
	 * values taken from record.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to load
	 * @param {Boolean} contentReset force the component to perform a full update of the data.
	 * @private
	 */
	update : function(record, contentReset)
	{
		if (record.isOpened()) {
			//warning abbout too many participants
			this.tryShowingWarning(record);
		}

		this.record = record;
		this.getForm().loadRecord(record);

		var newStartTime = record.get('start_time').toUTC();
		var newEndTime = record.get('end_time').toUTC();

		this.toTime.startField.setValue(newStartTime);
		this.toTime.endField.setValue(newEndTime);
	},

	/**
	 * Called before record will be saved to server.
	 * Collect the data from the form fields and update the record
	 * with fields values.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record to update
	 * @private
	 */
	updateRecord : function(record)
	{
		record.beginEdit();

		this.getForm().updateRecord(record);

		//startTime and endTime got from the dialog
		var startTime =this.toTime.getValue().getStartDate();
		var endTime = this.toTime.getValue().getDueDate();

		// Convert to a Date object where the getTime() returns a timestamp that has the same time as displayed to the user
		startTime = startTime.fromUTC();
		endTime = endTime.fromUTC();

		record.set('start_time', startTime);
		record.set('end_time', endTime);

		record.endEdit();
	},

	/**
	 * Event handler which is triggered when one of the Input fields
	 * has been changed by the user. It will
	 * apply the new value to the {@link Zarafa.plugins.spreed.data.SpreedRecord record}.
	 * @param {Ext.form.Field} field The {@link Ext.form.Field field} which was changed.
	 * @param {Mixed} newValue The new value
	 * @param {Mixed} oldValue The old value
	 * @private
	 */
	onFieldChange : function(field, newValue, oldValue)
	{
		var record = this.record;
		record.set(field.getName(), newValue);
	},

	/**
	 * The event hander for timeperiod field.
	 * It will apply the new value to the {@link Zarafa.plugins.spreed.data.SpreedRecord record}.
	 * @param {Ext.form.Field} field The {@link Ext.form.Field field} which was changed.
	 * @param {Mixed} newValue The new value
	 * @param {Mixed} oldValue The old value
	 * @private
	 */
	onTimePeriodFieldChange: function(field, newValue, oldValue)
	{
		var record = this.record;
		record.beginEdit();
		record.set('start_time', newValue.getStartDate().fromUTC());
		record.set('end_time', newValue.getDueDate().fromUTC());
		record.endEdit();
	},

	/**
	 * The event hander for timezone field.
	 * @param {Ext.form.ComboBox} combo - this combobox
	 * @param {Ext.data.Record} record - the data record returned from the underlying store
	 * @param {Number} index - the index of the selected item in the dropdown list
	 * @private
	 */
	onTimezoneFieldSelect:function(combo, record, index)
	{
		var spreedRecord = this.record;
		spreedRecord.set('timezone', record.get(combo.valueField));

		if (spreedRecord.isOpened()) {
			var subStoreRecipients = spreedRecord.getSubStore('recipients');
			subStoreRecipients.each(function(recipient) {
				//this ensures that all recipients which don't have an alternative timezone,
				// are in the set for the same timezone as the meeting request.
				if (Ext.isEmpty(recipient.get('timezone')) || recipient.get('timezone') == spreedRecord.modified.timezone) {
					//setting the general meeting timezone for each recipient
					recipient.set('timezone', spreedRecord.get('timezone'));
				}
			}, this);
		}
	},

	/*
	 * Creates a dialog from shared component addressbook.dialog.recipientselection
	 * to add participants from address book for spreed meeting dialog
	 *
	 * @private
	 */
	addParticipantsFromAddressBook: function()
	{
		// Create a copy of the record, we don't want the changes
		// to be activated until the user presses the Ok button.
		var copy = this.record.copy();
		var store = copy.getSubStore('recipients');

		Zarafa.common.Actions.openABUserMultiSelectionContent({
			callback : function() {
				this.record.applyData(copy);
			},
			scope : this,
			store : store,
			listRestriction :{
				hide_groups : true,
				hide_distlist: true
			},
			convert : function(user, field) {
				if (user.get('object_type') != Zarafa.core.mapi.ObjectType.MAPI_DISTLIST) {
					return Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, {
						entryid : user.get('entryid'),
						object_type : user.get('object_type'),
						display_name : user.get('display_name'),
						display_type : user.get('display_type'),
						display_type_ex : user.get('display_type_ex'),
						smtp_address : user.get('smtp_address') || user.get('email_address'),
						address_type : user.get('address_type'),
						recipient_type : field ? field.defaultRecipientType :Zarafa.core.mapi.RecipientType.MAPI_TO
					});
				}
			},
			selectionCfg : [{
				xtype : 'zarafa.recipientfield',
				fieldLabel : _('Participants') + ':',
				height : 50,
				boxStore : store,
				filterRecipientType: Zarafa.core.mapi.RecipientType.MAPI_TO,
				defaultRecipientType: Zarafa.core.mapi.RecipientType.MAPI_TO,
				flex : 1
			}]
		});
	},

	/**
	 * Function to check if we need to show warning about the number of participants.
	 * @param {Zarafa.plugins.spreed.data.SpreedRecord} record - spreedrecord to check
	 * for number of participants
	 * @private
	 */
	tryShowingWarning:function(record)
	{
		if (record.getRecipientStore().getCount() > this.maxParticipants) {
			if (this.spreed_warning.hidden) {
				this.spreed_warning.show();
				this.doLayout();
				this.spreed_warning.getEl().fadeIn({
					block    : true,
					endOpacity : 1,
					easing   : 'easeIn',
					duration : 1
				});
			}
		} else if (!this.spreed_warning.hidden) {
			this.spreed_warning.getEl().fadeOut({
				easing     : 'easeOut',
				endOpacity : 1,
				duration   : 1,
				scope      : this,
				callback   : function() {
					this.spreed_warning.hide();
					this.doLayout();
				}
			});
		}
	}
});

Ext.reg('spreed.spreedsetuppanel', Zarafa.plugins.spreed.dialogs.SpreedSetupPanel);
