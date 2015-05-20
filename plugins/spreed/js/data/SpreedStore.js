Ext.namespace('Zarafa.plugins.spreed.data');

/**
 * @class Zarafa.plugins.spreed.data.SpreedStore
 * @extends Zarafa.core.data.MAPIStore
 *
 * This class extends MAPIStore to configure the
 * proxy and reader in custom way that all requests
 * will send to spreedmodule and with custom id param.
 * Instead of defining the records dynamically, reader will
 * create {@link Zarafa.plugins.spreed.data.SpreedRecord SpreedRecord} instance.
 *
 */
Zarafa.plugins.spreed.data.SpreedStore = Ext.extend(Zarafa.core.data.MAPIStore, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 *
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			reader : new Zarafa.core.data.JsonReader({
				id            : 'id',
				idProperty    : 'id',
				dynamicRecord : false
			}, Zarafa.core.data.RecordFactory.getRecordClassByCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_SPREED)),
			writer : new Zarafa.core.data.JsonWriter(),
			proxy  : new Zarafa.core.data.IPMProxy({
				listModuleName : 'spreedmodule',
				itemModuleName : 'spreedmodule'
			})
		});

		Zarafa.plugins.spreed.data.SpreedStore.superclass.constructor.call(this, config);
	},

	/**
	 * If we need to open records so we use the superclass's mechanism to send them to server and extract data
	 * Else we just create substores and set flag 'opened' on our record to true
	 *
	 * @param {Zarafa.plugins.spreed.data.SpreedRecord} record
	 * @param options
	 */
	open: function(record, options)
	{
		if (record.isNeededToOpen()) {
			Zarafa.plugins.spreed.data.SpreedStore.superclass.open.call(this, record, options);
		} else {
			record.afterOpen();
			this.fireEvent('open', this, record, record);
		}
	}

});

Ext.reg('spreed.spreedstore', Zarafa.plugins.spreed.data.SpreedStore);
