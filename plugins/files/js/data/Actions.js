Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.Actions
 * Common actions which can be used within {@link Ext.Button buttons}
 * or other {@link Ext.Component components} with action handlers.
 * @singleton
 */
Zarafa.plugins.files.data.Actions = {
	/**
	 * The internal 'iframe' which is hidden from the user, which is used for downloading
	 * attachments. See {@link #doOpen}.
	 * @property
	 * @type Ext.Element
	 */
	downloadFrame : undefined,
	
	/**
	 * Converts received file information to attachment record
	 * @param {Object} record
	 * @private
	 */
	convertDownloadedFileInfoToAttachmentRecord : function(record) {
		var attachmentRecord = Zarafa.core.data.RecordFactory.createRecordObjectByObjectType(Zarafa.core.mapi.ObjectType.MAPI_ATTACH);

		attachmentRecord.set('tmpname', record.tmpname);
		attachmentRecord.set('name', record.name);
		attachmentRecord.set('size', record.size);
		return attachmentRecord;
	},
	
	/**
	 * Open a Panel in which a new {@link Zarafa.core.data.IPMRecord record} can be
	 * further edited.
	 *
	 * @param {Zarafa.core.data.IPMRecord} emailRecord The email record that will be edited.
	 * @param {Array} records Filerecords that will be added as attachments.
	 * @param {Object} config (optional) Configuration object used to create
	 * the Content Panel.
	 */
	openCreateMailContent : function(emailRecord, records, config) {
		var attachmentStore = emailRecord.getAttachmentStore();
		var attachmentRecord = null;
		
		Ext.each(records, function(record, index) {
			attachmentRecord = this.convertDownloadedFileInfoToAttachmentRecord(record);
			attachmentStore.add(attachmentRecord);
		}, this);
		
		Zarafa.core.data.UIFactory.openCreateRecord(emailRecord, config);
	},
	
	/**
	 * Open a Panel in which a new {@link Zarafa.core.data.IPMRecord record} can be
	 * further edited.
	 *
	 * @param {Zarafa.mail.MailContextModel} model Context Model object that will be used
	 * to {@link Zarafa.mail.MailContextModel#createRecord create} the E-Mail.
	 * @param {Zarafa.addressbook.AddressBookRecord} contacts One or more contact records.
	 * @param {Object} config (optional) Configuration object used to create
	 * the Content Panel.
	 */
	openCreateMailContentForContacts : function(model, contacts, config) {	
		var emailRecord = container.getContextByName("mail").getModel().createRecord();
		
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['zarafa.plugins.files.attachdialog'], undefined , {
			title : String.format(dgettext('plugin_files', 'Add attachment from {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			emailrecord : emailRecord,
			manager : Ext.WindowMgr
		});
		
		var recipientStore = emailRecord.getRecipientStore();
		var tasks = [];
		
		contacts = Ext.isArray(contacts) ? contacts : [ contacts ];
		for (var i = 0, len = contacts.length; i < len; i++) {
			var contact = contacts[i];

			if (contact.isOpened()) {
				// The contact is opened and contains all the information which we need
				var recipient = contact.convertToRecipient(Zarafa.core.mapi.RecipientType.MAPI_TO, true);
				recipientStore.add(recipient);
			} else {
				// The contact is not opened yet, register a task to open the contact once
				// the panel has been opened.
				tasks.push({
					/* By encapsulating the task function it is possible to get the contact object 
					* into the scope of the task function. When you add more tasks the contact 
					* reference changes and without this encapsulation it will change the contact in
					* all the previously added task functions as well.
					*/
					fn : function(){
						// This contactRecord becomes a private variable, not changable outside.
						var contactRecord = contact;
						return function(panel, record, task, callback) {
							var fn = function(store, record) {
								if (record === contactRecord) {
									store.un('open', fn, task);
									var recipient = contactRecord.convertToRecipient(Zarafa.core.mapi.RecipientType.MAPI_TO, true);
									recipientStore.add(recipient);
									callback();
								}
							};

							contactRecord.getStore().on('open', fn, task);
							contactRecord.open();
						}
					// This triggers the encapsulation and returns the task function
					}()
				});
			}
		}
		
		config = Ext.applyIf(config || {}, {
			recordComponentPluginConfig : {
				loadTasks : tasks
			}
		});
		
		Zarafa.core.data.UIFactory.openCreateRecord(emailRecord, config);
	},
	
	
	/**
	 * Create a new item...
	 * @param {Zarafa.mail.MailContextModel} model Context Model.
	 * @param {Object} config (optional) Configuration object used to create
	 * the Content Panel.
	 */
	openCreateFilesContent : function(model, config) {
		var record = model.createRecord();
		Zarafa.core.data.UIFactory.openCreateRecord(record, config);
	},
	
	/**
	 * Open a Panel in which the {@link Zarafa.core.data.IPMRecord record}
	 * can be viewed, or further edited.
	 *
	 * @param {Zarafa.core.data.IPMRecord} records The records to open
	 * @param {Object} config (optional) Configuration object used to create
	 * the Content Panel.
	 */
	openFilesContent : function(records, config) {
		var navpanel = Zarafa.plugins.files.data.ComponentBox.getNavigatorTreePanel();
		var store = Zarafa.plugins.files.data.ComponentBox.getStore();
		
		if(records.length == 1 && records[0].get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER) {
			store.loadPath(records[0].get('id'));
			navpanel.getNodeById(records[0].get('id')).reload();
		} else if(records.length > 1) {
			this.downloadItem(records);
		}
	},
	
	/**
	 * Refreshes the left navigator tree
	 *
	 */
	refreshNavigatorTree : function() {
		var navpanel = Zarafa.plugins.files.data.ComponentBox.getNavigatorTreePanel();
		var store = Zarafa.plugins.files.data.ComponentBox.getStore();
		
		// reload the navigation tree
		var node = navpanel.getNodeById(store.getPath());
		
		if(Ext.isDefined(node) && !node.isLeaf()) {
			node.reload();
		}
	},
	
	/**
	 * Create the upload form
	 *
	 * @param {Zarafa.mail.MailContextModel} model Context Model.
	 * @param {Object} config (optional) Configuration object used to create
	 * the Content Panel.
	 * @param {String} path The destination path in which the uploaded file will be stored.
	 */
	createUploadDialog : function(model, config, path) {
		if(!Ext.isDefined(path) || Ext.isEmpty(path))
			path = model.getStore().getPath();
	
		config = Ext.applyIf(config || {}, {
			modal : true,
			parentID: path
		});
		
		var componentType = Zarafa.core.data.SharedComponentType['zarafa.plugins.files.uploadpanel'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},

	/**
	 * Create a new Folder in {@link Zarafa.core.data.IPMRecord node}
	 *
	 * @param {Zarafa.mail.MailContextModel} model Context Model.
	 * @param {Object} config (optional) Configuration object used to create
	 * the Content Panel.
	 * @param {String} path The destination path in which the new folder will be created.
	 */
	createFolder : function(model, config, path) {
		if(!Ext.isDefined(path) || Ext.isEmpty(path))
			path = model.getStore().getPath();

		Ext.MessageBox.prompt(dgettext('plugin_files', 'Folder name'), dgettext('plugin_files', 'Please enter a foldername'), this.doCreateFolder.createDelegate(this, [model, path], true), this);
	},
	
	/**
	 * Create a new Folder on the server.
	 *
	 * @param {String} button The value of the button
	 * @param {String} text Inputfield value, the foldername
	 * @param {Object} options Unused
	 * @param {Zarafa.mail.MailContextModel} model Context Model.
	 * @param {String} path The destination path in which the uploaded file will be stored.
	 * @private
	 */
	doCreateFolder : function(button, text, options, model, path) {
		if(button === "ok") {
			try {
				// check if folder with same name already exists
				var alreadyExists = false;
				if(model.getStore().findExact("id", path + text + "/") != -1) {
					alreadyExists = true;
				}
				// check if foldername contains a / - if so, dont rename it
				if(!Zarafa.plugins.files.data.Helper.File.isValidFilename(text)) {
					this.msgWarning(dgettext('plugin_files', 'Incorrect foldername'));
				} else if(alreadyExists) {
					this.msgWarning(dgettext('plugin_files', 'Folder already exists'));
				} else {
					var d = new Date();
					var nowUTC = d.getTime() + d.getTimezoneOffset()*60*1000;
					var data = {
						"filename" : text,
						"path" : path,
						"id" : path + text + "/", 
						"message_size" : "-1",
						"lastmodified" : nowUTC,
						"type" : Zarafa.plugins.files.data.FileTypes.FOLDER
					};

					var rec = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_FILES, data);

					model.getStore().add(rec);
					model.getStore().on("update", this.reloadCurrentDir, this, {single:true});
					model.getStore().commitChanges();
				}
			} catch (e) {
				this.msgWarning(e.message);
			}
		}
	},
	
	/**
	 * Move specified records to the new folder
	 * 
	 * @param records array of records
	 * @param destination record or id
	 * @param overwrite boolean flag - if true, existing dst records will be overwritten, default: true
	 */
	moveRecords : function(records, destination, overwrite) {
		overwrite = Ext.isDefined(overwrite) ? overwrite : false;
		var targetFolder = destination instanceof Zarafa.plugins.files.data.FilesRecord ? destination.get('id') : destination;
		
		if(!overwrite) {
			var ids = [];
			Ext.each(records, function(record) {
				ids.push(record.get('id'));
			});
			
			var fileStore = Zarafa.plugins.files.data.ComponentBox.getStore();
			
			fileStore.on('load', this.checkForDuplicate.createDelegate(this, [ids, fileStore.getPath()], true) , this, {single: true});
			fileStore.loadPath(targetFolder);
		} else {
			this.doMoveRecords("yes", null, null, ids, targetFolder);
		}
	},
	
	/**
	 * This function is called after the {@Zarafa.plugins.files.data.FilesStore} has loaded the target folder.
	 * It will check if one of the selected files already exists in the store. If there is a duplicate file
	 * a warning will be shown.
	 *
	 * @param {Ext.data.Store} store
	 * @param {Ext.data.Record[]} records The Records that were loaded
	 * @param {Object} options The loading options that were specified (see {@link #load} for details)
	 * @param {Array} files Array of {String} file-id's
	 * @private
	 */
	checkForDuplicate : function(store, records, options, files, originalPath) {
		// check if the selected file already exists
		var duplicateFiles = [];
		var destination = store.getPath();
		
		Ext.each(files, function(file){
			var recId = store.findExact("id", destination + file.split("/").pop());
			
			if(recId != -1) {
				duplicateFiles.push(store.getById(recId));
			}
		});
		
		store.loadPath(originalPath); // switch back to the source directory
		
		if(duplicateFiles.length > 0) {
			// Store already contains file - warn user.
			Ext.MessageBox.confirm(
				dgettext('plugin_files', 'Confirm overwrite'), 
				dgettext('plugin_files', 'File already exists. Do you want to overwrite it?'),
				this.doMoveRecords.createDelegate(this, [files, destination], true),
				this
			);
		} else {
			this.doMoveRecords("yes", null, null, files, destination);
		}
	},
	
	/**
	 * This function will actually move the given files to a new destination.
	 *
	 * @param {String} button If button is set it must be "yes" to move files.
	 * @param {String} value Unused
	 * @param {Object} options Unused
	 * @param {Array} files Array of {String} file-id's
	 * @param {String} destination Destination folder
	 * @private
	 */
	doMoveRecords : function (button, value, options, files, destination) {
		if(!Ext.isDefined(button) || button === "yes") {
			try {
				container.getRequest().singleRequest(
					'filesbrowsermodule',
					'move',
					{
						ids : files,
						overwrite : true,
						destination : destination,
						destinationIsFolder : true
					},
					new Zarafa.plugins.files.data.ResponseHandler({
						successCallback : this.moveRecordsDone.createDelegate(this, [true], true),
						failureCallback : this.moveRecordsDone.createDelegate(this, [false], true)
					})
				);
			} catch (e) {
				this.msgWarning(e.message);
				
				return false;
			}
		}
	},
	
	/**
	 * Function is called after successfull or unsuccessfull moving of records.
	 *
	 * @private
	 * @param {Object} response
	 * @param {Boolean} success
	 */
	moveRecordsDone : function (response, success) {
		if(!success) {
			Zarafa.common.dialogs.MessageBox.show({
				title   : dgettext('plugin_files', 'Error'),
				msg     : response.message,
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		}
		Zarafa.plugins.files.data.Actions.reloadCurrentDir();
	},
	
	/**
	 * Open a rename dialog and rename the item
	 * 
	 * @param {Zarafa.plugins.files.context.FilesContextModel} model
	 * @param {Zarafa.plugins.files.data.FilesRecord} record
	 */
	openRenameDialog : function (model, record) {
		Ext.MessageBox.prompt(dgettext('plugin_files', 'Rename'), dgettext('plugin_files', 'Please enter a new name'), this.doRename.createDelegate(this, [record], true), this, false, record.get('filename'));
	},
	
	/**
	 * Rename a record on the server
	 *
	 * @param {String} button The value of the button
	 * @param {String} text Inputfield value, new name
	 * @param {Object} options Unused
	 * @param {Zarafa.plugins.files.data.FilesRecord} record
	 * @private
	 */
	doRename : function (button, text, options, record) {
		if(button === "ok") {
			try {
				var path = record.get('path') === "/" ? "" : record.get('path');
				var isFolder = /\/$/.test(record.get('id')) ? "/" : "";
				
				// check if folder with same name already exists
				var alreadyExists = false;
				if(record.getStore().findExact("id", record.get('path') + text + isFolder) != -1) {
					alreadyExists = true;
				}
				
				// check if filename contains a / - if so, dont rename it
				if(!Zarafa.plugins.files.data.Helper.File.isValidFilename(text)) {
					this.msgWarning(dgettext('plugin_files', 'Incorrect filename'));
				} else if(alreadyExists) {
					this.msgWarning(/\/$/.test(record.get('id')) ? dgettext('plugin_files', 'Foldername already exists') : dgettext('plugin_files', 'Filename already exists'));
				} else {
					record.getStore().on('save', this.reloadCurrentDir, this, {single: true});

					record.beginEdit();
					record.set('filename', text);
					record.set('id', path + "/" + text + isFolder);
					record.endEdit();
				}				
			} catch (e) {
				this.msgWarning(e.message);
			}
		}
	},
	
	/**
	 * Does a full reload of both stores
	 *
	 */
	reloadCurrentDir : function () {
		Zarafa.plugins.files.data.ComponentBox.getStore().reload();
		this.refreshNavigatorTree();
	},
	
	/**
	 * Reloads the root node of the Treepanel
	 */
	reloadNavigatorTree : function () {
		var tree = Zarafa.plugins.files.data.ComponentBox.getNavigatorTreePanel();
		
		if(Ext.isDefined(tree)) {
			tree.setRootNode({
				nodeType: 'async',
				text: '/',
				id: '/',
				expanded : true
			});
		}
	},
	
	/**
	 * Clears the webdav request cache
	 * @param reaload if true, the gridstore will be reloaded, default: true
	 */
	clearCache : function(reload) {
		
		reload = Ext.isDefined(reload) ? reload : true;
		
		try {
			container.getRequest().singleRequest(
				'filesmodule',
				'clearcache',
				{},
				new Zarafa.plugins.files.data.ResponseHandler({
					successCallback : this.clearCacheDone.createDelegate(this, [reload], true)
				})
			);
		} catch (e) {
			this.msgWarning(e.message);
		}
	},
	
	/**
	 * Reloads the directory after clearing the cache.
	 *
	 * @private
	 * @param {Object} response
	 * @param {Boolean} reload If set to true the current directory will be reloaded.
	 */
	clearCacheDone : function (response, reload) {
		if(reload) {
			Zarafa.plugins.files.data.Actions.reloadCurrentDir();
		}
	},
	
	/**
	 * Download the selected items from files
	 *
	 * @param {Array} ids An array of ids
	 */
	downloadItem : function(records) {
		container.getNotifier().notify('info.files', dgettext('plugin_files', 'Downloading'), dgettext('plugin_files', 'Download started... please wait!'));
		
		var downloadFrame = Ext.getBody().createChild({
			tag: 'iframe',
			cls: 'x-hidden'
		});
		if(records.length == 1) {
			var url = this.getDownloadLink(records[0], false);
			downloadFrame.dom.contentWindow.location = url;
		} else if(records.length > 1) {
			var url = this.getDownloadLinkForMultipleFiles(records, false);
			downloadFrame.dom.contentWindow.location = url;
		}
	},
	
	/**
	 * Uploads the given files
	 *
	 * @param {Array} files An array of files
	 * @param {Object} store The destination {@Zarafa.plugins.files.data.FilesStore}
	 */
	uploadItem : function(files, store) {
		// Prepare the upload
		var destination = store.getPath();
		var parameters = {};
		var data = new FormData();
		var uploadfiles = [];
		
		parameters['attachments'] = files;
		parameters['parentID'] = destination;
		
		// check if file already exists on server
		var alreadyExists = false;
		var fileTooLarge = false;
		
		// show loading mask
		var loadingMask = new Ext.LoadMask(Zarafa.plugins.files.data.ComponentBox.getMainPanel().getEl(), {msg:dgettext('plugin_files', 'Uploading files') + '...'});
		loadingMask.show();
		
		// Convert the parameters into FormData
		for (var key in parameters) {
			var value = parameters[key];
			if (Ext.isArray(value) || value instanceof FileList) {
				for (var i = 0, len = value.length; i < len; i++) {
					
					if(store.findExact("id", destination + value[i].name) != -1) {
						alreadyExists = true;
					}
					data.append(key + '[]', value[i]);
					
					if(value[i].size > Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize()) {
						fileTooLarge = true;
					}
				}
			} else {
				data.append(key, value);
			}
		}
		
		if(fileTooLarge) {
			// show a warning to the user
			Zarafa.common.dialogs.MessageBox.show({
				title : dgettext('plugin_files', 'Error'),
				msg : String.format(dgettext('plugin_files', 'File is too large! Maximum allowed filesize: {0}.'), Zarafa.plugins.files.data.Helper.Format.fileSize(Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize())),
				icon : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
			loadingMask.hide();
		} else {
			if(alreadyExists) {
				// Store already contains file - warn user.
				Ext.MessageBox.confirm(
					dgettext('plugin_files', 'Confirm overwrite'), 
					dgettext('plugin_files', 'File already exists. Do you want to overwrite it?'),
					this.doUpload.createDelegate(this, [data, loadingMask], true),
					this
				);
			} else {
				this.doUpload("yes", null, null, data, loadingMask);
			}
		}
	},
	
	/**
	 * Actually uploads the file to the server.
	 *
	 * @private
	 * @param {String} button
	 * @param {String} value Unused
	 * @param {Object} options Unused
	 * @param {FormData} data
	 * @param {Ext.LoadMask} loadingMask
	 */
	doUpload : function (button, value, options, data, loadingMask) {
		if(!Ext.isDefined(button) || button === "yes") {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "plugins/files/php/upload_file.php", true);
			xhr.addEventListener('load',this.uploadDone.createDelegate(xhr, [loadingMask], true), false);
			xhr.upload.addEventListener('progress',this.updateUploadProgress.createDelegate(this, [loadingMask], true), false);
			xhr.send(data);
		} else {
			loadingMask.hide();
		}
	},
	
	/**
	 * Functionc called on progress update of the XMLHttpRequest
	 *
	 * @private
	 * @param {Object} evt
	 * @param {Ext.LoadMask} loadingMask
	 */
	updateUploadProgress : function(evt, loadingMask){
	   if (evt.lengthComputable) {  
			//evt.loaded the bytes browser receive
			//evt.total the total bytes seted by the header
			var percentComplete = Math.round((evt.loaded / evt.total)*100);
			loadingMask.hide();
			if(percentComplete < 100) {
				loadingMask.msg = dgettext('plugin_files', 'Uploaded') + " " + percentComplete + "%";
			} else {
				loadingMask.msg = dgettext('plugin_files', 'Storing file on backend. Please wait') + "...";
			}
			loadingMask.show();
	   } 
	},
	
	/**
	 * Called after the file has been uploaded.
	 *
	 * @private
	 * @param {Object} event
	 * @param {Ext.LoadMask} loadingMask
	 */
	uploadDone : function(event, loadingMask) {
		if (this.status == 200) {
			Zarafa.plugins.files.data.Actions.clearCache();
		}
		loadingMask.hide();
	},
	
	/**
	 * Returns a download link for the client.
	 *
	 * @param {Zarafa.plugins.files.data.FilesRecord} record a file record
	 * @param {Boolean} inline (optional)
	 * @return {String}
	 */
	getDownloadLink : function(record, inline) {
		return (Ext.isDefined(inline) && inline == false) ? record.getAttachmentUrl() : record.getInlineImageUrl();
	},
	
	/**
	 * Returns a download link for the client to download multiple items.
	 *
	 * @param {Array} records a array of {Zarafa.plugins.files.data.FilesRecord}
	 * @return {String}
	 */
	getDownloadLinkForMultipleFiles : function(records) {
		var link = "";
		
		var url = document.URL;
		link = url.substring(0, url.lastIndexOf('/') + 1); // we need the absolute url for jwplayer...
		
		var ids = [];
		
		link += "plugins/files/php/proxy.php"; 
		Ext.each(records, function(record, index) {
			link = Ext.urlAppend(link, "ids[" + index + "]=" + encodeURIComponent(record.get("id")));
		});
		
		link = Ext.urlAppend(link, "inline=false");

		return link;
	},
	
	/**
	 * This will display a messagebox with warning icons to the user.
	 *
	 * @param {String} errorMessage The error message to display
	 */
	msgWarning : function (errorMessage) {
		Zarafa.common.dialogs.MessageBox.show({
			title   : dgettext('plugin_files', 'Warning'),
			msg     : errorMessage,
			icon    : Zarafa.common.dialogs.MessageBox.WARNING,
			buttons : Zarafa.common.dialogs.MessageBox.OK
		});
	}
};
