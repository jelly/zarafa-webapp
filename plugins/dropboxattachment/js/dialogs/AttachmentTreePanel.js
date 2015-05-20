Ext.namespace('Zarafa.plugins.dropboxattachment.dialogs');

/**
 * @class Zarafa.plugins.dropboxattachment.dialogs.AttachmentTreePanel
 * @extends Ext.tree.TreePanel
 * Shows tree of all user files from Dropbox
 */
Zarafa.plugins.dropboxattachment.dialogs.AttachmentTreePanel = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config)
	{
		config = config || {};
		Ext.applyIf(config, {
			root: {
				nodeType: 'async',
				text: '/',
				id: 'root',
				expanded : true
			},
			autoScroll: true,
			viewConfig: {
				style	:	{ overflow: 'auto', overflowX: 'hidden' }
			},
			maskDisabled: true,
			loader : new Zarafa.plugins.dropboxattachment.data.TreeLoader(),
			buttons : [
				this.createActionButtons()
			]
		});
		Zarafa.plugins.dropboxattachment.dialogs.AttachmentTreePanel.superclass.constructor.call(this, config);
	},

	/**
	 * Creates action button for adding file
	 * from Dropbox to email as attachment
	 * @return {Array}
	 * @private
	 */
	createActionButtons : function()
	{
		return [{
			xtype   : 'button',
			text    : _('Add Attachment'),
			tooltip : {
				title   : _('Add Attachment'),
				text    : _('Add selected attachment from dropbox to email attachment.')
			},
			width	: 120,
			iconCls : 'icon_dropbox',
			handler : this.downloadSelectedFilesFromDropboxToTmp,
			scope   : this
		}];
	},

	/**
	 * Sends a query with ids of selected files from user's Dropbox folder
	 * @private
	 */
	downloadSelectedFilesFromDropboxToTmp : function()
	{
		var selectedNodes =  this.dialog.treePanel.getChecked();
		var idsList = [];
		var emailRecord = this.dialog.record;
		var attachmentStore = emailRecord.getAttachmentStore();

		Ext.each(selectedNodes, function(node, index) {
			idsList.push( node.id );
		});

		try {
			this.dialog.treePanel.disable();
			container.getRequest().singleRequest(
				'dropboxmodule',
				'download-to-tmp',
				{
					ids : idsList,
					dialog_attachments: attachmentStore.getId()
				},
				new Zarafa.plugins.dropboxattachment.data.ResponseHandler({
					successCallback : this.addDownloadedFilesAsAttachmentToEmail.createDelegate(this)
				})
			);
		} catch (e) {
			Ext.MessageBox.show({
				title   : _('Warning'),
				msg     : e.getMessage(),
				icon    : Ext.MessageBox.WARNING,
				buttons : Ext.MessageBox.OK
			});
		}
	},

	/**
	 * Converts received file information to attachment record
	 * @param {Object} downloadedFileInfo
	 * @private
	 */
	convertDownloadedFileInfoToAttachmentRecord : function(downloadedFileInfo)
	{
		var attachmentRecord = Zarafa.core.data.RecordFactory.createRecordObjectByObjectType(Zarafa.core.mapi.ObjectType.MAPI_ATTACH);

		attachmentRecord.set('tmpname', downloadedFileInfo.tmpname);
		attachmentRecord.set('name', downloadedFileInfo.name);
		attachmentRecord.set('size', downloadedFileInfo.size);
		return attachmentRecord;
	},

	/**
	 * Adds files received from the user's Dropbox folder to
	 * the email as attachments
	 * @param {Object} downloadedFilesInfoArray
	 * @private
	 */
	addDownloadedFilesAsAttachmentToEmail : function(downloadedFilesInfoArray)
	{
		var emailRecord = this.dialog.record;
		var attachmentStore = emailRecord.getAttachmentStore();

		var attachmentRecord = null;
		Ext.each(downloadedFilesInfoArray, function(downloadedFileInfo, index) {
			attachmentRecord = this.convertDownloadedFileInfoToAttachmentRecord(downloadedFileInfo);
			attachmentStore.add(attachmentRecord);
		}, this);
		this.dialog.close();
	}
});

Ext.reg('dropboxattachment.treepanel', Zarafa.plugins.dropboxattachment.dialogs.AttachmentTreePanel);
