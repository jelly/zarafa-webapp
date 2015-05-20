Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppChat
 * @extends Ext.util.Observable
 * 
 * The XmppChat class represents a one-on-one chat session. Note that group chat is currently not supported. 
 * 
 */
// TODO implement group chat support. Refer to XEP-0045 for more details: http://xmpp.org/extensions/xep-0045.html 
// TODO keep a maximum backlog of messages in the chat, i.e. 50 lines or so.   
Zarafa.plugins.xmpp.XmppChat = Ext.extend(Ext.util.Observable, {
	
	/**
	 * Constructs a new XmppChat object.
	 * 
	 * @param {String} id of the chat session. For one-to-one chats, this is simply the bare JID of the user on the other end.
	 */
	constructor : function(xmppPlugin, id, jid)
	{
		
		// reference to the XMPP plugin
		this.xmppPlugin = xmppPlugin;
		
		// Unique ID of the chat object
		this.id = id;
		
		// Jabber ID of the other person on this one-on-one chat. Note that 
		// when this class is extended to support group chats, this should probably
		// become a list.
		this.jid = jid;
		
		// Chat state of the other participant to indicate chat states. Initially the empty string (''), 
		// it can be set to 'composing' (the user is typing), 'active', 'inactive', 'gone', and 'paused'.
		// Please refer to XEP-0085 for more information: http://xmpp.org/extensions/xep-0085.html 
		this.state = '';
		
		// Initialise the message list
		this.messages = [];
		
		var config = {};
		this.addEvents({
			/**
			 * @event messageadded
			 * 
			 * Fires after a message has been added to the chat.
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppChat} chat the chat to which the message was added.
			 * @param {Zarafa.plugins.xmpp.XmppChatMessage} message chat message that was added.
			 */
			'messageadded' : true,

			/**
			 * @event chatclosed
			 * 
			 * Fired after the chat has been closed, for example due to a user action such as
			 * clicking a close button in the UI.
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppChat} chat the chat which was closed.
			 */
			'chatclosed' : true,
			
			/**
			 * @event statechanged
			 * 
			 * Fired when the chat status has changed. Possible statuses are
			 * 'inactive', 'active', 'composing', and 'paused'. More information 
			 * can be found <a href="http://xmpp.org/extensions/xep-0085.html">here</a>.
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppChat} chat the chat whose active changed.
			 * @param {String} status new status
			 */
			'statechanged' : true
		});
		
		this.listeners = config.listeners;
		
		// Parent constructor
		Zarafa.plugins.xmpp.XmppChat.superclass.constructor.call(this, config);
	},
	
	/**
	 * Gets a display-friendly chat title. It uses the XMPP plugin's roster manager to obtain
	 * information about the user this chat is with. If this user is found in the roster,
	 * the 'display name' of this user is returned (see {@link Zarafa.plugins.xmpp.XmppRosterEntry}).
	 * 
	 * If the JID of the other user is not found in the roster, the raw JID is returned
	 * instead. 
	 * 
	 * @return {String} a display friendly representation the other participant of this chat. 
	 */
	getDisplayTitle : function()
	{
		var entry = this.xmppPlugin.getRosterManager().getEntryByJID(this.jid);

		return entry ? entry.getDisplayName() : this.jid;
	},
	
	/**
	 * Adds a message to the chat object. Adds the message to the internal list and fires
	 * the 'messageadded' event.
	 * 
	 * @param {Zarafa.plugins.xmpp.XmppChatMessage} message message to be added.
	 */
	addMessage : function(message)
	{
		// Add message
		this.messages.push(message);
		
		// Fire added event
		this.fireEvent('messageadded', this, message);
	},
	
	/**
	 * @return {Zarafa.plugins.xmpp.XmppChatMessage[]} list of messages in the chat.
	 */
	getMessages : function()
	{
		return this.messages;
	},	

	/**
	 * Sends a chat message to this chat.
	 * 
	 * @param {String} body the body text of the message.
	 */
	sendMessage : function(body)
	{
		// Create and populate a JSJacMessage object
		// Message type is set to 'chat', as per RFC3921, Section 2.2.1:
		// http://xmpp.org/rfcs/rfc3921.html#stanzas-message-type
		var message = new JSJaCMessage();
		message.setType('chat');
		message.setBody(body);
		message.setTo(this.jid);
		
		// Send the message to the server
		this.xmppPlugin.getConnection().send(message);
		
		// Create an XmppChatMessage object to represent the outgoing message in this chat object
		// and add it to the list
		
		var jid = this.xmppPlugin.getUserJID();
		message = new Zarafa.plugins.xmpp.XmppChatMessage('', jid, this.xmppPlugin.getResource(), body, new Date());
		this.messages.push(message);
		
		// Fire added event
		this.fireEvent('messageadded', this, message);
	},
	
	/**
	 * Closes the chat and fires the 'chatclosed' event.
	 */
	close : function()
	{
		// Fire added event
		this.fireEvent('chatclosed', this);
	},
	
	/**
	 * Sets the current status of the chat. Fires the 'statuschanged' event.
	 * @param {String} status status to set.
	 */
	setStatus : function(status)
	{
		this.status = status;
		
		// Fire activity changed event
		this.fireEvent('statuschanged', this, status);
	}
	
});
