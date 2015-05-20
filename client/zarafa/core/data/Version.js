Ext.namespace('Zarafa.core.data');

/**
 * @class Zarafa.core.data.Version
 * @extends Object
 *
 * An object which represents the versioning
 * information of the WebApp environment.
 * To obtain the instance of this object
 * refer to {@link Zarafa.core.Container#getVersion}
 */
Zarafa.core.data.Version = Ext.extend(Object, {

	/**
	 * Object containing all meta data for
	 * this user.
	 * @property
	 * @type Object
	 */
	meta : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		this.meta = config;
	},

	/**
	 * @return {String} Return the WebApp version number
	 */
	getWebApp : function()
	{
		return this.meta.webapp;
	},

	/**
	 * @return {String} Return the ZCP version number
	 */
	getZCP : function()
	{
		return this.meta.zcp;
	},

	/**
	 * @return {String} Return the Server name
	 */
	getServer : function()
	{
		return this.meta.server;
	},

	/**
	 * @return {String} Return the SVN number
	 */
	getSVN : function()
	{
		return this.meta.svn;
	}
});
