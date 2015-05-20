Ext.namespace('Zarafa.plugins.files.dialogs');

/**
 * @class Zarafa.plugins.files.dialogs.SaveToFilesTreePanel
 * @extends Ext.tree.TreePanel
 * @xtype Zarafa.plugins.files.savetofilestreepanel
 *
 * Shows tree of all user files from Files
 */
Zarafa.plugins.files.dialogs.SaveToFilesTreePanel = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * Holds the selected folder, in which the attachment will be stored
	 */
	selectedFolder : null,
	
	/**
	 * The response object from the content panel
	 */
	response : null,

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		this.response = config.response;
		
		Ext.applyIf(config, {
			root: {
				nodeType: 'async',
				text: '/',
				id: '/',
				expanded : true
			},
			autoScroll: true,
			viewConfig: {
				style	:	{ overflow: 'auto', overflowX: 'hidden' }
			},
			maskDisabled: true,
			listeners: {
				click: function(n) {
					this.selectedFolder = n.attributes.id;
				}
			},
			loader : new Zarafa.plugins.files.data.DirectoryLoader({loadfiles: false}),
			buttons : [
				this.createActionButtons()
			]
		});
		Zarafa.plugins.files.dialogs.SaveToFilesTreePanel.superclass.constructor.call(this, config);
	},

	/**
	 * Creates action button for adding file
	 * from Files to email as attachment
	 * @return {Array}
	 * @private
	 */
	createActionButtons : function() {
		return [{
			xtype   : 'button',
			text    : dgettext('plugin_files', 'New folder'),
			tooltip : {
				title   : dgettext('plugin_files', 'New folder'),
				text    : dgettext('plugin_files', 'Create a new folder') 
			},
			handler : this.newFolder,
			scope   : this
		},
		{
			xtype   : 'button',
			text    : '&nbsp;&nbsp;&nbsp;&nbsp;' + dgettext('plugin_files', 'Save'),
			tooltip : {
				title   : dgettext('plugin_files', 'Store attachment'),
				text    : String.format(dgettext('plugin_files', 'Store attachment to the selected {0} folder.'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'))
			},
			iconCls : 'icon_files_category',
			handler : this.uploadFile,
			scope   : this
		}];
	},

	/**
	 * Uploads the prepared attachment to Files
	 * @private
	 */
	uploadFile : function() {
		if(!Ext.isDefined(this.selectedFolder) || Ext.isEmpty(this.selectedFolder)) {
			Zarafa.plugins.files.data.Actions.msgWarning(dgettext('plugin_files', 'You have to choose a folder!'));
		} else {
			// create array to check for dups
			var checkMe = new Array();
			for (var i = 0, len = this.response.count; i < len; i++) {
				checkMe[i] = {
					id: (this.selectedFolder + this.response.items[i].filename),
					isFolder: false
				};
			}

			try {
				container.getRequest().singleRequest(
					'filesmodule',
					'checkifexists',
					{
						records: checkMe,
						destination: this.selectedFolder
					},
					new Zarafa.plugins.files.data.ResponseHandler({
						successCallback : this.checkForDuplicateFileDone.createDelegate(this)
					})
				);
			} catch (e) {
				Zarafa.plugins.files.data.Actions.msgWarning(e.message);
				
				return false;
			}
		}
	},
	
	/**
	 * Upload done =)
	 * @param {Object} response
	 * @private
	 */
	uploadDone : function(response) {
		if(response.status === true)
			container.getNotifier().notify('info.files', dgettext('plugin_files', 'Uploaded'), String.format(dgettext('plugin_files', 'Attachment successfully stored to {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')));
		else
			container.getNotifier().notify('error', dgettext('plugin_files', 'Upload Failed'), String.format(dgettext('plugin_files', 'Attachment could not be stored in {0}! Error:'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')) + ' ' + response.status);

		this.dialog.close();
	},	
	
	/**
	 * Creates a new files folder
	 * @private
	 */
	newFolder : function() {
		if(!Ext.isDefined(this.selectedFolder) || Ext.isEmpty(this.selectedFolder)) {
			Zarafa.plugins.files.data.Actions.msgWarning(dgettext('plugin_files', 'You have to choose a folder!'));
		} else {
			Zarafa.common.dialogs.MessageBox.prompt(dgettext('plugin_files', 'Folder Name'), dgettext('plugin_files', 'Please enter a foldername'), this.checkForDuplicateFolder, this);
		}
	},
	
	/**
	 * This function is called after the {@Zarafa.plugins.files.data.FilesStore} has loaded the target folder.
	 * It will check if one of the selected files already exists in the store. If there is a duplicate file
	 * a warning will be shown.
	 *
	 * @param {String} button
	 * @param {String} text Text that was entered in the input box
	 * @private
	 */
	checkForDuplicateFolder : function(button, text) {
		if(button === "ok") {
			// check if foldername contains a / - if so, dont rename it
			if(!Zarafa.plugins.files.data.Helper.File.isValidFilename(text)) {
				Zarafa.plugins.files.data.Actions.msgWarning(dgettext('plugin_files', 'Incorrect foldername'));
			} else {
				try {
					container.getRequest().singleRequest(
						'filesmodule',
						'checkifexists',
						{
							id : this.selectedFolder + text,
							isfolder : true
						},
						new Zarafa.plugins.files.data.ResponseHandler({
							successCallback : this.checkForDuplicateFolderDone.createDelegate(this, [text], true)
						})
					);
				} catch (e) {
					Zarafa.plugins.files.data.Actions.msgWarning(e.message);
					
					return false;
				}
			}
		}
	},
	
	/**
	 * Function is called after completing the duplicate check for a folder.
	 *
	 * @param {Object} response
	 * @param {Object} foldername New foldername that will be created if no duplicate was found
	 * @private
	 */
	checkForDuplicateFolderDone : function (response, foldername) {
		if(response.duplicate === false) {
			this.createRemoteFolder(foldername);
		} else {
			Zarafa.plugins.files.data.Actions.msgWarning(dgettext('plugin_files', 'Folder already exists'));
		}
	},
	
	/**
	 * Function is called after completing the duplicate check.
	 *
	 * @param {Object} response
	 * @private
	 */
	checkForDuplicateFileDone : function (response) {
		if(response.duplicate === false) {
			this.doUpload();
		} else {
			Ext.MessageBox.confirm(
				dgettext('plugin_files', 'Confirm overwrite'), 
				dgettext('plugin_files', 'File already exists. Do you want to overwrite it?'),
				this.doUpload,
				this
			);
		}
	},
	
	/** 
	 * Start uploading the selected file to the backend.
	 *
	 * @param {String} button If button is set it must be "yes" to start the upload.
	 * @private
	 */
	doUpload : function (button) {
		if(!Ext.isDefined(button) || button === "yes") {
			container.getNotifier().notify('info.files', dgettext('plugin_files', 'Uploading...'), dgettext('plugin_files', 'Please be patient while the files are uploaded...'));
			try {
				this.disable();
				container.getRequest().singleRequest(
					'filesmodule',
					'uploadtooc',
					{
						items: this.response.items,
						count: this.response.count,
						type: this.response.type,
						destdir: this.selectedFolder
					},
					new Zarafa.plugins.files.data.ResponseHandler({
						successCallback : this.uploadDone.createDelegate(this)
					})
				);
			} catch (e) {
				Zarafa.plugins.files.data.Actions.msgWarning(e.message);
			}
		}
	},
	
	/**
	 * This function will create a new folder on the backend.
	 *
	 * @param {Object} foldername New foldername that will be created
	 * @private
	 */
	createRemoteFolder : function (foldername) {
		try {
			container.getRequest().singleRequest(
				'filesmodule',
				'createdir',
				{
					dirname : this.selectedFolder + foldername,
					basedir : this.selectedFolder
				},
				new Zarafa.plugins.files.data.ResponseHandler({
					successCallback : this.createDirDone.createDelegate(this)
				})
			);
		} catch (e) {
			Zarafa.plugins.files.data.Actions.msgWarning(e.message);
		}
	},
	
	/**
	 * Function is called after a directory has been created on the server.
	 *
	 * @param {Object} response
	 * @private
	 */
	createDirDone : function(response) {
		if(response.status === true) {
			container.getNotifier().notify('info.files', dgettext('plugin_files', 'Created'), dgettext('plugin_files', 'Directory created!'));

			var node = this.getNodeById(response.basedir);
		
			if(Ext.isDefined(node)) {
				if(!node.isLeaf()) {
					node.reload();
				} else {
					var currentfolder = (response.basedir.substr(-1) == '/') ? response.basedir.substr(0, response.basedir.length - 1) : response.basedir;
					var parentnode = this.getNodeById(currentfolder.match( /.*\// )); // load parent pathname
					if(Ext.isDefined(parentnode)) {
						parentnode.on("expand", this.reloadParentDone.createDelegate(this, [response.basedir]), this, {single: true});						
						parentnode.reload();
					}
				}
			}
		} else {
			container.getNotifier().notify('error', dgettext('plugin_files', 'Creation failed'), dgettext('plugin_files', 'Directory not created!'));
		}
	},
	
	/**
	 * This function is called after the parentnode has been reloaded.
	 * It is used to select a subnode of the parent node and expand it.
	 *
	 * @private
	 * @param {String} subnode Foldername of the subnode to expand
	 */
	reloadParentDone : function (subnode) {
		var node = this.getNodeById(subnode);
		
		if(Ext.isDefined(node)) {
			node.expand();
		}
	}
});

Ext.reg('Zarafa.plugins.files.savetofilestreepanel', Zarafa.plugins.files.dialogs.SaveToFilesTreePanel);
