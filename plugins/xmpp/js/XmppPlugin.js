Ext.namespace('Zarafa.plugins.xmpp');

/**
 * XMPP presence- and chat messages identify the sender as JID. This JID can either be bare,
 * in the form [user]@[server], or full, in the form [user]@[server]/[resource]. This method
 * takes a JID and returns a tuple containing the bare JID and optionally the resource. If
 * the JID provided was a bare JID, the resource returned is null.
 * 
 * @param {String} from the full JID (i.e. user@server/resource)
 * @return {Object} an tuple in the form { jid : [bare JID], resource : [resource] }. Note that the resource part may be null if only a bare JID was provided as input.
 */
Zarafa.plugins.xmpp.splitJID = function(jid)
{
	if (jid.indexOf('/')==-1)
		return {
			jid : jid,
			resource : null
		};
	else
		return {
			jid : jid.split('/')[0],
			resource : jid.split('/')[1]
		};
};

/**
 * Convenience method that returns an XMPP status icon class for a given 'show'
 * status.
 * 
 * @param {String} show user availability. One of 'chat', 'dnd', 'away', 'xa', or null. Undefined maps to 'offline', null maps to 'online'.
 */
Zarafa.plugins.xmpp.getIconClass = function(show)
{
	return {
			'online' : 'icon_xmpp_online',
			'offline' : 'icon_xmpp_offline',
			'away' : 'icon_xmpp_away',
			'xa' : 'icon_xmpp_away',
			'chat' : 'icon_xmpp_online',
			'dnd' : 'icon_xmpp_busy'
		}[show];
};

/*
 * Helper function for XML parsing. Takes a DOM element, gets the first child element of the 'nodeName' type,
 * and returns its node value.
 * 
 * @param {Element} element dom element
 * @param {String} nodeName node name
 */
Zarafa.plugins.xmpp.getChildNodeValue = function(element, nodeName)
{
	try
	{
		return element.getElementsByTagName(nodeName)[0].firstChild.nodeValue;
	} catch (e)
	{
		return null;
	}
};

/**
 * @class Zarafa.plugins.xmpp.XmppPlugin
 * @extends Zarafa.core.Plugin
 * 
 * Note that connecting to (your local) OpenFire requires the extra option 'authtype = nonsasl'.
 * 
 */
