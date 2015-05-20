Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedAttachmentRecordFields
 *
 * Array of additional fields for the custom ZARAFA_SPREED_ATTACHMENT object.
 * These fields allow us to track from which IPMRecord we have copied this record
 * and thus will let us to copy the attachment from IPMRecord on server.
 *
 */
Zarafa.plugins.spreed.data.SpreedAttachmentRecordFields = [
	{name : 'original_record_entry_id', type : 'string', defaultValue : ''},
	{name : 'original_record_store_entry_id', type : 'string', defaultValue : ''},
	{name : 'original_attach_num', type : 'int'},
	{name : 'original_attachment_store_id', type : 'string', defaultValue : ''}
];

Zarafa.core.data.RecordCustomObjectType.addProperty('ZARAFA_SPREED_ATTACHMENT');
Zarafa.core.data.RecordFactory.setBaseClassToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_ATTACHMENT, Zarafa.core.data.IPMAttachmentRecord);
Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_ATTACHMENT, Zarafa.plugins.spreed.data.SpreedAttachmentRecordFields);
Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_ATTACHMENT, Zarafa.core.data.IPMAttachmentRecordFields);
