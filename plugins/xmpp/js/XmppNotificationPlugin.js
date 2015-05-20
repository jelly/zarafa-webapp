Ext.namespace('Zarafa.plugins.xmpp');

// Make sure the XMPP plugin gets loaded first
// FIXME: This is a bad and undesired dependency!
/**
 * #dependsFile plugins/xmpp/js/XmppPlugin.js
 */

/**
 * @class Zarafa.plugins.xmpp.XmppNotificationPlugin
 * @extends Zarafa.core.Plugin
 * 
 * A notification plug-in for XMPP. Fades in a message in the lower-left hand side of the status bar
 * whenever a new chat message is received. The message lingers for five seconds before fading out
 * again.
 * 
 */
Zarafa.plugins.xmpp.XmppNotificationPlugin = Ext.extend(Zarafa.core.Plugin, {
	
	/**
	 * Initialize plugin
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.xmpp.XmppNotificationPlugin.superclass.initPlugin.apply(this, arguments);

		// Find the XMPP plugin and get the chat- and roster manager
		var xmppPlugin = container.getPluginByName('xmpp');
		this.chatManager = xmppPlugin.getChatManager();
		this.rosterManager = xmppPlugin.getRosterManager();
		
		// Hook events
		this.chatManager.addListener('messagereceived', this.onMessageReceived, this);		
		this.rosterManager.addListener('presencechanged', this.onPresenceChanged, this);		
	},
	
	/*
	 * Handles the 'messagereceived' event fired by the chat manager. 
	 * Shows a notification when a message is received. 
	 *
	 * @param {XmppChatManager} manager - manager of chat objects
	 * @param {XmppChat} chat - one on one chat 
	 * @param {XmppChatMessage} message - the xmpp message
	 */
	onMessageReceived : function(manager, chat, message)
	{
		// Get the XmppRosterEntry for the given JID
		var jid = message.getJID();
		var entry = this.rosterManager.getEntryByJID(jid);
		
		// Get the display name of the entry. For example, if we're chatting with foo@x.y.com, 
		// the display could be be 'Kung Foo'
		var displayName = entry ? entry.getDisplayName() : jid;

		var iconClass = Zarafa.plugins.xmpp.getIconClass(entry.getPresence().getShow());
		
		container.getNotifier().notify('info.chat',  displayName, message.getBody());
	},
	
	/*
	 * Handles the 'messagereceived' event fired by the chat manager. 
	 * Shows a notification when the presence of a user has changed.
	 *
	 * @param {XmppRosterManager} roster
	 * @param {XmppRosterEntry} entry
	 */
	onPresenceChanged : function(roster, entry)
	{
		// Get the notification element. If this returns null, the plugin has not been initialised yet, so we just return.
		var show = entry.getPresence().getShow();
		var iconClass = Zarafa.plugins.xmpp.getIconClass(show);
		
		if (show===undefined) show = 'offline';
		if (show===null) show = 'online';

		var statusMessage = {
				'online' : 'changed status to available.',
				'offline' : 'has gone offline.',
				'away' : 'is now away.',
				'xa' : 'is now away.',
				'chat' : 'is feeling chatty.',
				'dnd' : 'has changed status to "do not disturb".'
			}[show];		
		
		container.getNotifier().notify('info.chat', entry.getDisplayName(), statusMessage);
	}
	
});

// Register the plugin with the container.
Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'xmpp-notification-plugin',
		displayName : _('XMPP Notification Plugin'),
		settingsName : 'xmpp',
		allowUserVisible : false,
		pluginConstructor : Zarafa.plugins.xmpp.XmppNotificationPlugin
	}));
});
