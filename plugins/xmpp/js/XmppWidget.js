Ext.namespace('Zarafa.plugins.xmpp');
/**
 * @class Zarafa.plugins.xmpp.XmppWidget
 * @extends Zarafa.core.ui.widget.Widget
 */
// TODO the status text on the right in the tool bar does not show the correct status text if the widget is 
// created after the XMPP plugin was already connected (in which case the 'connect' event is missed).
Zarafa.plugins.xmpp.Widget = Ext.extend(Zarafa.core.ui.widget.Widget,
{

	/**
	 * @constructor
	 */
	constructor : function(config)
	{
		
		// Hook into the plugin events
		this.hookPlugin();
		
		// Get the show status of the currently logged in user (used for the menu icon)
		var show = this.xmppPlugin.getRosterManager().getMe().getPresence().getShow();
		
		config = config || {};
		Ext.applyIf(config,
			{
			
			    height : 400,
			    layout: 'fit',
			    tbar : {
			    	xtype : 'toolbar',
			    	items : [{
			    		xtype : 'tbbutton',
						text: _('Status'),
						ref : '../statusToolbarItem',
						iconCls : Zarafa.plugins.xmpp.getIconClass(show),
						menu : this.statusMenu = new Ext.menu.Menu({
							items : [{
								text : 'Available',
								iconCls : 'icon_xmpp_online',
								handler : function() { this.onStatusMenu('online'); },
								scope : this
							},{
								text : 'Free to chat',
								iconCls : 'icon_xmpp_online',
								handler : function() { this.onStatusMenu('chat'); },
								scope : this
							},{
								text : 'Away',
								iconCls : 'icon_xmpp_away',
								handler : function() { this.onStatusMenu('away'); },
								scope : this
							},{
								text : 'Extended Away',
								iconCls : 'icon_xmpp_away',
								handler : function() { this.onStatusMenu('xa'); },
								scope : this
							},{
								text : 'Do not disturb',
								iconCls : 'icon_xmpp_busy',
								handler : function() { this.onStatusMenu('dnd'); },
								scope : this
							},
							this.statusTextField = new Ext.form.TextField({
						    	ref : '../../statusTextField',
						    	listeners : {
						    		change : this.onStatusFieldChange,
						    		specialkey : this.onStatusFieldSpecialKey,
						    		scope : this
						    	}
				    		})]
						})
				    },{
				    	xtype: 'tbfill'
				    },{
				    	xtype : 'tbtext',
				    	name : 'statusText',
				    	ref : '../statusText',
				    	text : '...'
				    }]
			    },
			    items : [
			    this.chatPanel = new Zarafa.plugins.xmpp.ui.XmppChatTabPanel({
					activeTab: 0,
		    		items : [
	    			    this.rosterPanel = new Zarafa.plugins.xmpp.ui.XmppRosterPanel({
	    			    	title : 'Contacts',
	    					listeners : {
	    						'rowdblclick' : this.rosterDoubleClick,
	    						scope : this
	    					}
	    			    })]
			    })]
			});
		
		// Call parent constructor
		Zarafa.plugins.xmpp.Widget.superclass.constructor.call(this, config);
	},
	
	/*
	 * Does a lookup on the XMPP plugin from the container and hooks the event handlers it needs. 
	 */
	hookPlugin : function()
	{
		// Find the XMPP plugin
		this.xmppPlugin = container.getPluginByName('xmpp');
		
		if (this.xmppPlugin)
		{
			
			this.xmppPlugin.addListener('connect', this.onConnect, this);
			this.xmppPlugin.addListener('disconnect', this.onDisconnect, this);
			this.xmppPlugin.getRosterManager().addListener('presencechanged', this.onPresenceChanged, this);
			
		} else
			throw 'XMPP plugin not found';
	},
	
	/*
	 * Does the reverse of hookplugin, unhooking any event handlers that were outstanding.  
	 */
	unhookPlugin : function()
	{
		// Find the XMPP plugin
		if (this.xmppPlugin)
		{
			this.xmppPlugin.removeListener('connect', this.onConnect, this);
			this.xmppPlugin.removeListener('disconnect', this.onDisconnect, this);
			this.xmppPlugin.getRosterManager().removeListener('presencechanged', this.onPresenceChanged, this);
		}
	},
	
	/*
	 * Handles a 'presencechanged' event from the roster manager.
	 */
	onPresenceChanged : function(roster, entry)
	{
		if (entry == roster.getMe())
		{
			// Get status text and show
			var show = entry.getPresence().getShow();
			var status = entry.getPresence().getStatus();
			
			// If the status is set, update the status textfield
			if (status!==undefined)
			{
				this.statusTextField.setValue(status);
				
				this.statusToolbarItem.setText(status ? ('Status (' + status + ')') : 'Status');
			}
			
			// Update the menu icon
			this.statusToolbarItem.setIconClass(Zarafa.plugins.xmpp.getIconClass(show));
		}
	},
	
	/*
	 * Handles the status menu events, changing the 'show' property of the user presence.
	 * @param {String} xmpp status
	 */
	onStatusMenu : function(show)
	{
		// Get current presence
		var roster = this.xmppPlugin.getRosterManager();
		var me = roster.getMe();
		var presence = me.getPresence().getShow(); 

		// Get new icon
		var icon = Zarafa.plugins.xmpp.getIconClass(show);

		// Get status text
		roster.setPresence(show, roster.getMyStatus());

		// Get presence item from panel
		var presenceBox = container.getMainPanel().mainTabBar.presenceBox;
		
		// Update icon
		presenceBox.removeClass(Zarafa.plugins.xmpp.getIconClass(presence));
		presenceBox.addClass(icon);
	},
	
	/*
	 * Handles the status field 'change' event. 
	 */
	onStatusFieldChange : function(field)
	{
		// Get status text
		var roster = this.xmppPlugin.getRosterManager();

		// Update status text. If roster.getMyShow() returns undefined ('offline'),
		// set the show to null ('online').
		roster.setPresence(roster.getMyShow() || null, field.getValue());
	},
	
	/*
	 * Handles the status field 'specialkey' event. Checks if the special key pressed is the
	 * enter key, and blurs the field if this is the case. The blur in turn will cause the 
	 * 'change' event to fire, which is handled by onStatusFieldChange.
	 */
	onStatusFieldSpecialKey : function(field, event)
	{
		if (event.getKey() == event.ENTER)
		{
			field.blur();
			this.statusMenu.hide();
		}
	},
	
	/*
	 * Handles the double-click event from the roster grid. 
	 */
	rosterDoubleClick : function(grid, rowIndex, event)
	{
		// Get the data element that belongs to the clicked row 
		var clickedElement = this.rosterPanel.getStore().getAt(rowIndex);
		
		// Create a new chat that corresponds to the user's JID.
		// If a chat already exists in the chat manager with this ID the previously
		// created one will be returned instead.
		var chat = this.xmppPlugin.getChatManager().createChat(clickedElement.data.jid);
		
		// Select chat
		this.chatPanel.selectChat(chat);
	},
	
	/*
	 * Handles the 'connect' event by setting the status text to 'connected'.
	 */
	onConnect : function()
	{
		this.showStatus('connected');
	},
	
	/*
	 * Handles the 'disconnect' event by setting the status text to 'disconnect'.
	 */
	onDisconnect : function()
	{
		this.showStatus('disconnected');
	},
	
	/*
	 * Updates the status text field.
	 */
	showStatus : function(status)
	{
		this.statusText.setText(status);
	},
	
	/**
	 * Cleans up the XMPP widget.
	 */
	destroy : function()
	{
		// Remove plugin hooks.
		this.unhookPlugin();
		
		// Parent destroy
		Zarafa.plugins.xmpp.Widget.superclass.destroy.call(this);
	}
	
});

Zarafa.onReady(function()
{
	if (container.getSettingsModel().get('zarafa/v1/plugins/xmpp/enable') === true) {
		container.registerWidget(new Zarafa.core.ui.widget.WidgetMetaData({
			name : 'chat',
			displayName : _('Chat'),
			iconPath : 'plugins/xmpp/resources/icons/chat.png',
			widgetConstructor : Zarafa.plugins.xmpp.Widget
		}));
	}
});
