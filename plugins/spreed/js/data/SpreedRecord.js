Ext.namespace('Zarafa.plugins.spreed.data');



/**
 * @class Zarafa.plugins.spreed.data.SpreedRecordFields
 * Array of additional fields for the {@link Zarafa.plugins.spreed.data.SpreedRecord} object.
 */
Zarafa.plugins.spreed.data.SpreedRecordFields = [
	{name: 'subject', type: 'string', defaultValue: ''},
	{name: 'start_time', type: 'date', dateFormat: 'timestamp', defaultValue: null},
	{name: 'end_time', type: 'date', dateFormat: 'timestamp', defaultValue: null},
	{name: 'description', type: 'string', defaultValue: ''},
	{name: 'timezone', type: 'string'},
	//will be filled when the record will be created on server
	{name: 'checkin_url', type: 'string', defaultValue: ''}

];

Zarafa.core.data.RecordCustomObjectType.addProperty('ZARAFA_SPREED');
Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, Zarafa.plugins.spreed.data.SpreedRecordFields);

Zarafa.core.data.RecordFactory.setSubStoreToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, 'recipients', Zarafa.plugins.spreed.data.SpreedParticipantStore);
Zarafa.core.data.RecordFactory.setSubStoreToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, 'attachments', Zarafa.plugins.spreed.data.SpreedAttachmentStore);

Zarafa.core.data.RecordFactory.addListenerToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, 'createphantom', function(record)
{
	var settings = container.getSettingsModel();

	// Phantom records must always be marked as opened (they contain the full set of data)
	record.afterOpen();

	if (Ext.isEmpty(record.get('timezone'))) {
		record.set('timezone', settings.get('zarafa/v1/plugins/spreed/default_timezone'));
	}

	// If no appointment date was selected, we just calculate the default
	if (!Ext.isDate(record.get('start_time')) || !Ext.isDate(record.get('end_time'))) {
		var delay = settings.get('zarafa/v1/contexts/calendar/default_zoom_level');

		var startTime = new Date().ceil(Date.MINUTE, delay).fromUTC();
		var duration = settings.get('zarafa/v1/contexts/calendar/default_appointment_period');
		var endTime = startTime.add(Date.MINUTE, duration);

		record.set('start_time', startTime);
		record.set('end_time', endTime);
	}
});

/**
 * @class Zarafa.plugins.spreed.data.SpreedRecord
 * @extends Zarafa.core.data.IPMRecord
 *
 * An extension to the {@link Zarafa.core.data.IPMRecord} specific to Spreed Request/Response Messages.
 */
Zarafa.plugins.spreed.data.SpreedRecord = Ext.extend(Zarafa.core.data.IPMRecord, {

	/**
	 * The base array of ID properties which is copied to the {@link #idProperties}
	 * when the record is being created. Here we overriding the base id properties
	 * of parent because our record have not entryid.
	 *
	 * @property
	 * @type Array
	 * @private
	 * @override
	 */
	baseIdProperties : [ 'id' ],

	/*
	 * Copy the {@link Zarafa.core.data.MAPIRecord Record} to a new instance
	 * @param {String} newId (optional) A new Record id, defaults to the id of the record being copied. See id.
	 * @return {Zarafa.core.data.MAPIRecord} The copy of the record.
	 * @override
	 * @private
	 */
	copy : function(newId)
	{
		var copy = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, this.data, newId || this.id);

		copy.idProperties = this.idProperties.clone();
		copy.phantom = this.phantom;

		return copy.applyData(this);
	},

	/**
	 * Compare this {@link Zarafa.plugins.spreed.data.SpreedRecord record} instance with another one to see
	 * if they are the same Spreed Records from the server (i.e. The id matches).
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The IPMRecord to compare with
	 * @return {Boolean} True if the records are the same.
	 * @override
	 * @private
	 */
	equals : function(record)
	{
		return this.id == record.id;
	}
});

Zarafa.core.data.RecordFactory.setBaseClassToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED, Zarafa.plugins.spreed.data.SpreedRecord);
