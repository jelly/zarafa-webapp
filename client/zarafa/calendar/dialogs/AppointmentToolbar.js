Ext.namespace('Zarafa.calendar.dialogs');

/**
 * @class Zarafa.calendar.dialogs.AppointmentToolbar
 * @extends Zarafa.core.ui.ContentPanelToolbar
 * @xtype zarafa.appointmenttoolbar
 */
Zarafa.calendar.dialogs.AppointmentToolbar = Ext.extend(Zarafa.core.ui.ContentPanelToolbar, {
	// Insertion points for this class
	/**
	 * @insert context.calendar.appointmentcontentpanel.toolbar.actions
	 * Insertion point for the Actions buttons in the Appointment ContentPanel Toolbar
	 * @param {Zarafa.calendar.dialogs.AppointmentToolbar} toolbar This toolbar
	 */
	/**
	 * @insert context.calendar.appointmentcontentpanel.toolbar.options
	 * Insertion point for the Options button in the Appointment Content Panel Toolbar
	 * @param {Zarafa.calendar.dialogs.AppointmentToolbar} toolbar This toolbar
	 */

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.recordcomponentupdaterplugin');

		Ext.applyIf(config, {
			insertionPointBase: 'context.calendar.appointmentcontentpanel',
			actionItems: this.createActionButtons(),
			optionItems: this.createOptionButtons()
		});

		Zarafa.calendar.dialogs.AppointmentToolbar.superclass.constructor.call(this, config);
	},

	/**
	 * Create all buttons which should be added by default the the `Actions` buttons.
	 * These buttons are used to send, save and add attachments to the message. And it contains
	 * also buttons to check the recipient names or add a signature.
	 *
	 * @return {Array} The {@link Ext.Button Button} elements which should be added
	 * in the Actions section of the {@link Ext.Toolbar Toolbar}.
	 * @private
	 */
	createActionButtons : function()
	{
		return [{
			xtype : 'zarafa.meetingrequestbuttons'		
		},{
			xtype: 'button',
			overflowText: _('Send invitation'),
			text: _('Send'),
			tooltip: {
				title: _('Send invitation'),
				text: _('Send invitation to recipients') + ' (Ctrl + ENTER)'
			},
			iconCls: 'icon_sendEmail',
			cls: 'button_sendMail',
			ref: 'sendInvitation',
			handler: this.onSendButton,
			scope: this
		},{
			xtype: 'button',
			overflowText: _('Save & Close'),
			tooltip: {
				title: _('Save & Close'),
				text: _('Save appointment and close dialog') + ' (Ctrl + S)'
			},
			iconCls: 'icon_saveEmail',
			ref : 'saveAppointment',
			handler: this.onSaveButton,
			scope: this
		},{
			xtype: 'button',
			overflowText: _('Save'),
			tooltip: {
				title: _('Save'),
				text: _('Save without sending an invitation to recipients') + ' (Ctrl + S)'
			},
			iconCls: 'icon_saveEmail',
			ref : 'saveMeeting',
			handler: this.onSaveButton,
			scope: this
		},{
			xtype : 'button',
			overflowText: _('Delete'),
			tooltip: {
				title: _('Delete'),
				text: _('Delete this appointment')
			},
			iconCls : 'icon_delete',
			ref: 'deleteAppointment',
			handler : this.onDeleteButton,
			scope : this
		},{
			xtype: 'zarafa.attachmentbutton',
			plugins : [ 'zarafa.recordcomponentupdaterplugin' ],
			ref : 'normalAttachmentsButton', // FIXME: Remove after WA-4880 is implemented
			overflowText: _('Add attachment'),
			tooltip: {
				title: _('Add attachment'),
				text: _('Add attachments to this appointment')
			},
			iconCls : 'icon_attachment'
		},{
			// FIXME: Remove after WA-4880 is implemented
			xtype : 'button',
			ref : 'occurenceAttachmentsButton',
			overflowText : _('Cannot add attachment'),
			tooltip : {
				title : _('Cannot add attachment'),
				text : _('Attachments cannot be modified for a single occurence')
			},
			iconCls : 'icon_attachment',
			handler : function() {
				Ext.MessageBox.show({
					title : _('Warning'),
					msg : _('Attachments cannot be modified for a single occurence'),
					buttons : Ext.Msg.OK,
					icon : Ext.MessageBox.WARNING
				});
			}
		},{
			xtype: 'button',
			overflowText: _('Print'),
			tooltip: {
				title: _('Print'),
				text: _('Print this appointment')
			},
			iconCls : 'icon_print',
			handler: function() {
				Zarafa.common.Actions.openPrintDialog(this.record);
			},
			scope: this
		},{
			xtype: 'button',
			overflowText: _('Check names'),
			tooltip: {
				title: _('Check names'),
				text: _('Check all recipient names')
			},
			iconCls: 'icon_checkNames',
			ref: 'checkNames',
			handler: this.onCheckNamesButton,
			scope: this
		}];
	},

	/**
	 * Create all buttons which should be added by default the the `Options` buttons.
	 * This contains the buttons to set the message options like priority and read receipt.
	 *
	 * @return {Array} The {@link Ext.Button Button} elements which should be
	 * added in the Options section of the {@link Ext.Toolbar Toolbar}.
	 * @private
	 */
	createOptionButtons : function()
	{
		return [{
			xtype: 'button',
			text: _('Recurrence'),
			overflowText: _('Recurrence'),
			tooltip: {
				title: _('Recurrence'),
				text: _('Open the recurrence dialog')
			},
			iconCls: 'icon_recurrence',
			ref: 'recurrence',
			handler : this.onSetRecurrence,
			scope: this
		},{
			xtype: 'button',
			text: _('Invite attendees'),
			overflowText: _('Invite attendees'),
			tooltip: {
				title: _('Invite attendees'),
				text: _('Invite attendees for this appointment')
			},
			iconCls: 'icon_invite_attendees',
			ref: 'inviteAttendees',
			handler: this.onSetMeetingRequest,
			scope: this
		},{
			xtype: 'button',
			text: _('Cancel invitation'),
			tooltip: {
				title: _('Cancel invitation'),
				text: _('Cancel to invitation')
			},
			overflowText: _('Cancel invitation'),
			iconCls: 'icon_cancel_meeting_request',
			ref: 'cancelInvitation',
			handler: this.onCancelMeetingRequest,
			scope: this
		},{
			xtype: 'button',
			overflowText: _('High priority'),
			tooltip: {
				title: _('High priority'),
				text: _('Mark this appointment as high priority')
			},
			iconCls: 'icon_setHighPriority',
			ref: 'highPriority',
			toggleGroup: 'priorityGroup',
			importance: Zarafa.core.mapi.Importance.URGENT,
			handler: this.onPriorityGroupToggle,
			scope: this
		},{
			xtype: 'button',
			overflowText: _('Low priority'),
			tooltip: {
				title: _('Low priority'),
				text: _('Mark this appointment as low priority')
			},
			iconCls: 'icon_setLowPriority',
			ref: 'lowPriority',
			toggleGroup: 'priorityGroup',
			importance: Zarafa.core.mapi.Importance.NONURGENT,
			handler: this.onPriorityGroupToggle,
			scope: this
		},{
			xtype: 'button',
			overflowText: _('Categories'),
			tooltip: {
				title: _('Categories'),
				text: _('Open the categories dialog')
			},
			iconCls: 'icon_categories',
			handler: this.onCategories,
			scope: this
		},{
			xtype: 'button',
			overflowText: _('Private'),
			tooltip: {
				title: _('Private'),
				text: _('Mark this appointment as private')
			},
			iconCls: 'icon_private',
			ref: 'setPrivate',
			toggleGroup: 'privateGroup',
			handler: this.onPrivateGroupToggle,
			scope: this
		}];
	},

	/**
	 * Event handler which is called when the "Recurrence" button has been pressed.
	 * This will open the {@link Zarafa.common.recurrence.dialogs.RecurrenceContentPanel RecurrenceContentPanel}.
	 * @private
	 */
	onSetRecurrence : function()
	{
		Zarafa.common.Actions.openRecurrenceContent(this.record, { autoSave : false });
	},

	/**
	 * Event handler which is called when the "Invite Attendees" button has
	 * been pressed. This will update the "meeting" state of the record which
	 * will trigger the update of all UI components.
	 * @private
	 */
	onSetMeetingRequest : function()
	{
		this.record.convertToMeeting();
	},

	/**
	 * Event handler which is called when the "Cancel invitation" button has
	 * been pressed. This will update the "meeting" state of the record which
	 * will trigger the update of all UI components.
	 * @private
	 */
	onCancelMeetingRequest : function()
	{
		if (this.record.isMeetingSent()) {
			if (this.record.isAppointmentInPast()) {
				this.dialog.deleteRecord();
			} else {
				Zarafa.calendar.Actions.openSendCancellationContent(this.record);
			}
		} else {
			this.record.convertToAppointment();
		}
	},

	/**
	 * Event handler which is called when one of the PriorityGroup buttons
	 * have been toggled. If this is the case, the importance is updated,
	 * if the button is untoggled, then all buttons in the prioritygroup
	 * are untoggled and the normal importance is applied. Otherwise the
	 * importance which belongs to the button is applied.
	 *
	 * @param {Ext.Button} button The button from the PriorityGroup which was pressed
	 * @private
	 */
	onPriorityGroupToggle : function(button)
	{
		if (button.pressed) {
			this.record.set('importance', button.importance);
		} else {
			this.record.set('importance', Zarafa.core.mapi.Importance.NORMAL);
		}
	},

	/**
	 * Event handler which is called when the user pressed the 'Categories' button.
	 * This will open the {@link Zarafa.common.categories.dialogs.CategoriesContentPanel CategoriesContentPanel}.
	 * @private
	 */
	onCategories : function()
	{
		Zarafa.common.Actions.openCategoriesContent(this.record, {autoSave : false});
	},

	/**
	 * Event handler which is called when the PrivateGroup button
	 * has been toggled. If this is the case 'private' is updated.
	 *
	 * @param {Ext.Button} button The button which was toggled
	 * @private
	 */
	onPrivateGroupToggle : function(button)
	{
		this.record.beginEdit();
		this.record.set('private', button.pressed);
		if (button.pressed) {
			this.record.set('sensitivity', Zarafa.core.mapi.Sensitivity['PRIVATE']);
		} else {
			this.record.set('sensitivity', Zarafa.core.mapi.Sensitivity['NONE']);
		}
		this.record.endEdit();
	},

	/**
	 * Event handler when the "Check Names" button has been pressed.
	 * This will {@link Zarafa.core.data.IPMRecipient#resolve resolve} all recipients.
	 *
	 * @param {Ext.Button} button The button which has been pressed
	 * @private
	 */
	onCheckNamesButton : function(button)
	{
		this.record.getRecipientStore().resolve(undefined, { cancelPreviousRequest : true });
	},
	
	/**
	 * Event handler when the "Send" button has been pressed.
	 * This will {@link Zarafa.core.data.MessageContentPanel#sendRecord send} the given record.
	 *
	 * @param {Ext.Button} button The button which has been pressed
	 * @private
	 */
	onSendButton : function(button)
	{
		this.dialog.sendRecord();
	},

	/**
	 * Event handler when the "Save" button has been pressed.
	 * This will {@link Zarafa.core.data.RecordContentPanel#saveRecord save} the given record.
	 * it also checks whether the meesage is a meeting, and iff to will send the changes to attendees aswell
	 * @param {Ext.Button} button The button which has been pressed
	 * @private
	 */
	onSaveButton : function(button)
	{
		this.dialog.saveRecord();
	},

	/**
	 * Event handler when the "Delete" button has been pressed.
	 * This will {@link Zarafa.core.data.RecordContentPanel#deleteRecord delete} the given record.
	 *
	 * @param {Ext.Button} button The button which has been pressed
	 * @private
	 */
	onDeleteButton : function(button)
	{
		this.dialog.deleteRecord();
	},

	/**
	 * Updates the toolbar by updating the Toolbar buttons based on the settings
	 * from the {@link Zarafa.core.data.IPMRecord record}.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record update the panel with.
	 * @param {Boolean} contentReset force the component to perform a full update of the data.
	 */
	update : function(record, contentReset)
	{
		var layout = false;

		this.record = record;
		
		if(record.isSubMessage()) {
			// hide all buttons which is used to save changes
			this.sendInvitation.setVisible(false);
			this.saveAppointment.setVisible(false);
			this.saveMeeting.setVisible(false);
			this.checkNames.setVisible(false);
			this.deleteAppointment.setVisible(false);
			this.inviteAttendees.setVisible(false);
			this.cancelInvitation.setVisible(false);
			this.setPrivate.setVisible(false);
			this.highPriority.setVisible(false);
			this.lowPriority.setVisible(false);

			layout = true;
		} else {
			this.setPrivate.setVisible(true);
			this.highPriority.setVisible(true);
			this.lowPriority.setVisible(true);

			// Only enable delete button when it is not a phantom
			this.deleteAppointment.setDisabled(record.phantom === true);

			if (contentReset === true || record.isModifiedSinceLastUpdate('recurring')) {
				if (Ext.isEmpty(record.get('basedate'))) {
					this.recurrence.setVisible(true);
				} else {
					this.recurrence.setVisible(false);
				}
				layout = true;
			}

			if (contentReset === true || record.isModifiedSinceLastUpdate('meeting')) {
				// add meeting request related buttons
				var appointmentToolbarButtons = container.populateInsertionPoint('context.calendar.appointmentcontentpanel.toolbar.actions', this);
				this.insert(0, {xtype: 'zarafa.buttongroup', items: appointmentToolbarButtons, ref :'meetingrequestbuttons'});

				switch (record.get('meeting')) {
					case Zarafa.core.mapi.MeetingStatus.NONMEETING:
					default:
						this.sendInvitation.setVisible(false);
						this.saveAppointment.setVisible(true);
						this.saveMeeting.setVisible(false);
						this.deleteAppointment.setVisible(true);
						this.checkNames.setVisible(false);
						this.inviteAttendees.setVisible(true);
						this.cancelInvitation.setVisible(false);
						this.meetingrequestbuttons.setVisible(false);
						break;
					case Zarafa.core.mapi.MeetingStatus.MEETING:
						this.sendInvitation.setVisible(true);
						this.saveAppointment.setVisible(false);
						this.saveMeeting.setVisible(true);
						this.deleteAppointment.setVisible(false);
						this.checkNames.setVisible(true);
						this.inviteAttendees.setVisible(false);
						this.cancelInvitation.setVisible(true);
						this.meetingrequestbuttons.setVisible(false);
						break;
					case Zarafa.core.mapi.MeetingStatus.MEETING_RECEIVED:
					case Zarafa.core.mapi.MeetingStatus.MEETING_CANCELED:
					case Zarafa.core.mapi.MeetingStatus.MEETING_RECEIVED_AND_CANCELED:
						this.sendInvitation.setVisible(false);
						this.saveAppointment.setVisible(false);
						this.saveMeeting.setVisible(false);
						this.deleteAppointment.setVisible(true);
						this.checkNames.setVisible(false);
						this.inviteAttendees.setVisible(false);
						this.cancelInvitation.setVisible(false);
						// Show buttongroup only if it has buttons.
						this.meetingrequestbuttons.setVisible(this.meetingrequestbuttons.hasVisibleButtons());
						break;
				}

				layout = true;
			}

			if (contentReset === true || record.isModifiedSinceLastUpdate('importance')) {
				switch (record.get('importance')) {
				case Zarafa.core.mapi.Importance.URGENT:
					this.highPriority.toggle(true, true);
					break;
				case Zarafa.core.mapi.Importance.NONURGENT:
					this.lowPriority.toggle(true, true);
					break;
				default:
					break;
				}
			}

			if (contentReset === true || record.isModifiedSinceLastUpdate('private')) {
				this.setPrivate.toggle(record.get('private'), true);
			}
		}

		// FIXME: Remove after WA-4880 is implemented
		if (contentReset === true) {
			if (record.isRecurringOccurence()) {
				this.occurenceAttachmentsButton.setVisible(true);
				this.normalAttachmentsButton.setVisible(false);
			} else {
				this.occurenceAttachmentsButton.setVisible(false);
				this.normalAttachmentsButton.setVisible(true);
			}

			layout = true;
		}

		if (layout === true) {
			this.doLayout();
		}
	}
});

Ext.reg('zarafa.appointmenttoolbar', Zarafa.calendar.dialogs.AppointmentToolbar);
