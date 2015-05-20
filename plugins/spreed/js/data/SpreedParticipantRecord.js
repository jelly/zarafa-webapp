Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedParticipantRecordFields
 * Array of fields for the {@link Zarafa.plugins.spreed.data.SpreedParticipantRecord} object.
 */
Zarafa.plugins.spreed.data.SpreedParticipantRecordFields =[
		{name: 'isModerator', type: 'boolean'},
		{name: 'timezone', type: 'string'},
		{name: 'language', type: 'string'}
];

// Register a spreed participant record type to be used by the Record Factory
Zarafa.core.data.RecordCustomObjectType.addProperty('ZARAFA_SPREED_PARTICIPANT');
Zarafa.core.data.RecordFactory.setBaseClassToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, Zarafa.core.data.IPMRecipientRecord);
Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, Zarafa.core.data.IPMRecipientRecordFields);
Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, Zarafa.plugins.spreed.data.SpreedParticipantRecordFields);

Zarafa.core.data.RecordFactory.addListenerToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, 'createphantom', function(record)
{
	var settings = container.getSettingsModel();

	if (Ext.isEmpty(record.get('timezone'))) {
		var timezone = settings.get('zarafa/v1/plugins/spreed/default_timezone');
		record.set('timezone', timezone);
	}

	if (Ext.isEmpty(record.get('language'))) {
		var currentLang = container.getSettingsModel().get('zarafa/v1/main/language');
		record.set('language', currentLang.substr(0, currentLang.indexOf('_')));
	}
});
