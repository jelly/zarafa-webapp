Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppChatMessage
 * @extends Object
 * 
 * A chat message. Contains a body and source JID/resource.  
 * 
 */
Zarafa.plugins.xmpp.XmppChatMessage = Ext.extend(Object, {
	
	/**
	 * Constructs a new XmppChatMessage object.
	 *
	 * @param {String} id unique message ID.
	 * @param {String} jid jid source JID (i.e. piet@zarafa.com)
	 * @param {String} resource source resource (i.e. 'pidgin', 'zarafa-webaccess')
	 * @param {String} body the message body. 
	 * @param {Date} date reception data
	 */
	constructor : function(id, jid, resource, body, date)
	{
		this.id = id;
		this.jid = jid;
		this.resource = Ext.util.Format.htmlEncode(resource);
		this.body = Ext.util.Format.htmlEncode(body);
		this.date = date;
		
		// Parent constructor
		Zarafa.plugins.xmpp.XmppChatMessage.superclass.constructor.call(this);
	},
	
	/**
	 * @return {String} id unique message ID.
	 */
	getID : function()
	{
		return this.id;
	},
	
	/**
	 * @return {String} jid source JID (i.e. piet@zarafa.com)
	 */
	getJID : function()
	{
		return this.jid;
	},
	
	/**
	 * @return {String} source resource (i.e. 'pidgin', 'zarafa-webaccess')
	 */
	getResource : function()
	{
		return this.resource;
	},
	
	/**
	 * @return {String} message body
	 */
	getBody : function()
	{
		return this.body;
	},
	
	/**
	 * @return {Date} date at which the message was received.
	 */
	getDate : function()
	{
		return this.date;
	}
	
});
