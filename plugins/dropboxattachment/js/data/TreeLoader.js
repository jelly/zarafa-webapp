Ext.namespace('Zarafa.plugins.dropboxattachment.data');

/**
 * @class Zarafa.plugins.dropboxattachment.data.TreeLoader
 * @extends Ext.tree.TreeLoader
 *
 * DropboxAttachments tree loader. Extends Ext treeloader to use Zarafa
 * specific requests.
 */
Zarafa.plugins.dropboxattachment.data.TreeLoader = Ext.extend(Ext.tree.TreeLoader, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			directFn : this.loadNode.createDelegate(this)
		});

		Zarafa.plugins.dropboxattachment.data.TreeLoader.superclass.constructor.call(this, config);
	},

	/**
	 * Will do single request to dropbox module with provided nodeId and
	 * in case of success will load the content of this node.
	 *
	 * @param {Number} nodeId The id of node which content need to be loaded
	 * @param {Function} callback The function which need to be called after response received
	 */
	loadNode : function(nodeId, callback)
	{
		var self = this;
		var responseHandler = new Zarafa.plugins.dropboxattachment.data.ResponseHandler({
			successCallback: callback,
			nodeId: nodeId
		});
		container.getRequest().singleRequest(
			'dropboxmodule',
			'loadnode',
			{id : nodeId},
			responseHandler
		);
	}




});