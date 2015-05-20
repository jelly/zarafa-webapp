Ext.namespace('Zarafa.plugins.facebook.data');

/**
 * @class Zarafa.plugins.facebook.data.FbEventStore
 * @extends Ext.data.Store
 *
 * This class extends Ext Store to configure the
 * proxy and reader in custom way.
 * Instead of defining the records dynamically, reader will
 * create {@link Zarafa.plugins.facebook.data.fbEventRecord} instance.
 *
 */
Zarafa.plugins.facebook.data.FbEventStore = Ext.extend(Ext.data.Store, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 *
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			reader : new Zarafa.plugins.facebook.data.FbEventDataReader({
				id : 'id',
				idProperty : 'id',
				dynamicRecord : false
			}),
			writer : new Zarafa.core.data.JsonWriter(),
			proxy  : new Zarafa.plugins.facebook.data.FbEventProxy(),
			autoLoad: true
		});

		Zarafa.plugins.facebook.data.FbEventStore.superclass.constructor.call(this, config);
	}
});

Ext.reg('facebook.fbeventstore', Zarafa.plugins.facebook.data.FbEventStore);