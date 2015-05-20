Ext.namespace('Zarafa.plugins.facebook.data');

/**
 * @class Zarafa.plugins.facebook.data.FbEventRecordFields
 * Array of fields for the {@link Zarafa.plugins.facebook.data.FbEventRecord} object.
 */
Zarafa.plugins.facebook.data.FbEventRecordFields = [
	{name:'location', type:'string', defaultValue: ''},
	{name:'name', type:'string', defaultValue:''},
	{name: 'rsvp_status', type:'string', defaultValue: ''},
	{name: 'start_time', type: 'date', dateFormat: 'timestamp', defaultValue: null},
	{name: 'end_time', type:'date', dateFormat: 'timestamp', defaultValue:null},
	{name: 'description', type: 'string', defaultValue:''}
];

// Register a custom type to be used by the Record Factory
Zarafa.core.data.RecordCustomObjectType.addProperty('ZARAFA_FACEBOOK_EVENT');
Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_FACEBOOK_EVENT, Zarafa.plugins.facebook.data.FbEventRecordFields);

/**
 * @class Zarafa.plugins.facebook.data.FbEventRecord
 * @extends Zarafa.core.data.IPMRecord
 * added an 'id' param to baseIdParameters
 */
Zarafa.plugins.facebook.data.FbEventRecord = Ext.extend(Zarafa.core.data.IPMRecord, {
	baseIdProperties: ['id'],

	/**
	 * convert this record to appointment Record
	 * @param {string} parent_entry_id
	 * @param {string} store_entry_id
	 * @return {Zarafa.calendar.AppointmentRecord}
	 */
	convertToAppointmentRecord: function (calendarFolder) {
		var newRecord = Zarafa.core.data.RecordFactory.createRecordObjectByMessageClass('IPM.Appointment', {
			startdate: new Date(this.get('start_time')),
			duedate: (this.get('end_time')) ?
				new Date(this.get('end_time')) :
				new Date(this.get('start_time')).add(Date.HOUR, 1),
			location: this.get('location'),
			subject: this.get('name'),
			body: this.get('description'),
			commonstart: new Date(this.get('start_time')),
			commonend: (this.get('end_time')) ?
				new Date(this.get('end_time')) :
				new Date(this.get('start_time')).add(Date.HOUR, 1),
			parent_entryid: calendarFolder.get('entryid'),
			store_entryid: calendarFolder.get('store_entryid')
		});
		return newRecord;
	}
});

Zarafa.core.data.RecordFactory.setBaseClassToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_FACEBOOK_EVENT, Zarafa.plugins.facebook.data.FbEventRecord);

