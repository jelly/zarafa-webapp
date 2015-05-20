Ext.namespace('Zarafa.core.data');

/**
 * @class Zarafa.core.data.ServerConfig
 * @extends Object
 *
 * An object which represents the server
 * configuration. To obtain the instance
 * of this object, use {@link Zarafa.core.Container#getServerConfig}.
 */
Zarafa.core.data.ServerConfig = Ext.extend(Object, {

	/**
	 * Object containing all meta data for this server configuration
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
	 * @return {Boolean} True if Plugins are enabled
	 */
	isPluginsEnabled : function()
	{
		return this.meta.enable_plugins;
	},

	/**
	 * @return {Boolean} True if Advanced Settings are enabled
	 */
	isAdvancedSettingsEnabled : function()
	{
		return this.meta.enable_advanced_settings;
	},

	/**
	 * @return {Number} The maximum number of allowed attachments in a single message
	 */
	getMaxAttachments : function()
	{
		return this.meta.max_attachments;
	},

	/**
	 * @return {Number} The maximum number of files that can be uploaded via a single request.
	 */
	getMaxFileUploads : function()
	{
		return this.meta.max_file_uploads;
	},

	/**
	 * @reutn {Number} The maximum attachment size allowed to attach in single request.
	 */
	getMaxPostRequestSize : function()
	{
		return this.meta.post_max_size;
	},

	/**
	 * @return {Number} The maximum size of a single attachment
	 */
	getMaxAttachmentSize : function()
	{
		return this.meta.max_attachment_size;
	},

	/**
	 * @return {Number} The maximum size of all attachments in a single message combined
	 */
	getMaxAttachmentTotalSize : function()
	{
		return this.meta.max_attachment_total_size;
	},

	/**
	 * @return {Number} The start offset to use when loading freebusy data
	 */
	getFreebusyLoadStartOffset : function()
	{
		return this.meta.freebusy_load_start_offset;
	},

	/**
	 * @return {Number} The end offset to use when loading freebusy data
	 */
	getFreebusyLoadEndOffset : function()
	{
		return this.meta.freebusy_load_end_offset;
	}
});
