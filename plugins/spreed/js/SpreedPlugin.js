Ext.namespace('Zarafa.plugins.spreed');

/**
 * @class Zarafa.plugins.spreed.SpreedPlugin
 * @extends Zarafa.core.Plugin
 *
 * This class integrates Spreed plugin in existing system.
 * It allows user to setup spreed web meeting settings.
 */
Zarafa.plugins.spreed.SpreedPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Contains link to the spreedStore class
	 * initialized once when plugin is created.
	 *
	 * @property
	 * @type Object
	 * @private
	 */
	spreedStore : null,

	/**
	 * Unique id which works instead entryid
	 * for SpreedRecord.
	 *
	 * @property
	 * @type Integer
	 * @private
	 */
	sequenceId : 0,

	/**
	 * Called after constructor.
	 * Registers insertion points in Preview Panel, New Items drop-down and dialogs toolbars.
	 * Initialize SpreedStore property in plugin.
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.spreed.SpreedPlugin.superclass.initPlugin.apply(this, arguments);

		this.spreedStore = new Zarafa.plugins.spreed.data.SpreedStore();

		//After record save the check in url will be returned and put in the record checkin_url field.
		this.spreedStore.on('write', this.onStoreWrite);

		this.registerInsertionPoint('main.maintoolbar.new.item', this.createNewSpreedButton, this);
		this.registerInsertionPoint('previewpanel.toolbar.right', this.createNewSpreedFromPreviewButton, this);
		this.registerInsertionPoint(/context\.mail\.(.*?)\.toolbar\.options/, this.createNewSpreedFromPreviewButton, this);
		this.registerInsertionPoint('context.mail.contextmenu.options', this.createNewSpreedFromMailButton, this);
		this.registerInsertionPoint('context.addressbook.contextmenu.actions', this.createNewSpreedFromAddressbookButton, this);
		this.registerInsertionPoint('context.contact.contextmenu.options',this.createNewSpreedFromAddressbookButton, this);
	},

	/**
	 * New button in main toolbar in Items->New menu. newMenuIndex is equal to 10, to make sure
	 * that spreed meeting button will be the last one always.
	 *
	 * @return {Ext.Button} Button instance
	 * @private
	 */
	createNewSpreedButton : function()
	{
		return  [{
			newMenuIndex : 10,
			xtype : 'menuitem',
			text : _('Spreed Meeting'),
			overflowText : _('Spreed meeting'),
			iconCls : 'icon_spreed_setup_top_menu',
			handler : this.createNewSpreedMeeting,
			scope : this
		}];
	},

	/**
	 * Create a button in ContextMenu from where an existing mail is selected,
	 * and we need to copy all information from the selected mails when the button is
	 * clicked.
	 * @return {Ext.Button} Button instance
	 * @private
	 */
	createNewSpreedFromPreviewButton : function()
	{
		return {
			xtype : 'button',
			tooltip : _('Spreed Meeting'),
			overflowText : _('Spreed meeting'),
			iconCls : 'icon_spreed_setup_mail_context_menu',
			handler : this.createNewSpreedMeetingFromSelection,
			scope : this,
			plugins : ['zarafa.recordcomponentupdaterplugin'],
			update : function(record, contentReset) {
				this.record = record;
			}
		};
	},

	/**
	 * Create a button in ContextMenu from where an existing mail is selected,
	 * and we need to copy all information from the selected mails when the button is
	 * clicked.
	 * @return {Ext.Button} Button instance
	 * @private
	 */
	createNewSpreedFromMailButton : function()
	{
		return {
			xtype : 'zarafa.conditionalitem',
			text : _('Spreed Meeting'),
			iconCls : 'icon_spreed_setup_mail_context_menu',
			handler : this.createNewSpreedMeetingFromSelection,
			scope : this
		};
	},

	/**
	 * Create a button in Contextmenu of the Address Book or Contact. This will convert the
	 * selected Address Book user to a Spreed participant.
	 *
	 * @return {Ext.Button} Button instance
	 * @private
	 */
	createNewSpreedFromAddressbookButton : function()
	{
		return {
			xtype : 'zarafa.conditionalitem',
			text : _('Spreed meeting'),
			iconCls : 'icon_spreed_setup_ab_context_menu',
			handler : this.createNewSpreedMeetingFromAddressbook,
			scope : this,
			beforeShow : this.onSpreedButtonBeforeShow.createDelegate(this)
		};
	},

	/**
	 * Event handler which is fired when the button from {@link #createNewSpreedFromAddressbookButton}
	 * is about to be shown. This will check if the button should be {@link #isSpreedButtonVisible visible}
	 * depending on the records applied to the button.
	 * @param {Ext.Button} item The item which is about to be shown
	 * @param {Ext.data.Record[]} records The records attached to the button
	 * @private
	 */
	onSpreedButtonBeforeShow : function(item, records)
	{
		var visible = false;

		for (var i = 0, len = records.length; i < len; i++) {
			var record = records[i];

			if (this.isSpreedButtonVisible(record)) {
				visible = true;
				break;
			}
		}

		item.setVisible(visible);
	},

	/**
	 * Check if the given record (which represents a Contact or Distribution list
	 * can be mailed (this requires the record not to be a {@link Ext.data.Record#phantom}
	 * and the Contact should {@link Zarafa.contact.ContactRecord#hasEmailAddress have an email address}.
	 * @param {Zarafa.core.data.MAPIRecord} record The record to check
	 * @return {Boolean} True if we can send an email to this contact/distlist
	 * @private
	 */
	isSpreedButtonVisible : function(record)
	{
		if (record.phantom) {
			return false;
		} else if (record instanceof Zarafa.core.data.IPMRecord) {
			if (record.isMessageClass('IPM.Contact')) {
				if (!record.hasEmailAddress()) {
					return false;
				}
			} else if (record.isMessageClass('IPM.Distlist')) {
				return false;
			}
		} else if (record.get('object_type') !== Zarafa.core.mapi.ObjectType.MAPI_MAILUSER) {
			return false;
		}

		return true;
	},

	/**
	 * Event handler for creating a new {@link Zarafa.plugins.spreed.data.SpreedRecord Spreed Meeting}.
	 * This will create a blank Spreed Meeting, and open the {@link Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel Spreed ContentPanel}.
	 *
	 * @param {Ext.Button} btn The button which was clicked
	 * @private
	 */
	createNewSpreedMeeting : function(btn)
	{
		var record = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, { id : ++this.sequenceId });
		this.spreedStore.add(record);

		this.openSpreedDialog(record);
	},

	/**
	 * Event handler for creating a new {@link Zarafa.plugins.spreed.data.SpreedRecord Spreed Meeting} based
	 * on the selection of one or more {@link Zarafa.mail.MailRecord E-mails}. This will create a new
	 * Spreed Meeting where all the selected E-mails will be {@link #mergeMailToSpreed merged into}.
	 * The spreed meeting will then be opened in the {@link Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel Spreed ContentPanel}.
	 *
	 * @param {Ext.Button} btn The button which was clicked
	 * @private
	 */
	createNewSpreedMeetingFromSelection : function(btn)
	{
		var record = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, { id : ++this.sequenceId });
		this.spreedStore.add(record);
		var tasks = [];
		var mails = [];

		if (btn instanceof Ext.Button) {
			mails = [ btn.record ];
		} else if (btn instanceof Ext.menu.Item) {
			mails = btn.getRecords();
		}

		var partialMerge = mails.length > 1;

		for (var i = 0, len = mails.length; i < len; i++) {
			var mail = mails[i];

			// Check if the mail was already opened, if so we can
			// merge the mail to Spreed directly, otherwise the
			// mail needs to be opened first.
			if (mail.isOpened()) {
				this.mergeMailToSpreed(record, mail, partialMerge);
			} else {
				tasks.push({
					/*
					 * By encapsulating the task function it is possible to get the contact object 
					 * into the scope of the task function. When you add more tasks the contact 
					 * reference changes and without this encapsulation it will change the contact in
					 * all the previously added task functions as well.
					 */
					fn : function() {
						// This mailRecord becomes a private variable, not changable outside.
						var mailRecord = mail;
						return function(panel, spreedRecord, task, callback) {
							var fn = function(store, record) {
								if (record === mailRecord) {
									store.un('open', fn, task);
									this.scope.mergeMailToSpreed(spreedRecord, mailRecord, partialMerge);
									callback();
								}
							};

							mailRecord.getStore().on('open', fn, task);
							mailRecord.open();
						};
					// This triggers the encapsulation and returns the task function
					}(),
					scope : this
				});
			}
		}

		this.openSpreedDialog(record, {
			recordComponentPluginConfig : {
				loadTasks : tasks
			}
		});
	},

	/**
	 * Event handler for creating a new {@link Zarafa.plugins.spreed.data.SpreedRecord Spreed Meeting} based
	 * on the selection of one or more {@link Zarafa.contact.ContactRecord Contacts} or
	 * {@link Zarafa.addressbook.AddressbookRecord AB Users}. This will create a new
	 * Spreed Meeting where all the selected Contacts and users will be {@link #convertAddressbookUserToParticipant converted to participants}.
	 * The spreed meeting will then be opened in the {@link Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel Spreed ContentPanel}.
	 *
	 * @param {Ext.Button} btn The button which was clicked
	 * @private
	 */
	createNewSpreedMeetingFromAddressbook : function(btn)
	{
		var record = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, { id : ++this.sequenceId });
		this.spreedStore.add(record);
		var tasks = [];
		var contacts = btn.getRecords();

		for (var i = 0, len = contacts.length; i < len; i++) {
			var contact = contacts[i];

			// Check if the contact was already opened, if so we can
			// add the contact to Spreed as participant directly, otherwise the
			// mail needs to be opened first.
			if (contact.isOpened()) {
				var participant = this.convertAddressbookUserToParticipant(contact);
				record.getSubStore('recipients').add(participant);
			} else {
				tasks.push({
					/*
					 * By encapsulating the task function it is possible to get the contact object 
					 * into the scope of the task function. When you add more tasks the contact 
					 * reference changes and without this encapsulation it will change the contact in
					 * all the previously added task functions as well.
					 */
					fn : function() {
						// This contactRecord becomes a private variable, not changable outside.
						var contactRecord = contact;
						return function(panel, spreedRecord, task, callback) {
							var fn = function(store, record) {
								if (record === contactRecord) {
									store.un('open', fn, task);
									var participant = this.scope.convertAddressbookUserToParticipant(contact);
									spreedRecord.getSubStore('recipients').add(participant);
									callback();
								}
							};

							contactRecord.getStore().on('open', fn, task);
							contactRecord.open();
						};
					// This triggers the encapsulation and returns the task function
					}(),
					scope : this
				});
			}
		}

		this.openSpreedDialog(record, {
			recordComponentPluginConfig : {
				loadTasks : tasks
			}
		});

	},

	/**
	 * Merge a {@link Zarafa.mail.MailRecord E-mail} into a {@link Zarafa.plugins.spreed.data.SpreedRecord Spreed Meeting}.
	 * This will {@link #mergeSender Merge the sender of the mail}, as well as all {@link #mergeParticipants recipients}
	 * and {@link #mergeAttachments attachments}. Optionally it will also merge the 'subject' and 'Zarafa.mail.MailRecord#getBody body}.
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedRecord} spreed The Spreed meeting to merge to
	 * @param {Zarafa.mail.MailRecord} mail The E-mail to merge from
	 * @param {Boolean} partial True to prevent the subject and body from being merged
	 * @private
	 */
	mergeMailToSpreed : function(spreed, mail, partial)
	{
		// Merge the sender of the original mail
		this.mergeSender(spreed, mail);

		// Merge the Recipients substore
		this.mergeParticipants(spreed.getSubStore('recipients'), mail.getSubStore('recipients'));

		// Merge the Attachments substore
		this.mergeAttachments(spreed.getSubStore('attachments'), mail.getSubStore('attachments'));

		if (partial !== true) {
			spreed.set('subject', mail.get('subject'));
			spreed.set('description', mail.getBody(false));
		}
	},

	/**
	 * Merge the sender of the {@link Zarafa.mail.MailRecord E-mail} into the
	 * {@link Zarafa.plugins.spreed.data.SpreedRecord Spreed Meeting}. This will
	 * check if the 'sent_representing_entryid' propery is there, if so copy the
	 * 'sent_representing' properties, otherwise the 'sender' properties are used.
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedRecord} spreed The Spreed meeting to merge to
	 * @param {Zarafa.mail.MailRecord} mail The E-mail to merge from
	 * @private
	 */
	mergeSender : function(spreed, mail)
	{
		var representingEntryid = mail.get('sent_representing_entryid');
		var data;

		if (!Ext.isEmpty(representingEntryid)) {
			data = {
				entryid : mail.get('sent_representing_entryid'),
				object_type : Zarafa.core.mapi.ObjectType.MAPI_MAILUSER,
				display_name : mail.get('sent_representing_name'),
				display_type : Zarafa.core.mapi.DisplayType.DT_MAILUSER,
				display_type_ex : Zarafa.core.mapi.DisplayType.DT_MAILUSER,
				email_address :  mail.get('sent_representing_email_address'),
				smtp_address :  mail.get('sent_representing_email_address'),
				address_type : mail.get('sent_representing_address_type'),
				recipient_type : Zarafa.core.mapi.RecipientType.MAPI_TO
			};
		} else {
			data = {
				entryid : mail.get('sender_entryid'),
				object_type : Zarafa.core.mapi.ObjectType.MAPI_MAILUSER,
				display_name : mail.get('sender_name'),
				display_type : Zarafa.core.mapi.DisplayType.DT_MAILUSER,
				display_type_ex : Zarafa.core.mapi.DisplayType.DT_MAILUSER,
				email_address :  mail.get('sender_email_address'),
				smtp_address : mail.get('sender_email_address'),
				address_type : mail.get('sender_address_type'),
				recipient_type : Zarafa.core.mapi.RecipientType.MAPI_TO
			};
		}

		var spreedParticipant = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, data);
		var participantStore = spreed.getSubStore('recipients');

		if (this.isAllowedParticipant(participantStore, spreedParticipant)) {
			participantStore.add(spreedParticipant);
		}
	},

	/**
	 * Convert all {@link Zarafa.core.data.IPMRecipientRecord Recipient Records} from the given
	 * {@link Zarafa.core.data.IPMRecipientStore Recipient Store} to 
	 * {@link Zarafa.plugins.spreed.data.SpreedParticipantRecord Participants}.
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedParticipantStore} participantStore Participants store to which to merge to
	 * @param {Zarafa.core.data.IPMRecipientStore} recipientStore The store from where all recipients are merged from
	 * @private
	 */
	mergeParticipants : function(participantStore, recipientStore)
	{
		recipientStore.each(function(recipient) {
			var spreedParticipant = this.convertRecipientToParticipant(recipient);
			if (this.isAllowedParticipant(participantStore, spreedParticipant)) {
				participantStore.add(spreedParticipant);
			}
		}, this);
	},

	/**
	 * Convert all {@link Zarafa.core.data.IPMAttachmentRecord Attachment Records} from the given
	 * {@link Zarafa.core.data.IPMAttachmentStore Attachment Store} to 
	 * {@link Zarafa.plugins.spreed.data.SpreedAttachmentRecord Spreed Attachments}.
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedAttachmentStore} spreedStore Attachment store to which to merge to
	 * @param {Zarafa.core.data.IPMAttachmentStore} attachmentStore The store from where all attachments are merged from
	 * @private
	 */
	mergeAttachments : function(spreedStore, attachmentStore)
	{
		attachmentStore.each(function(attach) {
			var spreedAttach = this.convertAttachmentToSpreed(attach);
			spreedStore.add(spreedAttach);
		}, this);
	},

	/**
	 * Convert a single {@link Zarafa.core.data.IPMRecipientRecord recipient} to
	 * a {@link Zarafa.plugins.spreed.data.SpreedParticipantRecord Participant}.
	 *
	 * @param {Zarafa.core.data.IPMRecipientRecord} recipient The recipient to convert
	 * @return {Zarafa.plugins.spreed.data.SpreedParticipantRecord} The participant
	 * @private
	 */
	convertRecipientToParticipant : function(recipient)
	{
		var Factory = Zarafa.core.data.RecordFactory;
		var Type = Zarafa.core.data.RecordCustomObjectType;
		var data = Ext.apply({}, recipient.data);

		// Force recipient_type to be MAPI_TO
		data.recipient_type = Zarafa.core.mapi.RecipientType.MAPI_TO;

		return Factory.createRecordObjectByCustomType(Type.ZARAFA_SPREED_PARTICIPANT, data);
	},

	/**
	 * Convert a {@link Zarafa.contact.ContactRecord Contact} or {@link Zarafa.addressbook.AddressbookRecord AB User}
	 * to a {@link Zarafa.plugins.spreed.data.SpreedParticipantRecord Participant}.
	 *
	 * @param {Zarafa.contact.ContactRecord|Zarafa.addressbook.AddressbookRecord} user The user to convert
	 * @return {Zarafa.plugins.spreed.data.SpreedParticipantRecord} The participant
	 * @private
	 */
	convertAddressbookUserToParticipant : function(user)
	{
		var recipients = user.convertToRecipient(Zarafa.core.mapi.RecipientType.MAPI_TO, true);
		var participants = [];

		if (!Ext.isArray(recipients)) {
			recipients = [ recipients ];
		}

		for (var i = 0, len = recipients.length; i < len; i++) {
			participants.push(this.convertRecipientToParticipant(recipients[i]));
		}

		return participants;
	},

	/**
	 * Convert a {@link Zarafa.core.data.IPMAttachmentRecord attachment} to
	 * a {@link Zarafa.plugins.spreed.data.SpreedAttachmentRecord Spreed attachment}.
	 *
	 * @param {Zarafa.core.data.IPMAttachmentRecord} attachment The attachment to convert
	 * @return {Zarafa.plugins.spreed.data.SpreedAttachmentRecord} The Spreed Attachment
	 * @private
	 */
	convertAttachmentToSpreed : function(attachment)
	{
		var Factory = Zarafa.core.data.RecordFactory;
		var Type = Zarafa.core.data.RecordCustomObjectType;
		var data = Ext.apply({}, attachment.data);
		var store_entryid = attachment.store.getParentRecord().get('store_entryid');
		var parent_entryid = attachment.store.getAttachmentParentRecordEntryId();
		var id = attachment.store.getId();

		Ext.apply(data, {
			original_record_entry_id : parent_entryid,
			original_record_store_entry_id : store_entryid,
			original_attachment_store_id : id,
			original_attach_num : attachment.get('attach_num')
		});

		return Factory.createRecordObjectByCustomType(Type.ZARAFA_SPREED_ATTACHMENT, data);
	},

	/**
	 * Check if the given {@link Zarafa.plugins.spreed.data.SpreedParticipantRecord participant}
	 * is allowed to be added to the {@link Zarafa.plugins.spreed.data.SpreedParticipantStore Store}.
	 *
	 * This checks if the participant is not the {@link Zarafa.core.Container#getUser current user},
	 * and is not already present in the participant store
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedParticipantStore} participantStore The store the participant is going
	 * to be added to
	 * @param {Zarafa.plugins.spreed.data.SpreedParticipantRecord} newParticipant The participant which is being checked
	 * @private
	 */
	isAllowedParticipant : function(participantStore, newParticipant)
	{
		var EntryId = Zarafa.core.EntryId;

		if (EntryId.compareEntryIds(container.getUser().getEntryId(), newParticipant.get('entryid'))) {
			return false;
		}

		var index = participantStore.findBy(function(participant) {
			return EntryId.compareEntryIds(participant.get('entryid'), newParticipant.get('entryid'));
		});

		return index < 0;
	},

	/**
	 * Open the SpreedSetupDialog with the custom SpreedRecord
	 * passed as the param. This record contains defualt values
	 * for dialog fields.
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedRecord} record
	 * @param {Object} config Configuration object for the Spreed Dialog
	 * @private
	 */
	openSpreedDialog : function(record, config)
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.create'], record, config);
	},

	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * This will bid on a common.dialog.create or common.dialog.view for a
	 * record with a message class set to IPM or IPM.Note.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, record)
	{
		var bid = -1;
		if (Ext.isArray(record)) {
			record = record[0];
		}

		if (record && record.store || record instanceof Zarafa.addressbook.AddressBookRecord) {
			switch (type)
			{
				case Zarafa.core.data.SharedComponentType['common.create']:
				case Zarafa.core.data.SharedComponentType['common.view']:
					if (record instanceof Zarafa.plugins.spreed.data.SpreedRecord) {
						bid = 2;
					} else if (record.store.customObjectType == Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT) {
						bid = 2;
					}
					break;
				case Zarafa.core.data.SharedComponentType['common.contextmenu']:
					if (record.store.customObjectType == Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT) {
						bid = 2;
					}
					break;
			}
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent : function(type, record)
	{
		var component;
		switch (type)
		{
			case Zarafa.core.data.SharedComponentType['common.create']:
			case Zarafa.core.data.SharedComponentType['common.view']:
				if (record instanceof Zarafa.plugins.spreed.data.SpreedRecord) {
					component = Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel;
				} else if (record.store.customObjectType == Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT) {
					component = Zarafa.plugins.spreed.dialogs.EditSpreedParticipantContentPanel;
				}
				break;
			case Zarafa.core.data.SharedComponentType['common.contextmenu']:
				component = Zarafa.plugins.spreed.dialogs.SpreedParticipantContextMenu;
				break;
		}
		return component;
	},

	/**
	 * Open new window with check in url which comes from server after save record action.
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedStore} store The store which fired the event
	 * @param {String} action [Ext.data.Api.actions.create|update|destroy|open]
	 * @param {Object} data The 'data' picked-out out of the response for convenience.
	 * @param {Ext.Direct.Transaction} res
	 * @param {Zarafa.plugins.spreed.data.SpreedRecord[]} records The most recent version of the records
	 * which came from the server.
	 * @private
	 */
	onStoreWrite : function(store, action, result, res, records)
	{
		if (action == Ext.data.Api.actions['create']) {
			var checkin_url;
			if (Ext.isArray(records)) {
				if (records.length > 1) {
					checkin_url = records[0].get('checkin_url');
				}
			} else if (records) {
				checkin_url = records.get('checkin_url');
			}

			if (!Ext.isEmpty(checkin_url)) {
				window.open(checkin_url, '');
			} else {
				Ext.MessageBox.show({
					title   : _('Warning'),
					height  : 300,
					width   : 300,
					msg     : _('Returned url is empty'),
					icon    : Ext.MessageBox.WARNING,
					buttons : Ext.MessageBox.OK
				});
			}
		}
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'spreed',
		displayName : _('Spreed Plugin'),
		about : Zarafa.plugins.spreed.ABOUT,
		pluginConstructor : Zarafa.plugins.spreed.SpreedPlugin
	}));
});
