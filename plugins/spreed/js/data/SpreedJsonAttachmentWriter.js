Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedJsonAttachmentWriter
 * @extends Zarafa.core.data.JsonAttachmentWriter
 */
Zarafa.plugins.spreed.data.SpreedJsonAttachmentWriter = Ext.extend(Zarafa.core.data.JsonAttachmentWriter, {
	/**
	 * Similar to {@link Zarafa.core.data.JsonAttachmentWriter#toHash}.
	 * Here we serializing only the data of the records in spreed attachment store.
	 * Note that we serialize all the records - not only removed or modified.
	 *
	 * @param {Ext.data.Record} record The record to hash
	 * @return {Object} The hashed object
	 * @override
	 * @private
	 */
	toPropHash : function(record)
	{
		var attachmentStore = record.getAttachmentStore();
		var hash = {};

		if (!Ext.isDefined(attachmentStore))
			return hash;

		// Overwrite previous definition to something we can work with.
		hash.attachments = {};
		hash.attachments.dialog_attachments = attachmentStore.getId();

		var attachmentRecords = attachmentStore.getRange();
		Ext.each(attachmentRecords, function(attach) {
			if (!Ext.isDefined(hash.attachments.add)) {
				hash.attachments.add = [];
			}
			var data = attach.data;
			hash.attachments.add.push(data);
		}, this);

		return hash;
	}
});
