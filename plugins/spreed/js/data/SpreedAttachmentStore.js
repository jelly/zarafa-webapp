Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedAttachmentStore
 * @extends Zarafa.core.data.IPMAttachmentStore
 *
 * We extends IPMAttachmentStore to allow using our custom record type in AttachmentJsonReader
 * and override IPMAttachmentJsonWriter with our custom JsonWriter which will allow us to
 * send the serialized custom attachment records to server.
 */
Zarafa.plugins.spreed.data.SpreedAttachmentStore = Ext.extend(Zarafa.core.data.IPMAttachmentStore, {

	/**
	 * @constructor
	 * @param config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		var customRecordClass = Zarafa.core.data.RecordFactory.getRecordClassByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_ATTACHMENT);
		Ext.applyIf(config, {
			reader : new Zarafa.core.data.JsonAttachmentReader({dynamicRecord : false}, customRecordClass),
			writer : new Zarafa.plugins.spreed.data.SpreedJsonAttachmentWriter()
		});

		Zarafa.plugins.spreed.data.SpreedAttachmentStore.superclass.constructor.call(this, config);
	},


	/**
	 * This function tries to fill in the parametrs that are used on
	 * server side so server can understand where from comes the attachment -
	 * mailDailog, spreeddialog or smth else
	 * @param {Zarafa.plugins.spreed.data.SpreedAttachmentRecord} attachmentRecord
	 */
	getAttachmentBaseUrl : function(attachmentRecord)
	{
		var url = 'index.php?load=download_attachment';
		var originalRecordEntryId = attachmentRecord.get('original_record_entry_id');
		var originalRecordStoreEntryId = attachmentRecord.get('original_record_store_entry_id');

		var dialogAttachments = null;
		var entryId = null;
		var storeId = null;
		var attachNum = null;

		//Check if user clicked on the currently uploaded from Spreed Dialog attachment
		// or on copied from selected message record.
		if( Ext.isEmpty(originalRecordEntryId) && Ext.isEmpty(originalRecordStoreEntryId) ) {// Original attachment
			entryId = this.getAttachmentParentRecordEntryId();
			storeId = this.getParentRecord().get('store_entryid');
			dialogAttachments = this.getId();
			attachNum = attachmentRecord.get('attach_num');
		} else {
			entryId = originalRecordEntryId;
			storeId = originalRecordStoreEntryId;
			dialogAttachments = attachmentRecord.get('original_attachment_store_id');
			attachNum = attachmentRecord.get('original_attach_num');
		}

		url = Ext.urlAppend(url, 'dialog_attachments=' + dialogAttachments);
		url = Ext.urlAppend(url, 'store='   + storeId);
		url = Ext.urlAppend(url, 'entryid=' + entryId);
		if (attachmentRecord.get('attach_num') != -1)
			url = Ext.urlAppend(url, 'attachNum[]=' + attachNum);
		else
			url = Ext.urlAppend(url, 'attachNum[]=' + attachmentRecord.get('tmpname'));

		return url;
	}

});

Ext.reg('spreed.attachmentstore', Zarafa.plugins.spreed.data.SpreedAttachmentStore);
