Ext.namespace('Zarafa.plugins.files');

/**
 * @class Zarafa.plugins.files.FilesRcvAttachmentPlugin
 * @extends Zarafa.core.Plugin
 * This class is used for adding files from the users's Files folder
 * to his efiless as attachments
 */
Zarafa.plugins.files.SaveToFilesPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		Zarafa.plugins.files.SaveToFilesPlugin.superclass.constructor.call(this, config);
	},

	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function() {
		Zarafa.plugins.files.SaveToFilesPlugin.superclass.initPlugin.apply(this, arguments);
		
		/* store attachments in files */
		this.registerInsertionPoint('common.contextmenu.attachment.actions', this.createAttachmentUploadInsertionPoint, this);
		this.registerInsertionPoint('context.mail.contextmenu.actions', this.createEmailUploadInsertionPoint, this);

		Zarafa.core.data.SharedComponentType.addProperty('common.dialog.attachments.savetofiles');
	},

	/**
	 * Insert files option in all attachment suggestions
	 * @return {Array}
	 * @private
	 */
	createAttachmentUploadInsertionPoint : function(include, btn) {
		return {
			text : container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'),
			handler : this.showFilesUploadAttachmentDialog.createDelegate(this, [btn]),
			scope: this,
			iconCls: 'icon_files_category'
		};
	},

	/**
	 * This method hooks to the email context menu and allows users to store emails from
	 * to the  Files plugin.
	 *
	 * @param include
	 * @param btn
	 * @returns {Object}
	 */
	createEmailUploadInsertionPoint: function (include, btn) {
		return {
			text: dgettext('plugin_files', 'Add to Files'),
			handler: this.showFilesUploadEmailDialog.createDelegate(this, [btn]),
			scope: this,
			iconCls: 'icon_files_category'
		};
	},

	/**
	 * Display a loading dialog with moving progress bar
	 * @private
	 */
	showLoadingBar: function() {
		Zarafa.common.dialogs.MessageBox.show({
			title: dgettext('plugin_files', 'Please wait'),
			msg: dgettext('plugin_files', 'Loading attachment') + '...',
			progressText: dgettext('plugin_files', 'Initializing') + '...',
			width:300,
			wait:true,
			waitConfig: {interval:200},
			closable:false
		});
	},

	/**
	 * This method will open the {@link Zarafa.plugins.files.ui.dialogs.SaveToFilesContentPanel folder chooser panel}.
	 *
	 * @param btn
	 */
	showFilesUploadAttachmentDialog: function (btn) {

		var attachmentRecord = btn.records;
		var attachmentStore = attachmentRecord.store;

		var store = attachmentStore.getParentRecord().get('store_entryid');
		var entryid = attachmentStore.getAttachmentParentRecordEntryId();
		var attachNum = new Array(1);
		if (attachmentRecord.get('attach_num') != -1)
			attachNum[0] = attachmentRecord.get('attach_num');
		else
			attachNum[0] = attachmentRecord.get('tmpname');
		var dialog_attachments = attachmentStore.getId();
		var filename = attachmentRecord.get('name');

		jsonRecords = new Array();
		jsonRecords[0] = {
			entryid: entryid,
			store: store,
			attachNum: attachNum,
			dialog_attachments: dialog_attachments,
			filename: filename
		};

		var configRecord = {
			items: jsonRecords,
			type: "attachment",
			count: jsonRecords.length
		};

		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.dialog.attachments.savetofiles'], configRecord, {
			title: String.format(dgettext('plugin_files', 'Add attachment to {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			manager: Ext.WindowMgr
		});
	},

	/**
	 * This method will open the {@link Zarafa.plugins.files.ui.dialogs.SaveToFilesContentPanel folder chooser panel}.
	 *
	 * @param btn
	 */
	showFilesUploadEmailDialog: function (btn) {
		/* store the eml to a temporary folder and prepare it for uploading */
		var emailRecord = btn.records;

		var records = [].concat(emailRecord);

		var jsonRecords = new Array();
		for (var i = 0, len = records.length; i < len; i++) {
			jsonRecords[i] = {
				store: records[i].get('store_entryid'),
				entryid: records[i].get('entryid'),
				filename: (Ext.isEmpty(records[i].get('subject')) ? _('Untitled') : records[i].get('subject')) + ".eml"
			};
		}

		var configRecord = {
			items: jsonRecords,
			type: "mail",
			count: jsonRecords.length
		};

		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.dialog.attachments.savetofiles'], configRecord, {
			title: String.format(dgettext('plugin_files', 'Add email to {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
			manager: Ext.WindowMgr
		});
	},

	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * This will bid on common.dialog.attachments.savetofiles
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Object} response Optionally passed response.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, response) {
		var bid = -1;
		
		switch(type) {
			case Zarafa.core.data.SharedComponentType['common.dialog.attachments.savetofiles']:
				bid = 1;
				break;
		}
		
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Object} response Optionally passed response.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent : function(type, response) {
		var component;

		switch(type) {
			case Zarafa.core.data.SharedComponentType['common.dialog.attachments.savetofiles']:
				component = Zarafa.plugins.files.dialogs.SaveToFilesContentPanel;
				break;
		}

		return component;
	}
});

Zarafa.onReady(function() {
	if(Ext.isDefined(container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'))) { // check if user store is initialised
		if(container.getSettingsModel().get('zarafa/v1/plugins/files/enable') === true) { // make sure that the master plugin is enabled
			container.registerPlugin(new Zarafa.core.PluginMetaData({
				name : 'savetofiles',
				allowUserVisible : false,
				displayName : String.format(dgettext('plugin_files', 'Save received attachments to {0}'), container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')),
				pluginConstructor : Zarafa.plugins.files.SaveToFilesPlugin
			}));
		}
	}
});