Zarafa.plugins.xmpp.XmppPlugin = Ext.extend(Zarafa.core.Plugin, {
	
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		// Register events
		this.addEvents([
			/**
			 * @event connect
			 * 
			 * Fires when the XMPP plugin has successfully connected to the server.
			 * @param {XmppPlugin} plugin the XMPP plugin object that fired the event  
			 */
			'connect',
			
			/**
			 * @event disconnect
			 * 
			 * Fires when the XMPP plugin disconnected from the server.
			 * @param {XmppPlugin} plugin the XMPP plugin object that fired the event  
			 */
			'disconnect',
			
			/**
			 * @event statuschanged
			 * 
			 * Fires when the XMPP plugin's connection status changed. Possible values for the connection
			 * status are 'connecting', 'disconnecting', 'resuming', 'suspending', 'aborted', 'internal_server_error', 
			 * 'processing', 'onerror_fallback', 'proto_error_fallback', 'session-terminate-conflict'
			 * 
			 * @param {XmppPlugin} plugin the XMPP plugin object that fired the event  
			 * @param {String} status current connection status. 
			 */
			'statuschanged',
			
			/**
			 * @event error
			 * 
			 * Fires when the XMPP plugin has encountered an error.
			 * @param {XmppPlugin} plugin the XMPP plugin object that fired the event.
			 * @param {String} error error code as XML. Refer to the <a href="http://blog.jwchat.org/jsjac-1.3.4/doc">JsJac documentation</a> for more information.  
			 */
			'error'			
		]);
		
		// Call parent constructor
		Zarafa.plugins.xmpp.XmppPlugin.superclass.constructor.call(this, config);
	},
	
	/**
	 * Initialises the XMPP plug-in by creating an XMPP connection object, roster manager,
	 * and chat manager. This method is called directly by the constructor.
	 * @protected
	 */
	initPlugin : function()
	{
		var settingsModel = container.getSettingsModel();
		var user = container.getUser();

		Zarafa.plugins.xmpp.XmppPlugin.superclass.initPlugin.apply(this, arguments);

		// XMPP server settings
		// TODO get these from config/settings, etc
		this.xmppHttpBase = settingsModel.get(this.getSettingsBase() + '/httpbase'),
		this.xmppDomain = settingsModel.get(this.getSettingsBase() + '/domain'),
		this.xmppSSL = settingsModel.get(this.getSettingsBase() + '/ssl'),
		this.xmppPort = settingsModel.get(this.getSettingsBase() + '/port'),
		this.xmppUser = user.getUserName(),
		this.xmppPassword = user.getSessionId(),
		this.xmppResource = settingsModel.get(this.getSettingsBase() + '/resource'),

		// Default presence settings
		this.presence = new Zarafa.plugins.xmpp.XmppPresence(null, null)

		// Create XMPP connection object and hook handler functions.
		this.connection = this.createConnection();
		
		// Create a roster manager 
		this.rosterManager = new Zarafa.plugins.xmpp.XmppRosterManager(this);
		
		// Create a chat manager
		this.chatManager = new Zarafa.plugins.xmpp.XmppChatManager(this);
		
		// Connect to the server
		this.connect();

		this.registerInsertionPoint('main.maintabbar.right', this.showPresenceBox, this);

		// Add chat dialog to contact and recipient
		this.registerInsertionPoint('context.addressbook.contextmenu.actions', this.showChatButton, this);
		this.registerInsertionPoint('context.common.recipientfield.contextmenu.actions', this.showChatButton, this);
	},

	/*
	 * Creates a JSJaC connection object and hooks the appropriate event handlers.
	 */
	createConnection : function()
	{
		// Create new arguments object
		var args = new Object();
		
		// Connection arguments
		var xmppProtocol = 'http://'; 	
		if(this.xmppSSL === true) {
			xmppProtocol = 'https://'; 	
		}
		args.httpbase = xmppProtocol + this.xmppDomain + ':' + this.xmppPort + this.xmppHttpBase;
		args.timerval = 2000;

		// Debug logging interface, remove comments to enable debugging
		// args.oDbg = new JSJaCConsoleLogger();
		// args.oDbg.setLevel(1);

		// Create a new HTTP binding connection
		var connection = new JSJaCHttpBindingConnection(args);

		// Hook event handlers
	    connection.registerHandler('onConnect', this.handleOnConnect.createDelegate(this));
	    connection.registerHandler('onError',this.handleError.createDelegate(this));
	    connection.registerHandler('onStatusChanged',this.handleStatusChanged.createDelegate(this));
	    connection.registerHandler('onDisconnect',this.handleDisconnected.createDelegate(this));

		return connection;
	},
	
	/*
	 * Connects to the XMPP server. 
	 */
	connect : function()
	{
		// setup args for connect method
		var args = new Object();
		
		// copy the configuration settings into the arguments 
		args.domain = this.xmppDomain;
		args.username = this.xmppUser;
		args.resource = this.xmppResource;
		args.pass = this.xmppPassword;
		args.register = false;
		args.authtype = this.authtype;
		
		// Connect
		this.connection.connect(args);
	},

	/*
	 * Handles the connect event fired by the JSJaC connection.
	 */
	handleOnConnect : function()
	{
		// Fire connect event
		this.fireEvent('connect', this);
		
		// Send a presence packet
		this.rosterManager.setPresence('online', '');
	},
	
	/*
	 * Handles the disconnect event fired by the JSJaC connection.
	 */
	handleDisconnected : function()
	{
		// Fire disconnect event
		this.fireEvent('disconnect', this);
	},	

	/*
	 * Handles the error event fired by the JSJaC connection.
	 */
	handleError : function(err)
	{
		// Fire error event
		this.fireEvent('error', this, err);
	},

	/*
	 * Handles the status changed event fired by the JSJaC connection.
	 */
	handleStatusChanged : function(status)
	{
		// Fire status event
		this.fireEvent('statuschanged', this, status);
	},
	
	/**
	 * Gets the roster manager associated with this XMPP plugin instance.
	 * @return {Zarafa.plugins.xmpp.XmppRosterManager} the roster manager associated with this XMPP plugin instance.
	 */
	getRosterManager : function()
	{
		return this.rosterManager;
	},
	
	/**
	 * Gets the chat manager associated with this XMPP plugin instance.
	 * @return {Zarafa.plugins.xmpp.XmppRosterManager} the chat manager associated with this XMPP plugin instance.
	 */
	getChatManager : function()
	{
		return this.chatManager;
	},
	
	/**
	 * Gets the JSJaC connection.
	 * 
	 * @return {JSJaCConnection} connection.
	 */
	getConnection : function()
	{
		return this.connection;
	},
	
	/**
	 * Gets the JID of the currently logged in user. 
	 * @return {String} JID of the currently logged in user.
	 */
	getUserJID : function()
	{
		return this.xmppUser + '@' + this.xmppDomain;
	},
	
	/**
	 * Gets the resource the current user is logged in with.
	 * @return {String} resource the current user is logged in with.
	 */
	getResource : function()
	{
		return this.xmppResource;
	},

	/*
	 * Adds presence icon to the maintabbar
	 * @return {Object} box which shows a presence icon
	 */
	showPresenceBox : function() 
	{
		return {
			xtype 		: 'box',
			ref 		: 'presenceBox',
			cls		: 'icon_xmpp_online',
			width		: '16'
		};
	},

	/**
	 * Adds chat button to recipient and GAB
	 * @return {Zarafa.core.ui.menu.ConditionalItem} A button which adds a chat option to the context menu
	 */
	showChatButton : function()
	{
		return {
			xtype 			: 'zarafa.conditionalitem',
			text 			: _('Chat'),
			iconCls 		: 'icon_xmpp_chatbutton',
			singleSelectOnly 	: true,
			handler 		: this.showChatDialog,
			scope 			: this
		};
	}
});

// Register the plugin with the framework.
Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'xmpp',
		displayName : _('XMPP Plugin'),
		about : Zarafa.plugins.xmpp.ABOUT,
		pluginConstructor : Zarafa.plugins.xmpp.XmppPlugin
	}));
});

