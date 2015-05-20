Ext.namespace('Zarafa.plugins.xmpp.ui');

/**
 * @class Zarafa.plugins.xmpp.ui.XmppChatTabPanel
 * @extends Ext.TabPanel
 */
Zarafa.plugins.xmpp.ui.XmppChatTabPanel = Ext.extend(Ext.TabPanel, {
	
	/**
	 * @constructor
	 * @param {Object} config configuration object
	 */
	constructor : function(config)
	{
		config = Ext.applyIf(config || {}, {
			enableTabScroll : true,
			listeners :
			{
				tabchange : this.onTabChanged,
				scope: this
			}
		});
		
		this.hookPlugin();
		
		// Call parent constructor
		Zarafa.plugins.xmpp.ui.XmppChatTabPanel.superclass.constructor.call(this, config);
	},
	
	/*
	 * Hooks events on the XMPP plugin's chat manager.
	 */
	hookPlugin : function()
	{
		// Find the XMPP plugin
		this.xmppPlugin = container.getPluginByName('xmpp');
		
		if (this.xmppPlugin)
		{
			this.chatManager = this.xmppPlugin.getChatManager();
			this.chatManager.addListener('chatcreated', this.onChatCreated, this);
			this.chatManager.addListener('chatclosed', this.onChatClosed, this);
			this.chatManager.addListener('messagereceived', this.onMessageReceived, this);
		} else
			throw 'XMPP plugin not found';
	},
	
	/*
	 * Unhooks events from the XMPP plugin's chat manager.
	 */
	unhookPlugin : function()
	{
		// Find the XMPP plugin
		if (this.xmppPlugin)
		{
			this.chatManager.removeListener('chatcreated', this.onChatCreated, this);
			this.chatManager.removeListener('chatclosed', this.onChatClosed, this);
			this.chatManager.removeListener('messagereceived', this.onMessageReceived, this);
		}
	},
	
	/*
	 * Handles the 'chatcreated' event from the chat manager. 
	 */
	onChatCreated : function(chatManager, chat)
	{
		// The selectChat method creates a new chat panel if one doesn't exist for the given chat
		var panel = this.createPanel(chat);
		
		this.activate(panel);
	},
	
	/*
	 * Handles the 'chatcreated' event from the chat manager. 
	 */
	onChatClosed : function(chatManager, chat)
	{
		// TODO implement. Currently the chat manager does not explicitly close chats and does not fire this event
	},
	
	/*
	 * Handles a messagereceived event from the chat manager. Checks if a panel exists
	 * that is displaying the chat in question. If not, one is created and added to the 
	 * tab panel.
	 */
	onMessageReceived : function(chatManager, chat, message)
	{
		var panel = this.findPanel(chat);
		
		// Create a new chat panel for the chat if none exists
		if (!panel)
			panel = this.createPanel(chat);
		
		// Find the chat panel and change its title if it's not selected
		if (panel != this.getActiveTab())
		{
			panel.setTitleStyle(true);
			this.doLayout();
		}
	},
	
	/**
	 * Convenience method for getting a chat panel.
	 * @param {Zarafa.plugins.xmpp.XmppChat} chat chat instance to search for.
	 */
	findPanel : function(chat)
	{
		// Check if a panel exists that is showing the current chat
		for (var i=0, panel; panel=this.items.items[i]; i++)
			if (panel.getChat && panel.getChat() == chat)
				return panel;
		
		// Not found
		return undefined;
	},

	/*
	 * Creates a new tab with a {@link Zarafa.plugins.xmpp.ui.XmppChatPanel} panel for the given chat.
	 */
	createPanel : function(chat)
	{
		// Create a new tab
		var chatPanel = new Zarafa.plugins.xmpp.ui.XmppChatPanel(chat);
		this.add(chatPanel);
		this.doLayout();
		
		return chatPanel;
	},
	
	onTabChanged : function(tabPanel, panel)
	{
		// Automatically scroll the panel text down
		if (panel.scrollDown)
		{
			panel.scrollDown();
			panel.setTitleStyle(false);
		}
	},

	/**
	 * Activates the chat panel that is displaying the given chat object. If no such
	 * panel exists, a new one is created and added to the tab panel. 
	 * 
	 * @param {Zarafa.plugins.xmpp.XmppChat} chat chat instance to search for.
	 */
	selectChat : function(chat)
	{
		// Lookup the panel that is displaying the given chat
		var panel = this.findPanel(chat);
		
		// If no chat panel exists for this chat, create one.
		if (!panel)
			panel = this.createPanel(chat);
		
		// Active the panel
		this.activate(panel);
	},
	
	destroy : function()
	{
		this.unhookPlugin();
		
		// Super class destroy
		Zarafa.plugins.xmpp.ui.XmppChatTabPanel.superclass.destroy.call(this);		
	}
	
	
});
