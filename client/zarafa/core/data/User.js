Ext.namespace('Zarafa.core.data');

/**
 * @class Zarafa.core.data.User
 * @extends Object
 *
 * An object which represents a logged
 * on user in the WebApp environment.
 * To obtain the instance of this object
 * for the currently logged in user,
 * refer to {@link Zarafa.core.Container#getUser}
 */
Zarafa.core.data.User = Ext.extend(Object, {

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
	 * @return {String} The entryid for the user
	 */
	getEntryId : function()
	{
		return this.meta.entryid;
	},

	/**
	 * @return {String} The searchkey for the user
	 */
	getSearchKey : function()
	{
		return this.meta.search_key;
	},

	/**
	 * The display name for the user, this can be either
	 * the {@link #getFullName} or {@link #getUserName}
	 * depending which one is a non-empty string.
	 * @return {String} The displayname for the user
	 */
	getDisplayName : function()
	{
		return this.meta.fullname || this.meta.username;
	},

	/**
	 * @return {String} The fullname for this user
	 */
	getFullName : function()
	{
		return this.meta.fullname;
	},

	/**
	 * @return {String} The username for this user
	 */
	getUserName : function()
	{
		return this.meta.username;
	},

	/**
	 * @return {String} The emailaddress for this user
	 */
	getEmailAddress : function()
	{
		return this.meta.email_address;
	},

	/**
	 * @return {String} The email address for this user
	 */
	getSMTPAddress : function()
	{
		return this.meta.smtp_address;
	},

	/**
	 * @return {String} The sessionId for this user
	 */
	getSessionId : function()
	{
		return this.meta.sessionid;
	}
});
