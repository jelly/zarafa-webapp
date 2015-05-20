Ext.namespace('Zarafa.plugins.spreed.dialogs');

/**
 * @class Zarafa.plugins.spreed.dialogs.SpreedParticipantField
 * @extends Zarafa.common.recipientfield.ui.RecipientField
 * @xtype spreed.spreedparticipantfield
 *
 * If the {@link Zarafa.core.plugins.RecordComponentUpdaterPlugin} is installed
 * in the {@link #plugins} array of this component, this component will automatically
 * load the {@link Zarafa.core.data.IPMRecipientStore RecipientStore} into the component.
 * Otherwise the user of this component needs to call {@link #setRecipientStore}.
 */
Zarafa.plugins.spreed.dialogs.SpreedParticipantField = Ext.extend(Zarafa.common.recipientfield.ui.RecipientField, {
	/**
	 * @constructor
	 * @param config{Object} Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};
		Ext.applyIf(config, {
			boxType : 'spreed.spreedparticipantbox'
		});

		Zarafa.plugins.spreed.dialogs.SpreedParticipantField.superclass.constructor.call(this, config);
	},

	/**
	 * Called to handle a selection from the dropdown list. This function needs to
	 * convert the selected record into a record for the {@link #spreedStore}.
	 * @param record {Object} record to handle
	 */
	handleSelection : function(record)
	{
		var participant = Zarafa.core.data.RecordFactory.createRecordObjectByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT, {
			object_type    : record.get('object_type'),
			display_name   : record.get('display_name'),
			email_address  : record.get('email_address'),
			smtp_address   : record.get('smtp_address')||record.get('email_address'),
			address_type   : record.get('address_type'),
			isModerator    : record.get('isModerator'),
			recipient_type : record.get('recipientType') || Zarafa.core.mapi.RecipientType.MAPI_TO
		});
		this.boxStore.add(participant);
	},

	/**
	 * Event handler when a Box has been double-clicked.
	 * @param {Zarafa.common.recipientfield.ui.RecipientField} field This field to which the box belongs
	 * @param {Zarafa.common.recipientfield.ui.RecipientBox} box The box for which was double-clicked
	 * @param {Zarafa.core.data.IPMRecipientRecord} record The record which is attached to the box
	 * @private
	 */
	onBoxDblClick : function(field, box, record)
	{
		Zarafa.core.data.UIFactory.openCreateRecord(record, { modal : true });
	}
});
Ext.reg('spreed.spreedparticipantfield', Zarafa.plugins.spreed.dialogs.SpreedParticipantField);
