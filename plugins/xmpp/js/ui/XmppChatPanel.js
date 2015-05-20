Ext.namespace('Zarafa.plugins.xmpp.ui');

/**
 * @class Zarafa.plugins.xmpp.ui.XmppChatPanel
 * @extends Ext.Panel
 * 
 * A chat panel is the view (in the MVC sense) of an ongoing chat session. It contains a data view that shows 
 * the text and automatically updates and new message are received, for which it uses the XmppChatStore class.
 * It also contains an input text field.
 * 
 */
// TODO automatically scroll down the data view component when a new message is received.
// TODO add a label that shows that the other user is typing (the chat is 'active')
Zarafa.plugins.xmpp.ui.XmppChatPanel = Ext.extend(Ext.Panel, {
	
	/**
	 * @constructor
	 * @param {Zarafa.plugins.xmpp.XmppChat} chat a chat session to act as a model for this component. 
	 */
	constructor : function(chat)
	{
		
		// Attach the chat object to this view, hook event handlers.
		this.hookChat(chat);
		
		// Create an XmppChatStore object to use with the data view
		this.store = new Zarafa.plugins.xmpp.data.XmppChatStore(chat);
		this.store.load();
		
		// Attach the load event to the chat store, we use this to scroll
		// the text into view automatically
		this.store.addListener('load', this.onStoreLoad, this);

		// Template for lines of chat text.
		var template = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="thumb-wrap" id="{messageid}">',
				'<div style="width:100%">',
				'<span style="font-size: 8px;">{date}</span> ',
				'<span style="text-weight: bold; color: {color}">{displayname}: </span>{body}</div>',
			'</tpl>',
			'<div class="x-clear"></div>'
			);

		// Component configuration
		var config = {
			title : chat.getDisplayTitle(),
			layout: 'border',
			closable: true,
			items : [
				this.dataView = new Ext.DataView({
					autoScroll : true,
					store : this.store,
					tpl : template,
					itemSelector:'div.thumb-wrap',
					region : 'center'
				}),{
					xtype : 'textfield',
			    	// ref : '../input',
			    	listeners : {
			    		specialkey : this.onInputFieldSpecialKey,
			    		scope : this
			    	},
					region : 'south'
				},
				this.statusField = new Ext.form.Label({
					region : 'north',
					height : 12,
					// TODO style this in a style sheet somewhere
					style : 'font-size: 10px'
				})
			]
		};
		
		// Call parent constructor
		Zarafa.plugins.xmpp.ui.XmppChatPanel.superclass.constructor.call(this, config);
	},
	
	/**
	 * 
	 * @return {Zarafa.plugins.xmpp.XmppChat} the chat session associated with this panel
	 */
	getChat : function()
	{
		return this.chat;
	},
	
	/*
	 * Copies the chat into the chat panel for future reference and hooks the 'activechanged' event.
	 */
	hookChat : function(chat)
	{
		this.chat = chat;
		this.chat.addListener('statuschanged', this.onStatusChanged, this);
	},
	
	/*
	 * Unhooks the 'activechanged' event.
	 */
	unhookChat : function()
	{
		this.chat.removeListener('statuschanged', this.onStatusChanged, this);
	},
	
	/*
	 * Handles the store's load event by scrolling the data view's content
	 * down to reveal the latest message. 
	 */
	onStoreLoad : function()
	{
		this.scrollDown();
	},
	
	scrollDown : function()
	{
		var nodes = this.dataView.getNodes();
		
		// If the view is empty, simply return (no need to scroll)
		if (nodes.length==0) return;
		
		// Get the last HTML node
		var lastNode = nodes[nodes.length-1];
		
		// Scroll this node into view
		lastNode.scrollIntoView(this.dataView);
	},
	
	setTitleStyle : function(alert)
	{
		if (alert)
			this.setTitle('<span style="font-weight: bold; color:red">' + this.chat.getDisplayTitle() + '</span>');
		else
			this.setTitle(this.chat.getDisplayTitle());
	},
	
	/*
	 * Handles the 'statuschanged' event from the chat session. Refer to {@link Zarafa.plugins.xmpp.XmppChat} for more information.
	 * 
	 * @param {Zarafa.plugins.xmpp.XmppChat} chat chat session that fired the event.
	 * @param {String} status updated chat status
	 */
	onStatusChanged : function(chat, status)
	{
		if (status=='composing')
			this.statusField.setText(chat.getDisplayTitle() + ' is typing ...');
		else
			this.statusField.setText('');
	},
	
	/* 
	 * Handles the 'specialkey' event from the input text field.
	 * 
	 * @param {Ext.TextField} field the field that fired the event.
	 * @param {Ext.Event} event event object
	 */
	onInputFieldSpecialKey : function(field, event)
	{
		// If the key pressed was enter, send the contents of the (non-empty) text field
		if (event.getKey() == event.ENTER)
			if (field.getValue())
			{
				this.chat.sendMessage(field.getValue());
				field.setValue('');
			}
	},
	
	/**
	 * Cleans up the chat panel.
	 */
	destroy : function()
	{
		// Release events
		this.unhookChat();
		
		// Destroy the underlying store
		this.store.removeListener('load', this.onStoreLoad(), this);
		this.store.destroy();		
		
		// Parent destroy
		Zarafa.plugins.xmpp.ui.XmppChatPanel.superclass.destroy.call(this);
	}

});
