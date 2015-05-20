Ext.namespace('Zarafa.common');

/**
 * @class Zarafa.common.Actions
 * Common actions which can be used within {@link Ext.Button buttons}
 * or other {@link Ext.Component components} with action handlers.
 * @singleton
 */
Zarafa.common.Actions = {
	/**
	 * The internal 'iframe' which is hidden from the user, which is used for downloading
	 * attachments. See {@link #doOpen}.
	 * @property
	 * @type Ext.Element
	 */
	downloadFrame : undefined,	
	/**
	 * Open a {@link Zarafa.common.dialogs.CopyMoveContentPanel CopyMoveContentPanel} for
	 * copying or moving {@link Zarafa.core.data.IPMRecord records} to the
	 * preferred destination folder.
	 *
	 * @param {Zarafa.core.data.IPMRecord} records The record which must be copied or moved.
	 * @param {Object} config (optional) Configuration object to create the ContentPanel
	 */
	openCopyMoveContent : function(records, config)
	{
		config = Ext.applyIf(config || {}, {
			modal : true
		});
		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.copymoverecords'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, records, config);
	},

	/**
	 * Opens a {@link Zarafa.common.recurrence.dialogs.RecurrenceContentPanel RecurrenceContentPanel} for configuring
	 * the recurrence of the given {@link Zarafa.core.data.IPMRecord record}.
	 *
	 * @param {Zarafa.core.data.IPMRecord} records The record for which the recurrence must be configured.
	 * @param {Object} config Configuration object 
	 */
	openRecurrenceContent : function(records, config)
	{
		if (Ext.isArray(records) && !Ext.isEmpty(records)) {
			records = records[0];
		}

		config = Ext.applyIf(config || {}, {
			autoSave : true,
			modal : true
		});

		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.recurrence'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, records, config);
	},

	/**
	 * Opens a {@link Zarafa.common.categories.dialogs.CategoriesContentPanel CategoriesContentPanel} for configuring
	 * the categories of the given {@link Zarafa.core.data.IPMRecord records}.
	 *
	 * @param {Zarafa.core.data.IPMRecord} records The record, or records for which the categories
	 * must be configured
	 * @param {Object} config (optional) Configuration object for creating the ContentPanel
	 */
	openCategoriesContent : function(records, config)
	{
		if (!Ext.isArray(records)) {
			records = [ records ];
		}

		config = Ext.applyIf(config || {}, {
			autoSave : true,
			modal : true
		});
		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.categories'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, records, config);
	},

	/**
	 * Opens a {@link Zarafa.common.attachment.dialogs.LegacyFileSelectionContentPanel File Selection Content Panel}
	 * which is needed for Browsers which do not support the {@link Zarafa#supportsFilesAPI Files API} and need
	 * a valid {@link Ext.form.FormPanel form} with a {@link Ext.ux.form.FileUploadField Upload field} in order
	 * to be able to upload the files to the server.
	 *
	 * @param {Object} config (optional) Configuration object for creating the ContentPanel
	 */
	openLegacyFileSelectionContent : function(config)
	{
		config = Ext.applyIf(config || {}, {
			modal : true
		});
		
		var componentType = Zarafa.core.data.SharedComponentType['common.attachment.dialog.legacyfileselection'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},

	/**
	 * Opens a {@link Zarafa.common.attachment.dialogs.AttachItemContentPanel Attach Item Content Panel} which is used
	 * to attach an item as embedded attachment to a message.
	 *
	 * @param {Zarafa.core.data.MAPIRecord} record record that will be used to add embedded attachment
	 * @param {Object} config (optional) Configuration object for creating the ContentPanel
	 */
	openAttachItemSelectionContent : function(record, config)
	{
		config = Ext.applyIf(config || {}, {
			modal : true
		});
		
		var componentType = Zarafa.core.data.SharedComponentType['common.attachment.dialog.attachitem'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, record, config);
	},

	/**
	 * Opens a {@link Zarafa.core.ui.widget.WidgetContentPanel}
	 * for inserting widgets into the {@link Zarafa.core.ui.widget.WidgetPanel}
	 * @param {Object} config (optional) Configuration object for creating the ContentPanel
	 */
	openWidgetsContent : function(config)
	{
		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.widgets'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},
	
	/**
	 * Will open the View ContentPanel for a recipient, before opening the recipient it will
	 * first check the exact type of the recipient to see if it is an AddressBook item
	 * or personal contact. If either of those two the record is converted to assure the
	 * correct panel is opened.
	 * @param {Zarafa.core.data.IPMRecipientRecord} recipient The recipient which must be opened
	 * @param {Object} config configuration object.
	 */
	openViewRecipientContent : function(recipient, config)
	{
		if (recipient.isResolved()) {
			if (recipient.isPersonalContact()) {
				// A personal contact needs to be converted to a contact so the correct panel can be shown.
				recipient = recipient.convertToContactRecord();
				// FIXME: We put the abRecord into the ShadowStore to be able
				// to open it, and obtain all details. However, we also need to
				// find a point where we can remove it again.
				container.getShadowStore().add(recipient);
			} else if (recipient.isPersonalDistList()) {
				// A personal distlist needs to be converted to a distlist so the correct dialog can be shown.
				recipient = recipient.convertToDistListRecord();
				// FIXME: We put the abRecord into the ShadowStore to be able
				// to open it, and obtain all details. However, we also need to
				// find a point where we can remove it again.
				container.getShadowStore().add(recipient);
			} else if (!recipient.isOneOff()) {
				// A addressbook item needs to be converted to a AddressBook record so the correct dialog is shown.
				recipient = recipient.convertToABRecord();
				// FIXME: We put the abRecord into the ShadowStore to be able
				// to open it, and obtain all details. However, we also need to
				// find a point where we can remove it again.
				container.getShadowStore().add(recipient);
			}
			
			config = Ext.applyIf(config || {}, { manager : Ext.WindowMgr });
			Zarafa.core.data.UIFactory.openViewRecord(recipient, config);
		}
	},

	/**
	 * Opens a {@link Zarafa.common.delegates.dialogs.DelegatePermissionContentPanel DelegatePermissionContentPanel} for editing
	 * delegate permissions of a single delegate
	 * @param {Zarafa.common.delegates.data.DelegateRecord} delegateRecord record that should be opened in
	 * {@link Zarafa.common.delegates.dialogs.DelegatePermissionContentPanel DelegatePermissionContentPanel}.
	 * @param {Object} config configuration object that should be passed to {@link Zarafa.common.delegates.dialogs.DelegatePermissionContentPanel DelegatePermissionContentPanel}.
	 */
	openDelegatePermissionContent : function(record, config)
	{
		if(!record) {
			// can not continue without a record
			return;
		}

		config = config || {};
		Ext.apply(config, {
			modal : true
		});

		Zarafa.core.data.UIFactory.openCreateRecord(record, config);
	},

 	/**
	 * Opens a {@link @link Zarafa.common.sendas.dialogs.SendAsEditContentPanel SendAsEditContentPanel} for editing
	 * user name and email address of a sendAs.
	 * @param {Ext.data.Record} record record that should be opened in
	 * {@link Zarafa.common.sendas.dialogs.SendAsEditContentPanel SendAsEditContentPanel}.
	 * @param {Object} config configuration object that should be passed to {@link Zarafa.common.sendas.dialogs.SendAsEditContentPanel SendAsEditContentPanel}.
	 */
	openSendAsRecipientContent : function(record, config)
	{
		if(!record) {
			// can not continue without a record
			return;
		}
		var componentType = Zarafa.core.data.SharedComponentType['common.sendas.dialog.sendaseditcontentpanel'];

		config = config || {};
		Ext.apply(config, {
			modal : true
		});

		Zarafa.core.data.UIFactory.openLayerComponent(componentType, record, config);
	},

	/**
	 * Opens a {@link Zarafa.common.rules.dialogs.RulesEditContentPanel RulesEditContentPanel} for editing
	 * a single {@link Zarafa.common.rules.data.RulesRecord RulesRecord}.
	 * @param {Zarafa.common.rules.data.RulesRecord} record record to edit in
	 * {@link Zarafa.common.rules.dialogs.RulesEditContentPanel RulesEditContentPanel}.
	 * @param {Object} config config object that will be passed to {@link Zarafa.core.data.UIFactoryLayer UIFactoryLayer}.
	 */
	openRulesEditContent : function(record, config)
	{
		if(!record) {
			// can not continue without a record
			return;
		}

		config = Ext.apply(config || {}, {
			modal : true
		})

		Zarafa.core.data.UIFactory.openCreateRecord(record, config);
	},

	/**
	 * Will create an object of {@link Zarafa.common.attachment.ui.AttachmentDownloader AttachmentDownloader}
	 * and call {@link Zarafa.common.attachment.ui.AttachmentDownloader#downloadMessage} method to start download the message as file
	 * by setting the dialogFrame's location to the download URL of the given {@link Zarafa.core.data.IPMRecord records}.
	 * @param {Zarafa.core.data.IPMRecord} records The record, or records which user want to save as file.
	 */
	openSaveEmlDialog : function(records)
	{
		records = [].concat(records);

		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			var downloadComponent = new Zarafa.common.attachment.ui.AttachmentDownloader();
			downloadComponent.downloadMessage(record.getDownloadMessageUrl());
		}
	},

	/**
	 * Opens a PrintDialog for printing the contents of the given {@link Zarafa.core.data.IPMRecord records}.
	 *
	 * @param {Zarafa.core.data.IPMRecord} records The record, or records for which the print will be displayed.
	 * @param {Object} config (optional) Configuration object
	 */
	openPrintDialog: function(records, config)
	{
		if (Ext.isEmpty(records)) {
			return;
		} else if (Ext.isArray(records)) {
			if (records.length > 1) {
				Ext.MessageBox.alert(_('Print'), _('Printing of multiple items has not been implemented.'));
				return;
			} else {
				// We only need the first record
				records = records[0];
			}
		}

		var openHandler = function (store, record) {
			if (store) {
				if (this !== record) {
					return;
				}
				store.un('open', openHandler, record);
			}

			var componentType = Zarafa.core.data.SharedComponentType['common.printer.renderer'];
			var component = container.getSharedComponent(componentType, record);
			if (component) {
				var renderer = new component();
				renderer.print(record);
			} else  {
				if (record instanceof Zarafa.core.data.MAPIRecord) {
					Ext.MessageBox.alert(_('Print'), _('Printing of this item is not yet available') + '\n' + _('Item type: ') + record.get('message_class'));
				} else {
					Ext.MessageBox.alert(_('Print'), _('Printing of this view is not yet available'));
				}
			}
		};

		if (records instanceof Zarafa.core.data.MAPIRecord && !records.isOpened()) {
			records.getStore().on('open', openHandler, records);
			records.open();
		} else {
			openHandler(undefined, records);
		}
	},

	/**
	 * Opens a {@link Zarafa.common.checknames.dialogs.CheckNamesContentPanel CheckNamesContentPanel}
	 *
	 * @param {Array} array of checkNames
	 * @param {Zarafa.core.data.IPMRecipientRecord} recipientrecord
	 * @param {Object} config (optional) Configuration object for creating the content panel
	 */
	openCheckNamesContent : function(checkNamesData, recipientRecord, config)
	{
		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.checknames'];
		config = Ext.applyIf(config || {}, {
			checkNamesData : checkNamesData,
			modal: true
		});
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, recipientRecord, config);
	},

	/**
	 * Opens a {@link Zarafa.common.reminder.dialogs.ReminderContentPanel remindercontentpanel}
	 * @param {Zarafa.common.reminder.ReminderRecord} records Records for which the reminder content panel will be displayed.
	 * @param {Object} config (optional) Configuration object
	 */
	openReminderContent : function(records, config)
	{
		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.reminder'];
		var component = container.getSharedComponent(componentType, records);

		config = Ext.applyIf(config || {}, {
			modal : false,
			manager : Ext.WindowMgr
		});
		
		// check if panel is already open
		var contentPanelInstances = Zarafa.core.data.ContentPanelMgr.getContentPanelInstances(component);

		// there can be no reminder dialog or only one reminder dialog
		// multiple reminder dialogs are not allowed
		if(contentPanelInstances.getCount() === 0) {
			// create a new reminder dialog, if there are any reminders to show
			if(records.length > 0) {
				Zarafa.core.data.UIFactory.openLayerComponent(componentType, records, config);
			}
		} else if (contentPanelInstances.getCount() === 1) {
			// we already have a reminder dialog open, use it
			var reminderDialog = contentPanelInstances.first();

			if(records.length > 0) {
				// there are reminders to show, so give focus to existing reminder dialog
				reminderDialog.focus();
			} else {
				// no reminders to show, close existing dialog
				reminderDialog.close();
			}
		}
	},

	/**
	 * Function will first convert the {@link Zarafa.common.reminder.ReminderRecord ReminderRecord} to an
	 * {@link Zarafa.core.data.IPMRecord IPMRecord} based on its message_class property and then pass that
	 * {@link Zarafa.core.data.IPMRecord IPMRecord} to {@link Zarafa.core.ui.ContentPanel ContentPanel} to open it.
	 * @param {Zarafa.common.reminder.data.ReminderRecord|Zarafa.common.reminder.data.ReminderRecord[]} record
	 * The reminder record/records which should be opened.
	 * @param {Object} config configuration object.
	 */
	openReminderRecord: function(record, config)
	{
		config = config || {};

		if(Ext.isArray(record)){
			Ext.each(record, this.openReminderRecord, this);
			return;
		}

		// convert reminder record to proper ipmrecord
		record = record.convertToIPMRecord();

		// we will always open the record into a dialog because reminders are also displayed in a dialog
		Ext.applyIf(config, {
			manager : Ext.WindowMgr
		});

		if(record) {
			Zarafa.core.data.UIFactory.openViewRecord(record, config);
		}
	},

	/**
	 * Opens a {@link Zarafa.common.dialogs.MessageBox.select MessageBox} for
	 * selecting if either a recurrence or the entire series must be opened for the Recurring
	 * Message.
	 *
	 * @param {Function} handler The handler which is invoked with the selected value
	 * from the dialog. This function only takes one argument and is either 'recurrence_occurence'
	 * when the single-occurence was selected or 'recurrence_series' when the series was selected.
	 * @param {Object} scope (optional) The scope on which the handler must be invoked.
	 */
	// TODO: Merge with deleteRecurringSelectionContentPanel
	openRecurringSelectionContent : function(record, handler, scope)
	{
		var title = _('Recurring Message');
		var text =  _('This is a recurring message. Do you want to open only this occurrence or the series?');

		if (record.isMessageClass('IPM.Appointment', true)) {
			if (record.get('meeting') == Zarafa.core.mapi.MeetingStatus.NONMEETING) {
				title = _('Recurring Appointment');
				text =  _('This is a recurring appointment. Do you want to open only this occurrence or the series?');
			} else {
				title = _('Recurring Meeting Request');
				text =  _('This is a recurring meeting request. Do you want to open only this occurrence or the series?');
			}
		} else if (record.isMessageClass('IPM.TaskRequest', true)) {
			title = _('Recurring Task Request');
			text =  _('This is a recurring task request. Do you want to open only this occurrence or the series?');
		}

		Zarafa.common.dialogs.MessageBox.select(
			title, text, handler, scope, [{
				boxLabel: _('Open this occurrence'),
				id : 'recurrence_occurence',
				name: 'select',
				checked: true
			},{
				boxLabel: _('Open the series'),
				id : 'recurrence_series',
				name: 'select'
			}]
		);
	},

	/**
	 * Opens a {@link Zarafa.common.dialogs.MessageBox.select MessageBox} for
	 * selecting if either a recurrence or the entire series must be deleted.
	 *
	 * @param {Function} handler The handler which is invoked with the selected value
	 * from the dialog. This function only takes one argument and is either 'recurrence_occurence'
	 * when the single-occurence was selected or 'recurrence_series' when the series was selected.
	 * @param {Object} scope (optional) The scope on which the handler must be invoked.
	 */
	// TODO: Merge with openRecurringSelectionContentPanel
	deleteRecurringSelectionContent : function(record, handler, scope)
	{
		var title = _('Recurring Message');
		var text =  _('This is a recurring message. Do you want to delete only this occurrence or the series?');

		if (record.isMessageClass('IPM.Appointment', true)) {
			if (record.get('meeting') == Zarafa.core.mapi.MeetingStatus.NONMEETING) {
				title = _('Recurring Appointment');
				text =  _('This is a recurring appointment. Do you want to delete only this occurrence or the series?');
			} else {
				title = _('Recurring Meeting Request');
				text =  _('This is a recurring meeting request. Do you want to delete only this occurrence or the series?');
			}
		} else if (record.isMessageClass('IPM.TaskRequest', true)) {
			title = _('Recurring Task Request');
			text =  _('This is a recurring task request. Do you want to delete only this occurrence or the series?');
		}

		Zarafa.common.dialogs.MessageBox.select(
			title, text, handler, scope, [{
				boxLabel: _('Delete this occurrence'),
				id : 'recurrence_occurence',
				name: 'select',
				checked: true
			},{
				boxLabel: _('Delete the series'),
				id : 'recurrence_series',
				name: 'select'
			}]
		);
	},

	/**
	 * Opens a {@link Zarafa.common.dialogs.MessageBox.select MessageBox} for
	 * selecting if either a update need to be send to meeting Organizer or silently deleted items.
	 *
	 * @param {Function} handler The handler which is invoked with the selected value
	 * from the dialog. This function only takes one argument and is either 'sendResponseOnDelete'
	 * when the delete and response was selected or 'onResponseOnDelete' when the delete without response was selected.
	 * @param {Object} scope (optional) The scope on which the handler must be invoked.
	 */
	// TODO: may be Merge with deleteRecurringSelectionContentPanel
	deleteMeetingRequestConfirmationContent : function(record, handler, scope)
	{
		var title = _('Confirm Delete');
		var acceptedText = _('This "{0}" meeting was already accepted.');
		var noResponsedText = _('You have not responded to the meeting request "{0}".');
		
		if(record.get('responsestatus') == Zarafa.core.mapi.ResponseStatus.RESPONSE_NOT_RESPONDED){
			var text = String.format(noResponsedText, record.get('subject'));
		}else{
			var text = String.format(acceptedText, record.get('subject'));
		}

		Zarafa.common.dialogs.MessageBox.select(
			title, text, handler, scope, [{
				boxLabel: _('Delete and send a response to the meeting organizer'),
				id : 'sendResponseOnDelete',
				name: 'select',
				checked: true
			},{
				boxLabel: _('Delete without sending'),
				id : 'noResponseOnDelete',
				name: 'select'
			}]
		);
	},

	/**
	 * Deletes all {@link Zarafa.core.data.IPMRecord records} from the {@link Zarafa.core.data.IPMStore store}.
	 * If any of the given {@link Zarafa.core.data.IPMRecord records} is an recurring item, then
	 * an {@link Zarafa.common.dialogs.MessageBox.select MessageBox} will be prompted which lets the user
	 * select between the series or the single occurence.
	 * All given {@link Zarafa.core.data.IPMRecord records} must be located in the same
	 * {@link Zarafa.core.data.IPMStore store}.
	 *
	 * @param {Array} records The array of records which must be deleted.
	 * @param {Boolean} askOcc (private) False to prevent a dialog to appear to ask if the occurence or series must
	 * be deleted
	 *
	 * FIXME: This introduces Calendar-specific actions into the Common Context, but there is no clean solution
	 * for this at this time. But we need to split this up into context-specific actions while maintaining this
	 * single-entrypoint for deleting records.
	 */
	deleteRecords : function(records, askOcc)
	{
		var store = undefined;
		var saveRecords = [];

		if (Ext.isEmpty(records)) {
			return;
		}

		if (!Ext.isArray(records)) {
			records = [ records ];
		}

		for (var i = 0, len = records.length; i < len; i++) {
			var record = records[i];
			store = record.getStore();

			// Check if the item is recurring, and if we need to ask the user
			// if the occurence or series must be deleted
			var deleteRecurring = Ext.isFunction(record.isRecurringOccurence) && record.isRecurringOccurence() && askOcc !== false;

			// Meeting and task requests are always deleted as normal, 
			// we don't care for the recurring state of the record.
			var messageClass = record.get('message_class');
			if (Zarafa.core.MessageClass.isClass(messageClass, 'IPM.Schedule.Meeting', true) ||
				Zarafa.core.MessageClass.isClass(messageClass, 'IPM.TaskRequest', true)) {
					deleteRecurring = false;
			}

			if (deleteRecurring) {
				// Deleting an recurring series requires a confirmation dialog.
				this.deleteRecurringItem(record);
			} else if (Ext.isFunction(record.isMeeting) && record.isMeeting() && !record.isAppointmentInPast() && !record.isMeetingCanceled()) {
				// delete action on future meeting items
				if (record.isMeetingSent()) {
					// We are the organizer of the meeting, so lets ask if the recipients should be notified.
					Ext.MessageBox.show({
						title: _('Zarafa WebApp'),
						msg : _('A cancellation message will be sent to all recipients, do you wish to continue?'),
						icon: Ext.MessageBox.WARNING,
						fn: this.cancelInvitation,
						scope: record,
						buttons: Ext.MessageBox.YESNO
					});
				} else if (record.isMeetingResponseRequired()) {
					// We are the attendee of the meeting, lets ask if we should inform the organizer
					Zarafa.common.Actions.deleteMeetingRequestConfirmationContent(record, this.declineInvitation, record);
				} else {
					// We are neither, we don't care, just delete the thing
					store.remove(record);
					saveRecords.push(record);
				}
			} else {
				// normal delete action
				store.remove(record);
				saveRecords.push(record);
			}
		}

		if(!Ext.isEmpty(saveRecords)) {
			store.save(saveRecords);
		}
	},

	/**
	 * Function which prompt user with deleting for recurring Meeting or normal recurring 
	 * appointment and also manages sending response to meeting organizer.
	 * 
	 * @param {Ext.data.Record} record that must be deleted
	 * @private
	 */
	deleteRecurringItem : function(record){
		Zarafa.common.Actions.deleteRecurringSelectionContent(record, function(button, radio) {
			if (button != 'ok') {
				return;
			}

			if (radio.id != 'recurrence_series') {
				record = record.convertToOccurenceRecord();
			} else {
				record = record.convertToSeriesRecord();
			}
			container.getShadowStore().add(record);

			Zarafa.common.Actions.deleteRecords(record, false);
		}, this);
	},

	/**
	 * Function cancels Meeting invitation and sends Meeting Cancellation message.
	 * 
	 * @param {String} buttonClicked The ID of the button pressed,
	 * @param {String} text Value of the input field, not useful here
	 * @private
	 */
	cancelInvitation : function(buttonClicked, text)
	{
		if (buttonClicked == 'yes') {
			// Here scope is record so this refers to Appointment Record.
			this.cancelInvitation();
		}
	},

	/**
	 * Function declines a Meeting invitation and sends Meeting Decline message.
	 * 
	 * @param {String} buttonClicked The ID of the button pressed,
	 * here, one of: ok cancel.
	 * @param {Ext.form.Radio} radio The Radio which was selected by the user.
	 * @private
	 */
	declineInvitation : function(buttonClicked, radio)
	{
		if (buttonClicked == 'ok') {
			// Here scope is record so this refers to Appointment Record.
			var sendUpdateFlag = (radio.id == 'sendResponseOnDelete') ? true: false;
			this.declineMeeting(sendUpdateFlag);
		}
	},

	/**
	 * Opens a {@link Zarafa.common.restore.ui.RestoreContentPanel restoreContentPanel}
	 *
	 * @param {Zarafa.hierarchy.data.MAPIFolderRecord} folder folder that is loaded for the new context
	 * @param {Object} config (optional) Configuration object for creating the content panel
	 */
	openRestoreContent : function(folder, config)
	{
		var componentType = Zarafa.core.data.SharedComponentType['common.dialog.restoreitems'];
		config = Ext.applyIf(config || {}, {
			folder : folder
		});
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},

	/**
	 * Opens a {@link Zarafa.addressbook.dialogs.ABUserSelectionContentPanel ABUserSelectionContentPanel}
	 *
	 * @param {Object} config Configuration object. For AB this normally includes:
	 * 	callback - Callback function to be called with the user selected in the ContentPanel
	 * 	hierarchyRestriction - Restriction that has to be applied on the hierarchy of the Addressbook
	 * 	listRestriction - Restriction that has to be applied on the contents of the Addressbook
	 */
	openABUserSelectionContent : function(config)
	{
		var componentType = Zarafa.core.data.SharedComponentType['addressbook.dialog.abuserselection'];
		config = Ext.applyIf(config || {}, {
			modal : true
		});

		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},

	/**
	 * Opens a {@link Zarafa.addressbook.dialog.ABMultiUserSelectionContentPanel ABMultiUserSelectionContentPanel}
	 *
	 * @param {Object} config Configuration object for the dialog
	 */
	openABUserMultiSelectionContent : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			modal : true,
			convert : function(user) { return user; }
		});

		var componentType = Zarafa.core.data.SharedComponentType['addressbook.dialog.abmultiuserselection'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},

	/**
	 * Mark the given messages as read or unread. When a read receipt was requested
	 * for this message, the setttings are consulted to see if we must automatically
	 * send the receipt or not, or if we should ask the user.
	 *
	 * @param {Zarafa.core.data.IPMRecord/Array} records The record or records which must
	 * be marked as read.
	 * @param {Boolean} read (optional) False to mark the messages as unread, otherwise
	 * the message will be marked as read.
	 */
	markAsRead : function(records, read)
	{
		records = !Ext.isArray(records) ? [ records ] : records;
		read = !Ext.isDefined(read) ? true : read;

		var saveRecords = [];

		for (var i = 0, len = records.length; i < len; i++) {
			var record = records[i];

			// If the read status already matches the desired state,
			// we don't need to do anything.
			if (read !== record.isRead()) {
				if (read === true && record.needsReadReceipt()) {
					switch (container.getSettingsModel().get('zarafa/v1/contexts/mail/readreceipt_handling')) {
						case 'never':
							record.setReadFlags(read);
							// Never send a read receipt.
							record.addMessageAction('send_read_receipt', false);

							saveRecords.push(record);
							break;
						case 'always':
							record.setReadFlags(read);
							// Always send a read receipt.
							record.addMessageAction('send_read_receipt', true);

							saveRecords.push(record);
							break;
						case 'ask':
						default:
							// Ask if a read receipt must be send.
							Ext.MessageBox.confirm(_('Zarafa WebApp'), _('The sender of this message has asked to be notified when you read this message. Do you wish to notify the sender?'),
								// This function will execute when user provide some inputs,
								// So other external changes should not affect the record.
								function(buttonClicked) {
									record.setReadFlags(read);
									record.addMessageAction('send_read_receipt', buttonClicked !== 'no');
									record.save();
								}, this);
							break;
						
					}
				} else {
					record.setReadFlags(read);
					saveRecords.push(record);
				}
			}
		}

		if (!Ext.isEmpty(saveRecords)) {
			saveRecords[0].store.save(saveRecords);
		}
	},
	/**
	 * Will start the download by setting the dialogFrame's location to the download URL of the file.
	 * 
	 * @param {Zarafa.core.data.IPMAttachmentRecord} records The record of the file to be downloaded
	 */
	downloadAttachment : function(record)
	{
		//TODO: allow downloading multiple files
		if(!this.downloadFrame){
			this.downloadFrame = Ext.getBody().createChild({
				tag: 'iframe',
				cls: 'x-hidden'
			});
		}
		var url = record.getAttachmentUrl();
		this.downloadFrame.dom.contentWindow.location = url;
	},

	/**
	 * Opens a {@link Zarafa.common.rules.dialogs.RulesWordsEditContentPanel}
	 *
	 * @param {Object} config Configuration object for the dialog
	 */
	openRulesWordsEditContent : function(config)
	{
		var componentType = Zarafa.core.data.SharedComponentType['common.rules.dialog.ruleswordsedit'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},

	/**
	 * Function is used to download attachments, for embedded message attachments additionally it will
	 * convert the {@link Zarafa.core.data.IPMAttachmentRecord IPMAttachmentRecord} to {@link Zarafa.core.data.IPMRecord IPMRecord}
	 * and then will pass it to {@link Zarafa.core.ui.ContentPanel ContentPanel} to open it.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record The attachment record which should be opened.
	 * @param {Object} config configuration object.
	 */
	openAttachmentRecord: function(record, config)
	{
		if(record.isEmbeddedMessage()) {
			// if we are going to open embedded message then we need to first convert it into mail record
			record = record.convertToIPMRecord();
		}

		if(record) {
			Zarafa.core.data.UIFactory.openViewRecord(record, config);
		}
	}
};
