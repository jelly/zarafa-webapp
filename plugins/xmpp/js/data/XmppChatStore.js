Ext.namespace('Zarafa.plugins.xmpp.data');

// Chat participant colors
// TODO come up with a nice palette here
Zarafa.plugins.xmpp.ChatColors = [ '#8A9B0F', '#BD1550', '#F8CA00', '#78C0A8'];

// Record type
Zarafa.plugins.xmpp.data.ChatMessageRecord = Ext.data.Record.create(
		[{ name : 'messageid' }, { name : 'jid' }, { name : 'resource' }, { name : 'color' }, { name : 'displayname' }, { name : 'body'}, { name : 'date'}]);

/**
 * @class Zarafa.plugins.xmpp.data.XmppChatStore
 * @extends Ext.data.Store
 * @xtype zarafa.xmppchatstore
 * 
 * A store that represents the messages in a chat in a way that an XmppChatPanel can render.
 * 
 */
Zarafa.plugins.xmpp.data.XmppChatStore = Ext.extend(Ext.data.Store, {
	
	/**
	 * @constructyor
	 * @param {Zarafa.plugins.xmpp.XmppChat} chat the chat object that this store wraps.
	 */
	constructor : function(chat)
	{
		
		var config = {
			
			// Standard data reader
		    reader: new Ext.data.ArrayReader({
		    		idIndex: 0
		    	},
		    	Zarafa.plugins.xmpp.data.ChatMessageRecord
		    )
		
		};
		
		// Copy the chat object
		this.hookChat(chat);
		
		// Call parent constructor
		Zarafa.plugins.xmpp.data.XmppChatStore.superclass.constructor.call(this, config);		
	},
	
	/**
	 * Forces the store to reload its contents.
	 */
	load : function()
	{
		this.update();
	},
	
	/*
	 * Updates the store.
	 */
	update : function()
	{
		
		var data = [];
		
		// Get the XMPP plugin
		var xmppPlugin = container.getPluginByName('xmpp');
		if (!xmppPlugin)
			throw 'XMPP plugin not found';

		// Get the roster manager from the plugin
		var roster = xmppPlugin.getRosterManager();
		
		// Each participant in the chat should get a unique color
		var colorIds = {};
		var colors = 0;

		// Iterate over the messages in the chat and add them to the store
		Ext.each(this.chat.getMessages(), function(message) {
			
			// Get the XmppRosterEntry for the given JID
			var jid = message.getJID();
			var entry = roster.getEntryByJID(jid);
			
			// Get the display name of the entry. For example, if we're chatting with foo@x.y.com, 
			// the display could be be 'Kung Foo'
			var displayName = entry ? entry.getDisplayName() : jid;
			
			// Check if the person who wrote this message has already been assigned a color, and 
			// assign one if not.
			if (!(jid in colorIds))
				colorIds[jid] = colors++;
			
			// Get a color from the color palette
			var color = Zarafa.plugins.xmpp.ChatColors[colorIds[jid] % Zarafa.plugins.xmpp.ChatColors.length];
			
			// Push the message into the data 
			data.push([message.getID(), jid, message.getResource(), color, displayName, message.getBody(), message.getDate().format('H:i:s') ]);
		});
		
		// Push the data into the store
		this.loadData(data);

	},
	
	/*
	 * Hooks the events of the chat object.
	 */
	hookChat : function(chat)
	{
		this.chat = chat;
		this.chat.addListener('messageadded', this.onMessageAdded, this);
	},
	
	/*
	 * Unhooks the events of the chat object.
	 */
	unhookChat : function()
	{
		this.chat.removeListener('messageadded', this.onMessageAdded, this);
	},
	
	/*
	 * Handles the 'messageadded' event from the chat.
	 */
	onMessageAdded : function(chat, message)
	{
		this.update();
	},
	
	/**
	 * Unhooks the event handlers and cleans up the store.
	 */
	destroy : function()
	{
		// unhook events from chat object
		this.unhookChat();
		
		// Parent destroy
		Zarafa.plugins.xmpp.data.XmppChatStore.superclass.destroy.call(this);		
	}
	
});

Ext.reg('zarafa.xmppchatstore', Zarafa.plugins.xmpp.data.XmppChatStore);
