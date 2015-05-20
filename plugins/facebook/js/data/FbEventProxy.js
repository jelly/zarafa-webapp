Ext.namespace('Zarafa.plugins.facebook.data');

/**
 * @class  Zarafa.plugins.facebook.data.FbEventProxy
 * @extends Ext.data.DataProxy
 * A proxy for import from facebook
 */
Zarafa.plugins.facebook.data.FbEventProxy = Ext.extend(Ext.data.DataProxy, {

	/**
	 * @constructor
	 * @param {object} config
	 */
	constructor: function (config) {
		var api = {};
		config = config || {};
		api[Ext.data.Api.actions.read] = true;
		api[Ext.data.Api.actions.create] = true;
		Ext.apply(config, {
			api: api
		});
		Zarafa.plugins.facebook.data.FbEventProxy.superclass.constructor.call(this, config);
	},

	/**
	 * does a request to server to FB api
	 * @param {string} action
	 * @param {object} reader
	 * @param {object} callback
	 * @param {object} scope, here == store
	 */
	doRequest: function(action, rs, params, reader, callback, scope, options) {
		if (action == 'read') {
			FB.api('/me/events', function(data) {
				Ext.each(data.data, function(generalData) {
					FB.api('/'+generalData.id, function(detailedData){
						generalData.description = detailedData.description;
						var resultData = {data: generalData};
						callback.call(scope, reader.readRecords(resultData), {}, true);
					})
				}, this);
			});
		}
	}

});