Ext.namespace('Zarafa.plugins.files.dialogs');

/**
 * @class Zarafa.plugins.files.dialogs.AttachFromFilesTreePanel
 * @extends Ext.tree.TreePanel
 * @xtype Zarafa.plugins.files.attachfromfilestreepanel
 *
 * Shows tree of all user files from Files
 */
Zarafa.plugins.files.dialogs.AttachFromFilesTreePanel = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * Global Email Record
	 * only set via webdav browser
	 */
	emailRecord : undefined,

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		
		if(Ext.isDefined(config.emailrecord)) 
			this.emailRecord = config.emailrecord;
			
		Ext.applyIf(config, {
			root: {
				nodeType: 'async',
				text: '/',
				id: '/',
				expanded : true
			},
			autoScroll: true,
			viewConfig: {
				style : { overflow: 'auto', overflowX: 'hidden' }
			},
			maskDisabled: true,
			loader : new Zarafa.plugins.files.data.DirectoryLoader({loadfiles: true}),
			buttons : [
				this.createActionButtons()
			]
		});
		Zarafa.plugins.files.dialogs.AttachFromFilesTreePanel.superclass.constructor.call(this, config);
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
			text    : '&nbsp;&nbsp;&nbsp;&nbsp;' + dgettext('plugin_files', 'Add attachment'),
			tooltip : {
				title : dgettext('plugin_files', 'Add attachment'),
				text  : dgettext('plugin_files', 'Add selected attachment from files to email attachment.')
			},
			iconCls : 'icon_files_category',
			handler : this.downloadSelectedFilesFromFilesToTmp,
			scope   : this
		}];
	},

	/**
	 * Sends a query with ids of selected files from user's Files folder
	 * @private
	 */
	downloadSelectedFilesFromFilesToTmp : function() {
		var selectedNodes =  this.getChecked();
		var idsList = [];
		var emailRecord = this.dialog.record;
		
		if(Ext.isDefined(this.emailRecord))
			emailRecord = this.emailRecord;
		
		var attachmentStore = emailRecord.getAttachmentStore();
		var max_file_size = container.getSettingsModel().get('zarafa/v1/main/attachments/max_attachment_size');
		
		var size_exceeded = false;
		
		Ext.each(selectedNodes, function(node, index) {
			if(node.attributes.filesize > max_file_size) {
				Zarafa.common.dialogs.MessageBox.show({
					title : dgettext('plugin_files', 'Warning'),
					msg : String.format(dgettext('plugin_files', 'The file {0} is too large!'), node.attributes.filename) + ' (' + dgettext('plugin_files', 'max') + ': ' + Ext.util.Format.fileSize(max_file_size) + ')',
					icon : Zarafa.common.dialogs.MessageBox.WARNING,
					buttons : Zarafa.common.dialogs.MessageBox.OK
				});
				size_exceeded = true;
				return false;
			}
			idsList.push( node.id );
		});
		
		if(!size_exceeded) {
			if(idsList.length < 1) {
				Zarafa.common.dialogs.MessageBox.show({
					title : dgettext('plugin_files', 'Warning'),
					msg : dgettext('plugin_files', 'You have to choose at least one file!'),
					icon : Zarafa.common.dialogs.MessageBox.WARNING,
					buttons : Zarafa.common.dialogs.MessageBox.OK
				});
			} else {
				try {
					this.disable();
					container.getRequest().singleRequest(
						'filesmodule',
						'download-to-tmp',
						{
							ids : idsList,
							dialog_attachments: attachmentStore.getId()
						},
						new Zarafa.plugins.files.data.ResponseHandler({
							successCallback : this.addDownloadedFilesAsAttachmentToEmail.createDelegate(this)
						})
					);
				} catch (e) {
					Zarafa.common.dialogs.MessageBox.show({
						title : dgettext('plugin_files', 'Warning'),
						msg : e.getMessage(),
						icon : Zarafa.common.dialogs.MessageBox.WARNING,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
				}
			}
		}
	},

	/**
	 * Converts received file information to attachment record
	 * @param {Object} downloadedFileInfo
	 * @private
	 */
	convertDownloadedFileInfoToAttachmentRecord : function(downloadedFileInfo) {
		var attachmentRecord = Zarafa.core.data.RecordFactory.createRecordObjectByObjectType(Zarafa.core.mapi.ObjectType.MAPI_ATTACH);

		attachmentRecord.set('tmpname', downloadedFileInfo.tmpname);
		attachmentRecord.set('name', downloadedFileInfo.name);
		attachmentRecord.set('size', downloadedFileInfo.size);
		return attachmentRecord;
	},

	/**
	 * Adds files received from the user's Files folder to
	 * the email as attachments
	 * @param {Array} downloadedFilesInfoArray
	 * @private
	 */
	addDownloadedFilesAsAttachmentToEmail : function(downloadedFilesInfoArray) {
		var emailRecord = this.dialog.record;
		if(Ext.isDefined(this.emailRecord))
			emailRecord = this.emailRecord;
			
		var attachmentStore = emailRecord.getAttachmentStore();

		var attachmentRecord = null;
		Ext.each(downloadedFilesInfoArray, function(downloadedFileInfo, index) {
			attachmentRecord = this.convertDownloadedFileInfoToAttachmentRecord(downloadedFileInfo);
			attachmentStore.add(attachmentRecord);
		}, this);
		this.dialog.close();
	}
});

Ext.reg('Zarafa.plugins.files.attachfromfilestreepanel', Zarafa.plugins.files.dialogs.AttachFromFilesTreePanel);
