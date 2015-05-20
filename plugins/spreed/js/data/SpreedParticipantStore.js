Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedParticipantStore
 * @extends Zarafa.core.data.IPMRecipientStore
 */
Zarafa.plugins.spreed.data.SpreedParticipantStore=Ext.extend(Zarafa.core.data.IPMRecipientStore,{

	/**
	 * @constructor
	 * @param config {Object} Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			writer : new Zarafa.plugins.spreed.data.SpreedJsonParticipantWriter(),
			customObjectType : Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT,
			reader: new Zarafa.core.data.JsonRecipientReader({
				id : 'entryid',
				idProperty : 'entryid',
				dynamicRecord : false,
				customObjectType : Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED_PARTICIPANT
			})
		});

		Zarafa.plugins.spreed.data.SpreedParticipantStore.superclass.constructor.call(this, config)
	}

});
Ext.reg('spreed.spreedparticipantstore', Zarafa.plugins.spreed.data.SpreedParticipantStore);
