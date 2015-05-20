Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppPresence
 * @extends Object
 * 
 * Represents the presence of a roster entry. Presence is expressed as a (show, status) tuple. The <i>show</i> property 
 * represents the availability of a user, and may be one of 'chat', 'dnd', 'away', 'xa', 'online', or 'offline. 
 * 
 * The <i>status</i> property is a customized status message that can be set to anything and defaults to the empty string. 
 * 
 */
Zarafa.plugins.xmpp.XmppPresence = Ext.extend(Object, {
	
	/**
	 * Constructs a new XmppPresence object.
	 * @param {String} show user availability. One of 'chat', 'dnd', 'away', 'xa', 'online', or 'offline'. 
	 * @param {String} status user status message
	 */
	constructor : function(show, status)
	{
		this.show = show;
		this.setStatus(status);
		
		// Parent constructor
		Zarafa.plugins.xmpp.XmppPresence.superclass.constructor.call(this);
	},
	
	/**
	 * @return {String} user status message.
	 */
	getStatus : function()
	{
		return this.status;
	},
	
	/**
	 * @return {String} the show property, which represents the availability of the user. One of 'chat', 'dnd', 'away', 'xa', 'online', or 'offline'.
	 */
	getShow : function()
	{
		return this.show;
	},
	
	/**
	 * Sets the show and status properties.
	 * @param {String} show user availability. One of 'chat', 'dnd', 'away', 'xa', 'online', or 'offline'. 
	 * @param {String} status user status message
	 */
	set : function(show, status)
	{
		this.show = show;
		this.setStatus(status);
	},
	
	/**
	 * Sets the user availability.
	 * 
	 * @param {String} show user availability. One of 'chat', 'dnd', 'away', 'xa', 'online', or 'offline'. 
	 */
	setShow : function(show)
	{
		this.show = show;		
	},

	/**
	 * Sets the status message.
	 *  
	 * @param {String} status user status message
	 */
	setStatus : function(status)
	{
		this.status = Ext.util.Format.htmlEncode(status);
	},
	
	/**
	 * Creates a JSJac packet representation of this presence.
	 * 
	 * @return {JSJaCPresence} JSJac presence packet.
	 */
	toJSJacPresence : function()
	{
		// Set presence
		var presencePacket = new JSJaCPresence();

		// Only include the 'show' property if it's not
		// set to 'online' (according to spec, just omit the show tag).
		if (this.show!='online' && this.show!='offline')
			presencePacket.setShow(this.show);
		
		presencePacket.setStatus(this.status);
		
		return presencePacket;
	}
	
});
