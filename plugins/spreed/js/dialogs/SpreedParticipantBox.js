Ext.namespace('Zarafa.plugins.spreed.dialogs');
/**
* @class Zarafa.plugins.spreed.dialogs.SpreedParticipantBox
* @extends Zarafa.common.recipientfield.ui.RecipientBox
* @xtype zarafa.spreedparticipantbox
*
* Extension to the  {@link Zarafa.common.recipientfield.ui.RecipientBox}.
* This box offers adding moderator icon for the moderator participant.
*/
Zarafa.plugins.spreed.dialogs.SpreedParticipantBox = Ext.extend(Zarafa.common.recipientfield.ui.RecipientBox, {

	/**
	 * @constructor
	 * @param config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
		});
		Zarafa.plugins.spreed.dialogs.SpreedParticipantBox.superclass.constructor.call(this, config);
	},

	/**
	 * Overriden function to provide custom icon rendering for the given {@link Ext.data.Record}
	 * to the {@link #iconEl} element. The string returned here is the CSS class which will be set on the
	 * {@link #iconEl}.
	 * @param {Ext.data.Record} record The record which is going to be rendered
	 * @return {String} The CSS class which must be applied to the {@link #iconEl}.
	 * @private
	 */
	prepareIcon : function(record)
	{
		if (record.get('isModerator'))
		{
			return 'icon_spreed_mod';
		}
		else
		{
			this.iconEl.removeClass('icon_spreed_mod');
			return Zarafa.plugins.spreed.dialogs.SpreedParticipantBox.superclass.prepareIcon.apply(this, arguments);
		}
	},

	/**
	 * Overriden function to provide custom formatting for the given {@link Ext.data.Record}
	 * to the {@link #update} function. The data object returned here is used by the {@link #textTpl template}
	 * to render the contents of the box.
	 * @param {Ext.data.Record} record The record which is going to be rendered
	 * @return {Object} The data object which can be passed to {@link #textTpl}.
	 * @private
	 */
	prepareData: function(record)
	{
		var prepared = Zarafa.plugins.spreed.dialogs.SpreedParticipantBox.superclass.prepareData.apply(this, arguments);
		prepared.display_name = record.get('display_name');
		prepared.smtp_address = record.get('smtp_address') || record.get('email_address');
		prepared.object_type = record.get('object_type');
		prepared.isModerator = record.get('isModerator');
		return prepared;
	},

	/**
	 * Overriden function checks if the given {Zarafa.core.data.MAPIRecord} record
	 * has an object type {Zarafa.core.mapi.ObjectType.MAPI_DISTLIST} if true
	 * record is marked as invalid.
	 *
	 * @param {Ext.data.Record} record The record to check if it is of distribution list type of record.
	 * @private
	 */
	isValidRecord: function (record)
	{
		if (record.get('object_type')==Zarafa.core.mapi.ObjectType.MAPI_DISTLIST) {
			return false;
		}
		return Zarafa.plugins.spreed.dialogs.SpreedParticipantBox.superclass.isValidRecord.call(this, record);
	}
});
Ext.reg('spreed.spreedparticipantbox',Zarafa.plugins.spreed.dialogs.SpreedParticipantBox);