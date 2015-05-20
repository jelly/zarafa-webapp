Ext.namespace('Zarafa.mail');

/**
 * @class Zarafa.mail.MailContextModel
 * @extends Zarafa.core.ContextModel
 */
Zarafa.mail.MailContextModel = Ext.extend(Zarafa.core.ContextModel, {
	/**
	 * When searching, this property marks the {@link Zarafa.core.ContextModel#getCurrentDataMode datamode}
	 * which was used before {@link #onSearchStart searching started} the datamode was switched to
	 * {@link Zarafa.mail.data.DataModes#SEARCH}.
	 * @property
	 * @type Mixed
	 * @private
	 */
	oldDataMode : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		if(!Ext.isDefined(config.store)) {
			config.store = new Zarafa.mail.MailStore();
		}

		Ext.applyIf(config, {
			statefulRecordSelection: true,
			current_data_mode : Zarafa.mail.data.DataModes.ALL
		});

		Zarafa.mail.MailContextModel.superclass.constructor.call(this, config);

		this.on({
			'searchstart' : this.onSearchStart,
			'searchstop' : this.onSearchStop,
			scope : this
		});
	},

	/**
	 * Create a new {@link Zarafa.core.data.IPMRecord IPMRecord} which must be used within
	 * the {@link Zarafa.mail.dialogs.MailCreateContentPanel MailCreateContentPanel}.
	 * @param {Zarafa.core.data.MAPIFolder} folder folder in which new record should be created.
	 * @return {Zarafa.core.data.IPMRecord} The new {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 */
	createRecord : function(folder)
	{
		folder = folder || container.getHierarchyStore().getDefaultFolder('drafts');

		var signatureId = this.getSignatureId();

		var record = Zarafa.core.data.RecordFactory.createRecordObjectByMessageClass('IPM.Note', {
			store_entryid: folder.get('store_entryid'),
			parent_entryid: folder.get('entryid'),
			body: this.getSignatureData(false, signatureId),
			html_body : this.getSignatureData(true, signatureId),
			isHTML : container.getSettingsModel().get('zarafa/v1/contexts/mail/dialogs/mailcreate/use_html_editor')
			// @todo should set From properties differently if replying for someone else's store
		});

		return record;
	},

	/**
	 * Function will create a new {@link Zarafa.core.data.IPMRecord IPMRecord} for responsing to an original
	 * {@link Zarafa.core.data.IPMRecord IPMRecord}. This will also set subject, body, attachment, recipient
	 * properties based on {@link Zarafa.mail.data.ActionTypes ActionType} provided.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The original {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 * @param {String} actionType The action type for the given {@link Zarafa.core.data.IPMRecord record}.
	 * @param {Zarafa.core.data.IPMRecord} responseRecord The new {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 * Can be any of the values of {@link Zarafa.mail.data.ActionTypes ActionTypes}.
	 * @private
	 */
	createResponseRecord : function(record, actionType, responseRecord)
	{
		// FIXME: Error message?
		if (Ext.isEmpty(actionType) || !record) {
			return;
		}

		var isMultipleItems = false;
		if (Ext.isDefined(responseRecord)) {
			isMultipleItems = true;
		}
		else {
			responseRecord = this.createRecord();
		}

		// Set the Message action for the record. This will instruct
		// the server side to update the original message accordingly.
		responseRecord.addMessageAction('action_type', actionType);

		// By copying the reference to the original mail,
		// the server is able to update that mail and add
		// reply/forward flags to it.
		responseRecord.addMessageAction('source_entryid', record.get('entryid'));
		responseRecord.addMessageAction('source_store_entryid', record.get('store_entryid'));

		this.setSourceMessageInfo(record, actionType, responseRecord);

		var attachNum = record.get('attach_num');
		if(!Ext.isEmpty(attachNum)) {
			responseRecord.addMessageAction('source_attach_num', attachNum);
		}

		// initialize properties of response record
		this.initRecordRecipients(responseRecord, record, actionType);
		this.initRecordSubject(responseRecord, record, actionType);

		if (actionType === Zarafa.mail.data.ActionTypes.FORWARD_ATTACH) {
			responseRecord.getAttachmentStore().addEmbeddedAttachment(record);
		} else {
			this.initRecordBody(responseRecord, record, actionType);
			this.initRecordAttachments(responseRecord, record, actionType);
		}

		if (isMultipleItems) {
			responseRecord.set('subject', _('FW') + ': ');
		}

		// If the record we are replying is in other user's store then set delegator info.
		if (!Ext.isFunction(record.userIsStoreOwner) || !record.userIsStoreOwner()) {
			var storeOwner = container.getHierarchyStore().getById(record.get('store_entryid'));

			if(storeOwner) {
				responseRecord.setDelegatorInfo(storeOwner);
			}
		}

		return responseRecord;
	},

	/**
	 * Fuction is used to set the soruce message action type.
	 * @param {Zarafa.core.data.IPMRecord} record The original {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 * @param {String} actionType The action type for the given {@link Zarafa.core.data.IPMRecord record}.
	 * @param {Zarafa.core.data.IPMRecord} responseRecord The new {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 * Can be any of the values of {@link Zarafa.mail.data.ActionTypes ActionTypes}.
	 */
	setSourceMessageInfo : function(record, actionType, responseRecord)
	{
		// Hack alert ! 
		// we are not able to identify the 0x85CE named property, So here we hardcode first 24byte 
		// value of the record, based on action type (reply, replyall, forward) and add 48byte 
		// entryid at the end.
		var sourceMessageAction;
		switch(actionType) {
			case 'reply':
					sourceMessageAction = "0501000066000000";
				break;
			case 'replyall':
					sourceMessageAction = "0501000067000000";
				break;
			case 'forward':
					sourceMessageAction = "0601000068000000";
				break;
		}
		var sourceMessageInfo = "01000E000C000000" + sourceMessageAction + "0200000030000000" + record.get('entryid');
		responseRecord.set('source_message_info', sourceMessageInfo);
	},

	/**
	 * Initialize the {@link Zarafa.core.data.IPMRecord record} with an updated
	 * subject. This will prefix the previous subject with 'RE' or 'FW',
	 * depending on the given action type.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to initialize
	 * @param {Zarafa.core.data.IPMRecord} origRecord The original record
	 * to which the respond is created
	 * @param {Zarafa.mail.data.ActionTypes} actionType The actionType used
	 * for this response.
	 * @private
	 */
	initRecordSubject : function(record, origRecord, actionType)
	{
		var subjectPrefix = undefined;

		switch (actionType)
		{
			case Zarafa.mail.data.ActionTypes.REPLY:
			case Zarafa.mail.data.ActionTypes.REPLYALL:
				subjectPrefix = _('RE');
				break;
			case Zarafa.mail.data.ActionTypes.FORWARD:
			case Zarafa.mail.data.ActionTypes.FORWARD_ATTACH:
				subjectPrefix = _('FW');
				break;
			default:
				// FIXME: Error message?
				subjectPrefix = _('RE');
				break;
		}

		record.set('subject', subjectPrefix + ': ' + origRecord.get('normalized_subject'));
		record.set('normalized_subject', origRecord.get('normalized_subject'));
	},

	/**
	 * Initialize the {@link Zarafa.core.data.IPMRecord record} with an updated
	 * body. This will quote the previous body as plain-text or html depending
	 * on the editors preferences.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to initialize
	 * @param {Zarafa.core.data.IPMRecord} origRecord The original record
	 * to which the respond is created
	 * @param {Zarafa.mail.data.ActionTypes} actionType The actionType used
	 * for this response.
	 * @private
	 */
	initRecordBody : function(record, origRecord, actionType)
	{
		var template;
		var signatureId = this.getSignatureId(actionType);

		// Create a copy of the original data, the body has changed,
		// and we don't want to change the original record.
		var respondData = Ext.apply({}, origRecord.data);

		/**
		 * here we go through all the recipients in recipientStore and build the username <user@abc.com> format
		 * recipient for to and cc fields, and add then in respondData display_to and display_cc field.
		 * and we don't want to change original record, 
		 */
		if(origRecord.isOpened()){
			var recipientStore = origRecord.getRecipientStore();
			var to = [];
			var cc = [];
		
			if (recipientStore.getCount() > 0) {
				recipientStore.each(function(recipient) {
					switch(recipient.get('recipient_type')){
						case Zarafa.core.mapi.RecipientType.MAPI_TO :
							to.push(recipient.formatRecipient());
							break;
						case Zarafa.core.mapi.RecipientType.MAPI_CC :
							cc.push(recipient.formatRecipient());
							break;
					}
				},this);

				respondData.display_to = to.join('; ');
				respondData.display_cc = cc.join('; ');
			}
		}

		// Initialize HTML body
		template = new Ext.XTemplate(Zarafa.mail.data.Templates.htmlQuotedTemplate, {
			// Compile the template directly
			compiled: true
		});

		respondData.body = origRecord.getBody(true);
		respondData.signatureData = this.getSignatureData(true, signatureId);
		record.set('html_body', template.apply(respondData));

		// Initialize plain-text body
		template = new Ext.XTemplate(Zarafa.mail.data.Templates.plaintextQuotedTemplate, {
			// Compile the template directly
			compiled: true
		});

		respondData.body = origRecord.getBody(false);
		respondData.signatureData = this.getSignatureData(false, signatureId);

		// Prefix each line with the '> ' sign to indicate
		// it is being quoted.
		respondData.body = respondData.body.replace(/^/g,'> ').replace(/\n/g,'\n> ');

		record.set('body', template.apply(respondData));
	},

	/**
	 * Initialize the {@link Zarafa.core.data.IPMRecord record} with updated
	 * recipients. This will possibly copy all recipients, or will copy the
	 * sender recipient into a To recipient depending on the given actionType.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to initialize
	 * @param {Zarafa.core.data.IPMRecord} origRecord The original record
	 * to which the respond is created
	 * @param {Zarafa.mail.data.ActionTypes} actionType The actionType used
	 * for this response.
	 * @private
	 */
	initRecordRecipients : function(record, origRecord, actionType)
	{
		// When forwarding, we don't need to copy any recipients
		if (actionType === Zarafa.mail.data.ActionTypes.FORWARD || actionType === Zarafa.mail.data.ActionTypes.FORWARD_ATTACH) {
			return;
		}

		var store = record.getRecipientStore();

		// To prevent duplicates to be added, we keep a list of
		// all recipients which are added. Note that the contents
		// of reply-to is unconditional, and we will only be using
		// this list for the REPLYALL case.
		var addedRecipientEntryids = new Array();
		// this line will prevent loged-in user from recipients 
		addedRecipientEntryids.push(container.getUser().getEntryId());

		// We always need to add the reply-to recipients
		var replyTo = origRecord.getSubStore('reply-to');
		replyTo.each(function(recipient) {
			var recipEntryid = recipient.get('entryid');
			var recipData = Ext.apply({}, recipient.data);

			// Create a new recipient containing all data from the original.
			recipient = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_RECIPIENT, recipData);

			// We have copied the 'rowid' as well, but new recipients
			// shouldn't have this property as it will be filled in by PHP. 
			recipient.set('rowid', undefined);

			// Mark the recipient as TO
			recipient.set('recipient_type', Zarafa.core.mapi.RecipientType.MAPI_TO);

			// Add the recipient to the new store
			store.add(recipient);

			// Store entryid of added recipient to prevent doubles
			addedRecipientEntryids.push(recipEntryid);
		}, this);

		// When Replying to all recipients, start adding the originals as well
		if (actionType === Zarafa.mail.data.ActionTypes.REPLYALL) {
			var origStore = origRecord.getRecipientStore();

			origStore.each(function(recipient) {
				var recipEntryid = recipient.get('entryid');

				// Check if entryid is in list of added recipients to prevent doubles.
				// if no entryid is present then also add it as that can be SMTP address
				var recipDuplicate = false;
				if (recipEntryid) {
					for (var i = 0; i < addedRecipientEntryids.length; i++) {
						if (Zarafa.core.EntryId.compareABEntryIds(addedRecipientEntryids[i], recipEntryid)) {
							recipDuplicate = true;
							break;
						}
					}
				}

				if (!recipDuplicate) {
					var recipData = Ext.apply({}, recipient.data);
	
					// Create a new recipient containing all data from the original.
					recipient = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_RECIPIENT, recipData);

					// We have copied the 'rowid' as well, but new recipients
					// shouldn't have this property as it will be filled in by PHP. 
					recipient.set('rowid', undefined);

					store.add(recipient);

					// Store entryid of added recipient to prevent doubles
					addedRecipientEntryids.push(recipEntryid);
				}
			}, this);
		}
	},

	/**
	 * Initialize the {@link Zarafa.core.data.IPMRecord record} with attachments
	 * in case of foward it the attachments will be copied to the  record.
	 * For reply it will be added if it is a inline image.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to initialize
	 * @param {Zarafa.core.data.IPMRecord} origRecord The original record
	 * to which the respond is created
	 * @param {Zarafa.mail.data.ActionTypes} actionType The actionType used
	 * for this response.
	 * @private
	 */
	initRecordAttachments: function(record, origRecord, actionType)
	{
		var store = record.getAttachmentStore();

		switch (actionType)
		{
			case Zarafa.mail.data.ActionTypes.FORWARD:
			case Zarafa.mail.data.ActionTypes.FORWARD_ATTACH:
				var origStore = origRecord.getAttachmentStore();
				origStore.each(function(attach) {
					store.add(attach.copy());
				}, this);

				// Check record store or so
				record.set('hasattach', origRecord.get('hasattach'));

			case Zarafa.mail.data.ActionTypes.REPLYALL:
			case Zarafa.mail.data.ActionTypes.REPLY:
				// TODO: handle inline image attachments
				break;
		}
	},

	/**
	 * Function is used to get signature id of the signature which should be added to the
	 * body of {@link Zarafa.core.data.IPMRecord IPMRecord} based on passed actionType.
	 * If no action type is passed then it should be considered as new mail.
	 * @param {Zarafa.mail.data.ActionTypes} actionType one of 'reply', 'forward', 'replyall'.
	 * @return {Number} signature of signature that should be added to the body.
	 */
	getSignatureId : function(actionType)
	{
		var signatureId;

		// get signature id based on action type passed
		switch (actionType) {
			case Zarafa.mail.data.ActionTypes.FORWARD:
			case Zarafa.mail.data.ActionTypes.FORWARD_ATTACH:
			case Zarafa.mail.data.ActionTypes.REPLYALL:
			case Zarafa.mail.data.ActionTypes.REPLY:
				signatureId = container.getSettingsModel().get('zarafa/v1/contexts/mail/signatures/replyforward_message', true);
				break;
			default:
				signatureId = container.getSettingsModel().get('zarafa/v1/contexts/mail/signatures/new_message', true);
				break;
		}

		return parseInt(signatureId, 10);
	},

	/**
	 * Function is used to get signature data based on passed signature id
	 * from {@link Zarafa.settings.SettingsModel SettingsModel}. It also does convertion of signature data
	 * when it needs to be converted from plain to html or vice versa.
	 * @param {Boolean} preferHTML True if the signature should be returned in HTML format else in plain format.
	 * @param {Number} signatureId id of the signature to get the data, this id can be get using {@link #getSignatureId}.
	 * @return {String} signature data that should be added to body of the {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 */
	getSignatureData : function(preferHtml, signatureId)
	{
		if(!signatureId) {
			return '';
		}

		var sigDetails = container.getSettingsModel().get('zarafa/v1/contexts/mail/signatures/all/' + signatureId, true);

		if(Ext.isEmpty(sigDetails)) {
			return '';
		}

		// Create a copy of the original data
		sigDetails = Ext.apply({}, sigDetails);
		
		if(!Ext.isDefined(sigDetails['content'])) {
			return '';
		}

		var sigIsHtml = sigDetails['isHTML'];
		
		if(preferHtml === false) {
			// we want signature in plain format, so if signature is in html format then convert it to plain format
			if(sigIsHtml === true) {
				sigDetails['content'] = Zarafa.core.HTMLParser.convertHTMLToPlain(sigDetails['content']);
			}

			// no conversion needed if signature is in plain format

			// Prefix the signature with some newlines
			sigDetails['content'] = '\n\n' + sigDetails['content'];
		} else {
			// we want signature in html format, so if signature is in plain format then convert it to html
			if(sigIsHtml === false) {
				sigDetails['content'] = Zarafa.core.HTMLParser.convertPlainToHTML(sigDetails['content']);
			}

			// no conversion needed if signature is in html format

			// Prefix the signature with newline, using font stylings from settings
			sigDetails['content'] = sigDetails['content'];
		}

		return sigDetails['content'];
	},

	/**
	 * Event handler which is executed right before the {@link #datamodechange}
	 * event is fired. This allows subclasses to initialize the {@link #store}.
	 * This will apply a restriction to the {@link #store} if needed.
	 *
	 * @param {Zarafa.contact.ContactContextModel} model The model which fired the event.
	 * @param {Zarafa.contact.data.DataModes} newMode The new selected DataMode.
	 * @param {Zarafa.contact.data.DataModes} oldMode The previously selected DataMode.
	 * @private
	 */
	onDataModeChange : function(model, newMode, oldMode)
	{
		Zarafa.mail.MailContextModel.superclass.onDataModeChange.call(this, model, newMode, oldMode);

		if (newMode !== oldMode && oldMode === Zarafa.mail.data.DataModes.SEARCH) {
			this.stopSearch();
		}

		switch (newMode) {
			case Zarafa.mail.data.DataModes.SEARCH:
				break;
			case Zarafa.mail.data.DataModes.ALL:
				this.load();
				break;
		}
	},

	/**
	 * Event handler which is executed right before the {@link #folderchange}
	 * event is fired. This allows subclasses to update the folders.
	 * Also apply the default sorting on mail grid as per the folder type.
	 * 
	 * @param {Zarafa.core.ContextModel} model The model which fired the event.
	 * @param {Array} folders selected folders as an array of {@link Zarafa.hierarchy.data.MAPIFolderRecord Folder} objects.
	 * @private
	 */
	onFolderChange : function(model, folders)
	{
		if(!Ext.isEmpty(folders)) {
			var folder = folders[0];
			var folderKey = folder.getDefaultFolderKey();
			var field = 'message_delivery_time'; 

			if(folderKey === 'drafts') {
				field = 'last_modification_time';
			} else if(folderKey === 'sent' || folderKey === 'outbox') {
				field = 'client_submit_time';
			}

			this.store.defaultSortInfo.field = field;
		}

		Zarafa.mail.MailContextModel.superclass.onFolderChange.call(this, model, folders);
	},

	/**
	 * Event handler for the {@link #searchstart searchstart} event.
	 * This will {@link #setDataMode change the datamode} to {@link Zarafa.mail.data.DataModes#SEARCH search mode}.
	 * The previously active {@link #getCurrentDataMode view} will be stored in the {@link #oldDataMode} and will
	 * be recovered when the {@link #onSearchStop search is stopped}.
	 * @param {Zarafa.core.ContextModel} model The model which fired the event
	 * @private
	 */
	onSearchStart : function(model)
	{
		if(this.getCurrentDataMode() != Zarafa.mail.data.DataModes.SEARCH){
			this.oldDataMode = this.getCurrentDataMode();
			this.setDataMode(Zarafa.mail.data.DataModes.SEARCH);
		}
	},
	
	/**
	 * Event handler for the {@link #searchstop searchstop} event.
	 * This will {@link #setDataMode change the datamode} to the {@link #oldDataMode previous datamode}.
	 * @param {Zarafa.core.ContextModel} model The model which fired the event
	 * @private
	 */
	onSearchStop : function(model)
	{
		if (this.getCurrentDataMode() === Zarafa.mail.data.DataModes.SEARCH) {
			this.setDataMode(this.oldDataMode);
		}
		delete this.oldDataMode;
	}
});
