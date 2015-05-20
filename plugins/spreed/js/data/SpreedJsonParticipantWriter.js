Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedJsonParticipantWriter
 * @extends Zarafa.core.data.JsonRecipientWriter
 * @xtype spreed.spreedparticipantwriter
 */
Zarafa.plugins.spreed.data.SpreedJsonParticipantWriter = Ext.extend(Zarafa.core.data.JsonRecipientWriter, {

	/**
	 * Similar to {@link Ext.data.JsonWriter#toHash}
	 *
	 * Convert recipients into a hash. Recipients exists as
	 * {@link Zarafa.core.data.IPMRecipientRecord IPMRecipientRecord} within
	 * a {@link Zarafa.core.data.IPMRecord IPMRecord} and thus must be serialized
	 * seperately into the hash object.
	 *
	 * @param {Ext.data.Record} record The record to hash
	 * @return {Object} The hashed object
	 * @override
	 * @private
	 */
	toPropHash : function(record)
	{
		var participantsStore = record.getRecipientStore();
		var hash = {};

		if (!Ext.isDefined(participantsStore))
			return hash;

		// Get list of modified (modified and newly added) records
		var participantsRecords = participantsStore.getRange();

		if(participantsRecords.length > 0) {
			hash.recipients = [];

			// Adding the modified records to the add or modified part of the recipients bit
			for (var i = 0; i < participantsRecords.length; i++) {
				var participant = participantsRecords[i];

				// FIXME: serialize?
				var data = participant.data;

				if(participant.isMeetingOrganizer()) {
					// organizer information shouldn't be passed in recipient table at all
					continue;
				}
				hash.recipients.push(data);
			}
		}

		return hash;
	}
});

Ext.reg('spreed.spreedparticipantwriter', Zarafa.plugins.spreed.data.SpreedJsonParticipantWriter);
