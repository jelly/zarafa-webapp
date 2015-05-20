Ext.namespace('Zarafa.core.data');
/**
 * #dependsFile client/zarafa/core/mapi/ObjectType.js
 */

/**
 * @class Zarafa.core.data.IPMAttachmentStore
 * @extends Zarafa.core.data.MAPISubStore
 */
Zarafa.core.data.IPMAttachmentStore = Ext.extend(Zarafa.core.data.MAPISubStore, {
	/**
	 * @cfg {String} id ID to communicate with the server for the location of the cached attachments.
	 */
	id : null,

	/**
	 * @cfg {Zarafa.core.ObjectType} attachmentRecordType to create a custom {Zarafa.core.data.IPMAttachmentRecord} 
	 */
	attachmentRecordType : Zarafa.core.mapi.ObjectType.MAPI_ATTACH,

	/**
	 * @constructor
	 * @param config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			id : Zarafa.generateId(32),
			// provide a default proxy
			proxy : new Zarafa.core.data.IPMAttachmentProxy({
				listModuleName : 'attachments',
				itemModuleName : 'attachments'
			}),
			// provide a default writer
			writer : new Zarafa.core.data.JsonAttachmentWriter(),
			// provide a default reader
			reader : new Zarafa.core.data.JsonAttachmentReader({}, Zarafa.core.data.RecordFactory.getRecordClassByCustomType(this.attachmentRecordType))
		});

		Zarafa.core.data.IPMAttachmentStore.superclass.constructor.call(this, config);

		// Update the 'hasattach' property whenever the store changes
		this.on({
			'update' : this.onAttachmentsChange,
			'add' : this.onAttachmentsChange,
			'remove' : this.onAttachmentsChange,
			'datachanged' : this.onAttachmentsChange,
			'scope' : this
		});
	},

	/**
	 * Event handler which is fired when data in this store has changed.
	 *
	 * This will update hasattach property of parentrecord
	 * If there are any attachments in store then,
	 * it will set hasattach property of record to true,
	 * otherwise it will set it to false.
	 *
	 * @param {Store} store
	 * @param {Ext.data.Record/Ext.data.Record[]} record
	 * @param {Number} index
	 * @private
	 */
	onAttachmentsChange : function()
	{
		if(this.getParentRecord()){
			if(this.getCount() > 0) {
				this.getParentRecord().set('hasattach', true);
			} else {
				this.getParentRecord().set('hasattach', false);
			}
		}
	},

	/**
	 * Obtain the ID to communicate with the
	 * server for the location of cached attachments
	 * @return {String} The ID of the server attachment location
	 */
	getId : function()
	{
		return this.id;
	},

	/**
	 * Set the ID to communicate with the server
	 * for the location of cached attachments
	 * @param {String} id The ID of the server attachment location
	 */
	setId : function(id)
	{
		this.id = id;
	},

	/**
	 * Builds and returns inline image URL to download inline images,
	 * it uses {@link Zarafa.core.data.IPMRecord IPMRecord} to get store and message entryids.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} attachmentRecord Attachment record.
	 * @return {String} URL for downloading inline images.
	 */
	getInlineImageUrl : function(attachmentRecord)
	{
		var url = this.getAttachmentBaseUrl(attachmentRecord);
		return Ext.urlAppend(url, 'contentDispositionType=inline');
	},

	/**
	 * Builds and returns attachment URL to download attachment,
	 * it uses {@link Zarafa.core.data.IPMRecord IPMRecord} to get store and message entryids.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} attachmentRecord Attachment record.
	 * @return {String} URL for downloading attachment.
	 */
	getAttachmentUrl : function(attachmentRecord)
	{
		var url = this.getAttachmentBaseUrl(attachmentRecord);
		return Ext.urlAppend(url, 'contentDispositionType=attachment');
	},

	/**
	 * Builds and returns attachment URL to download inline images,
	 * it uses {@link Zarafa.core.data.IPMRecord IPMRecord} to get store and message entryids.
	 * @param {Zarafa.core.data.IPMAttachmentRecord} attachmentRecord Attachment record.
	 * @return {String} URL for downloading attachments.
	 */
	getAttachmentBaseUrl : function(attachmentRecord)
	{
		var parentRecord = this.getParentRecord();
		var attachNum = attachmentRecord.getParentAttachNum(parentRecord);

		var url = container.getBaseURL();
		url = Ext.urlAppend(url, 'load=download_attachment');
		url = Ext.urlAppend(url, 'sessionid=' + container.getUser().getSessionId());
		url = Ext.urlAppend(url, 'store=' + parentRecord.get('store_entryid'));
		url = Ext.urlAppend(url, 'entryid=' + this.getAttachmentParentRecordEntryId());

		if (attachmentRecord.get('attach_num') != -1) {
			// add attachment number of parent sub messages
			attachNum.push(attachmentRecord.get('attach_num'));

			for(var index = 0, len = attachNum.length; index < len; index++) {
				url = Ext.urlAppend(url, 'attachNum[]=' + attachNum[index]);
			}
		} else {
			url = Ext.urlAppend(url, 'attachNum[]=' + attachmentRecord.get('tmpname'));
		}

		url = Ext.urlAppend(url, 'dialog_attachments=' + this.getId());
		return url;
	},

	/**
	 * Function returns parent record entry id for the attachment.
	 * If parent record has an entryid then return it. For phantom records i.e. forward mail,
	 * parent record won't have entryid so get source_entryid from record's
	 * message action data and return it.
	 * @return {String} entryID parent record entryid.
	 * @private
	 */
	getAttachmentParentRecordEntryId : function()
	{
		var parentRecord = this.getParentRecord();
		var entryID = parentRecord.get('entryid') || '';
		var messageAction = parentRecord.getMessageActions();

		if (Ext.isEmpty(entryID) && messageAction) {
			switch(messageAction.action_type) {
				case 'forward':
					entryID = messageAction.source_entryid;
					break;
				case 'reply':
				case 'replyall':
					// @TODO: Need to check for inline images, whether we
					// should pass entryid or any need in future.
			}
		}

		return entryID;
	},

	/**
	 * Builds and returns attachment URL to upload files.
	 * @return {String} URL for downloading attachments
	 * @private
	 */
	getUploadAttachmentUrl : function()
	{
		var url = container.getBaseURL();
		url = Ext.urlAppend(url, 'load=upload_attachment');
		url = Ext.urlAppend(url, 'sessionid=' + container.getUser().getSessionId());
		url = Ext.urlAppend(url, 'store=' + this.getParentRecord().get('store_entryid'));
		url = Ext.urlAppend(url, 'entryid=' + this.getParentRecord().get('entryid'));
		url = Ext.urlAppend(url, 'dialog_attachments=' + this.getId());
		return url;
	},

	/**
	 * Check if the given files can be added to this store, this is
	 * only possible when none of the limits from the {@link Zarafa.core.data.ServerConfig ServerConfig}
	 * configuration have been exceeded.
	 *
	 * @param {FileList|Array} files The array of Files objects from the file input field.
	 * @param {Object} options (optional) Additional parameters for the call to
	 * {@link Zarafa.core.ui.notifier.Notifier#notify} if one of the limits was
	 * exceeded.
	 * @return {Boolean} True if the files can be uploaded, false otherwise
	 * @private
	 */
	canUploadFiles : function(files, options)
	{
		// If there are no files we can exit. Ext.isEmpty()
		// checks if files is null or undefined. If files is
		// a FileList, then Ext.isEmpty() will not perform
		// a proper check for the length of the list.
		if (Ext.isEmpty(files) || files.length === 0) {
			return false;
		}

		var server = container.getServerConfig();
		// Maximum number of attachments that can be uploaded in message.
		var max_attachments = server.getMaxAttachments();
		// Maximum size of single file that can be uploaded in message.
		var max_attachment_size = server.getMaxAttachmentSize();
		// Maximum size of attachments that can be uploaded in message.
		var max_attachment_total_size = server.getMaxAttachmentTotalSize();

		/**
		 * Here all three checks are regarding maximum upload attachments in message.
		 * 
		 * first check is check's that maximum number of attachments are possible to attach in single message.
		 * by default there is no limit for number of attachments in message.
		 * 
		 * second check is check's that each attachment should not be more than 30 MB size.
		 * 
		 * third check is check's that total maximum attachment size in single message.
		 * by default there is no limit for maximum attachments in message.
		 */
		// 1) Check for the total number of attachments
		if (Ext.isDefined(max_attachments)) {
			if ((this.getCount() + files.length) >= max_attachments) {
				container.getNotifier().notify('error.attachment', _('Attachment error'),
								String.format(_('Cannot upload attachment, only {0} attachments are allowed to be added to the message'), max_attachments),
								options);
				return false;
			}
		}

		// total Post request size in single request.
		var totalPostSize = 0;
		var totalSize = this.sum('size');

		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			var fileSize = file.fileSize || file.size;

			// Update totalPostSize
			totalPostSize += fileSize;

			// Update totalSize
			totalSize += fileSize;

			// 2) Check if the size exceeds the maximum upload size
			if (Ext.isDefined(max_attachment_size)) {
				if (fileSize > max_attachment_size) {
					container.getNotifier().notify('error.attachment', _('Attachment error'),
									String.format(_('Cannot upload attachment, attachment is {0} while the allowed maximum is {1}.'),
										      Ext.util.Format.fileSize(fileSize), Ext.util.Format.fileSize(max_attachment_size)),
									options);
					return false;
				}
			}
		}

		// 3) Check if the size exceeds the total maximum attachment size
		if (Ext.isDefined(max_attachment_total_size)) {
			if (totalSize > max_attachment_total_size) {
				container.getNotifier().notify('error.attachment', _('Attachment error'),
								String.format(_('Cannot upload attachment, the total attachment size is {0} while the allowed maximum is {1}'),
									      Ext.util.Format.fileSize(totalSize), Ext.util.Format.fileSize(max_attachment_total_size)),
								options);
				return false;
			}
		}

		// Maximum number of files that can be uploaded in a single request.
		var max_file_uploads = server.getMaxFileUploads();
		// Maximum size of post request that can be send in a single request.
		var max_post_size = server.getMaxPostRequestSize();

		/**
		 * Here both the checks are for post request size in single message,
		 * 
		 * first check is check that user can not 
		 * able to send post request more then 31 MB size in single request. 
		 * max_post_size has default configuration in php ini(Apache) settings.
		 * 
		 * second check is check that user can not able to send post request
		 * more then 20 files in single request. max_file_uploads has default
		 * configuration in php ini (Apache) settings.
		 */
		// 1) Check if the size exceeds the maximum post size.
		if(Ext.isDefined(max_post_size)) {
			if (totalPostSize > max_post_size) {
				container.getNotifier().notify('error.attachment', _('Attachment error'),
								String.format(_('Cannot upload attachment, total attachment is {0} while the allowed maximum attachment in single request is {1}.'),
										Ext.util.Format.fileSize(totalPostSize), Ext.util.Format.fileSize(max_post_size)),
								options);
				return false;
			}
		}

		var totalFilesUploads = files.length;
		// 2) check if the maximum file uploads in single request.
		if(Ext.isDefined(max_file_uploads)) {
			if (totalFilesUploads > max_file_uploads) {
				container.getNotifier().notify('error.attachment', _('Attachment error'),
								String.format(_('Cannot upload attachment, total attachments are {0} files while the maximum {1} files are allowed in single request.'),
										 totalFilesUploads , max_file_uploads),
								options);
				return false;
			}
		}

		return true;
	},

	/**
	 * Upload the given files to the server, this will generate new
	 * {@link Zarafa.core.data.IPMAttachmentRecord attachment records} and
	 * add those to the store.
	 * @param {FilesArray/String[]} files The array of file objects to upload
	 * @param {Ext.form.BasicForm} form (optional) If only filenames were provided in files
	 * argument, then this form must be the form which contains all file input elements
	 * @param {Boolean} isHidden if isHidden is true it will hide the attachments.
	 * @param {Object} params (optional) the params which contains source type of the attachment,
	 * i.e 'contactphoto', 'embedded' attachment or file attachment 'default'
	 */
	uploadFiles : function(files, form, isHidden, params)
	{
		var attachments = [];
		var isFileList = Zarafa.supportsFilesAPI() && files instanceof FileList;

		for (var i = 0; i < files.length; i++) {
			var file = files[i];

			if (isFileList) {
				// Create an attachment record, with all the passed data, use record factory so default values will be applied
				var attach = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(this.attachmentRecordType, {
					'name' : file['name'],
					'size' : file['size'],
					'filetype' : file['type'],
					'hidden' : Ext.isDefined(isHidden) ? isHidden : false,
					'attach_method' : Zarafa.core.mapi.AttachMethod.ATTACH_BY_VALUE
				});
			} else {
				// If the file is a String, it is the file name including a fake path
				// ('C:\fakepath\<filename>') which must be stripped of its silly path.
				var attach = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(this.attachmentRecordType, {
					'name' : Ext.util.Format.basename(file),
					'hidden' : Ext.isDefined(isHidden) ? isHidden : false
				});
			}

			attach.file = file;

			attachments.push(attach);
		}

		// Add it to the store
		this.add(attachments);

		// Prepare the upload
		var data = {};

		// Add source type if attachment record is contact photo.
		data = Ext.apply(data, params);

		// If we received a FileList we can should provide
		// the files into the data so it can be added to the request.
		// Otherwise we expect the form object to hold the files.
		if (isFileList) {
			data['attachments'] = files;
		};

		var options = {
			'params' : data,
			'requestUrl' : this.getUploadAttachmentUrl(),
			'requestForm' : form
		};

		if (this.batch) {
			this.addToBatch(++this.batchCounter);
		}

		var action = Ext.data.Api.actions['create'];
		var callback = this.createCallback(action, attachments, false);
		this.proxy.request(action, attachments, options.params, this.reader, callback, this, options);
	},

	/**
	 * Add given {@link Zarafa.core.data.IPMRecord IPMRecord} as embedded attachment to {@link Zarafa.core.data.IPMAttachmentStore IPMAttachmentStore}, this will generate new
	 * {@link Zarafa.core.data.IPMAttachmentRecord attachment record} and
	 * add those to the store and will send request to server to save embedded attachment info to state file.
	 * @param {Zarafa.core.data.IPMRecord} record The record which needs to be added as embedded attachment into store.
	 */
	addEmbeddedAttachment : function(record)
	{
		var data = {
			'entryid' : record.get('entryid'),
			'store_entryid' : record.get('store_entryid'),
			// attach method to indicate this is an embedded attachment
			'attach_method' : Zarafa.core.mapi.AttachMethod.ATTACH_EMBEDDED_MSG
		};

		// Some optional data which should be present only if it is not empty
		if(!Ext.isEmpty(record.get('subject'))) {
			data['name'] = record.get('subject');
		}

		if(!Ext.isEmpty(record.get('message_class'))) {
			data['attach_message_class'] = record.get('message_class');
		}

		if(!Ext.isEmpty(record.get('message_size'))) {
			data['size'] = record.get('message_size');
		}

		// Create an attachment record, with all the passed data, use record factory so default values will be applied
		var attach = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.mapi.ObjectType.MAPI_ATTACH, data);

		// Add it to the store
		this.add(attach);

		var options = {
			'params' : attach.data,
			'requestUrl' : this.getUploadAttachmentUrl()
		};

		var action = Ext.data.Api.actions['create'];
		var callback = this.createCallback(action, attach, false);
		this.proxy.request(action, attach, options.params, this.reader, callback, this, options);
	},

	/**
	 * Destroys a record or records. Should not be used directly. It's called by Store#remove automatically
	 * @param {Store} store
	 * @param {Ext.data.Record/Ext.data.Record[]} record
	 * @param {Number} index
	 * @private
	 */
	destroyRecord : function(store, record, index)
	{
		Zarafa.core.data.IPMAttachmentStore.superclass.destroyRecord.apply(this, arguments);

		var data = {};

		if (record.isTmpFile()) {
			data['deleteattachment'] = true;
			data['attach_num'] = record.get('tmpname');
		} else {
			data['deleteattachment'] = true;
			data['attach_num'] = record.get('attach_num');
		}

		var options = {
			'params' : data,
			'requestUrl' : this.getUploadAttachmentUrl()
		};

		var action = Ext.data.Api.actions['destroy'];
		var callback = this.createCallback(action, record, false);
		this.proxy.request(action, record, options.params, this.reader, callback, this, options);
	},

	/**
	 * Possibly temporary until Ext framework has an exception-handler.
	 * See {@link Ext.data.Store}.
	 * @protected
	 */
	handleException : Ext.data.Store.prototype.handleException,

	/**
	 * callback-handler for remote CRUD actions.
	 * Do not override -- override loadRecords, onCreateRecords, onDestroyRecords and onUpdateRecords instead.
	 * See {@link Ext.data.Store}.
	 * @private
	 */
	createCallback : Ext.data.Store.prototype.createCallback,

	/**
	 * Proxy callback for create action.
	 * Callback function as created by {@Link #createCallback}.
	 * See {@link Ext.data.Store}.
	 * @protected
	 */
	onCreateRecords : Ext.data.Store.prototype.onCreateRecords,

	/**
	 * Proxy callback for destroy action
	 * Callback function as created by {@Link #createCallback}.
	 * See {@link Ext.data.Store}.
	 * @protected
	 */
	onDestroyRecords : Ext.data.Store.prototype.onDestroyRecords,

	/**
	 * remap record ids in MixedCollection after records have been realized. See {@link Ext.dataStore#onCreateRecords}, and
	 * {@link Ext.data.DataReader#realize}
	 * @private
	 */
	reMap : Ext.data.Store.prototype.reMap,

	/**
	 * Add request to batch
	 * See {@link Ext.data.Store}.
	 * @private
	 */
	addToBatch : Ext.emptyFn,

	/**
	 * Remove request from batch
	 * See {@link Ext.data.Store}.
	 * @private
	 */
	removeFromBatch : Ext.emptyFn
});
