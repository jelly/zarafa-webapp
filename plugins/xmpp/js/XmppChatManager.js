Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppChatManager
 * @extends Ext.util.Observable
 * 
 * Manages chats that are ongoing. Each chat has a {@link Zarafa.plugins.xmpp.XmppChat} object associated with it. Each of these has a 
 * unique ID, which simply corresponds to the JID of the other participant until group chat is implemented.
 * 
 */
// TODO implement group chat.
// TODO implement support for the <thread> element in messages
// TODO 'chatclosed' event is not being fired because chats are not explicitly closed
Zarafa.plugins.xmpp.XmppChatManager = Ext.extend(Ext.util.Observable, {
	
	/**
	 * @constructor
	 * @param {Zarafa.plugins.xmpp.XmppChatManager} xmppPlugin xmpp plugin reference.
	 */
	constructor : function(xmppPlugin)
	{
		
		this.chats = {};
		
		var config = {};
		this.xmppPlugin = xmppPlugin;
	
		this.addEvents({
			/**
			 * @event chatcreated
			 * @param {Zarafa.plugins.xmpp.XmppChatManager} manager chat manager that fired the event.
			 * @param {Zarafa.plugins.xmpp.XmppChat} chat newly created chat.
			 */
			'chatcreated' : true,
			
			/**
			 * @event chatclosed
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppChatManager} manager chat manager that fired the event.
			 * @param {Zarafa.plugins.xmpp.XmppChat} chat closed chat. 
			 */
			'chatclosed' : true,
			
			/**
			 * @event messagereceived
			 * 
			 * Fires when a message is received by the chat manager, after it has been sent to the
			 * corresponding XmppChat object. 
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppChatManager} manager chat manager that fired the event.
			 * @param {Zarafa.plugins.xmpp.XmppChat} chat closed chat.
			 * @param {Zarafa.plugins.xmpp.XmppChatMessage} message chat message 
			 */
			'messagereceived' : true
		});
		
		this.listeners = config.listeners;
		
		Zarafa.plugins.xmpp.XmppChatManager.superclass.constructor.call(this, config);
		
		var connection = xmppPlugin.getConnection();
		connection.registerHandler('onconnect', this.onConnect.createDelegate(this));
		connection.registerHandler('ondisconnect', this.onDisconnect.createDelegate(this));
		connection.registerHandler('message_in', this.onMessage.createDelegate(this));
		
	},
	
	/**
	 * Handles a connection event from the XMPP connection. Clears and re-initialises the
	 * roster data.
	 */
	onConnect : function()
	{
	},
	
	/**
	 * Handles a disconnect even from the XMPP connection. Clears the roster.
	 */
	onDisconnect : function()
	{
	},
	
	/**
	 * Creates a new chat object for the given JID. If a chat already exists for this JID,
	 * this object is returned instead. 
	 * 
	 * @param {String} jid jabber ID of the other participant. 
	 * @return {Zarafa.plugins.xmpp.XmppChat} a chat object for the given JID.
	 */
	createChat : function(jid)
	{
		// Check if a chat already exists for the same jid
		if (jid in this.chats)
			return this.chats[jid];
		
		// If not, create a new one.
		var chat = this.chats[jid] = new Zarafa.plugins.xmpp.XmppChat(this.xmppPlugin, jid, jid);

		// Signal that a new chat has been created
		this.fireEvent('chatcreated', this, chat);
		
		return chat;
	},
	
	/*
	 * Handles an incoming message packet from JSJaC.
	 */
	onMessage : function(packet)
	{
		var messageNode = packet.getDoc().firstChild;
		
		// Split the JID/resource in the 'from' field 
		var id = messageNode.getAttribute('id');
		var from = messageNode.getAttribute('from');
		from = Zarafa.plugins.xmpp.splitJID(from);
		
		// Get the chat object for this chat session.
		var chat = this.chats[from.jid];
		
		// Create new chat if needed
		if (!chat)
			chat = this.createChat(from.jid);
			
		// Check if the message packet has an activity tag.
		Ext.each(['active', 'composing', 'inactive', 'paused'], function(status) {
			if (messageNode.getElementsByTagName(status).length > 0)
				chat.setStatus(status);
		});
		
		// Check if the message packet has at least one body tag (according to the spec a message
		// may have multiple body elements for multiple language) and create a new XmppChatMessage 
		// for the first such tag.
		//
		// TODO support multi-language messages by selecting the appropriate body tag here
		var bodyElements = messageNode.getElementsByTagName('body');
		if (bodyElements.length > 0)
		{
			var bodyText = bodyElements[0].firstChild.nodeValue;
			
			// Create chat message object
			var message = new Zarafa.plugins.xmpp.XmppChatMessage(id, from.jid, from.resource, bodyText, new Date());
			
			// Add the message to the chat
			chat.addMessage(message);
			
			// Fire event
			this.fireEvent('messagereceived', this, chat, message);
		}
		
	}
	
});
