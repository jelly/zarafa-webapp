Ext.namespace('Zarafa.plugins.xmpp');

// Make sure the XMPP plugin gets loaded first
// FIXME: This is a bad and undesired dependency!
/**
 * #dependsFile plugins/xmpp/js/XmppPlugin.js
 */

/**
 * @class Zarafa.plugins.xmpp.XmppPreviewPanelButton
 * @extends Ext.Button
 * @xtype zarafa.xmpp.previewpanelbutton
 * 
 * A quick-and-dirty XMPP button that updates itself based on the record loaded in the preview panel. 
 * 
 * This is by no means meant to be a fully-working feature, just an example of how to integrate
 * the XMPP plugin into the mail and other features. 
 * 
 */
Zarafa.plugins.xmpp.XmppPreviewPanelButton = Ext.extend(Ext.Button, {
	
	/**
	 * @constructor
	 */
	constructor : function(config)
	{
		this.panel = config.panel;
		this.model = config.model;
		
		config = Ext.applyIf(config, { 
			
			text : 'Lol ik ben een knopje',
			listeners :
			{
				click : this.onClick,
				scope : this
			}
			
		});
	
		// Parent constructor
		Zarafa.plugins.xmpp.XmppPreviewPanelButton.superclass.constructor.call(this, config);
	},

	/**
	 * initialize component
	 * @protected
	 */
	initComponent : function()
	{
		Zarafa.plugins.xmpp.XmppPreviewPanelButton.superclass.initComponent.apply(this, arguments);

		this.setVisible(false);

		// Hook into the 'updaterecord' event of the parent panel. 
		this.panel.addListener('updaterecord', this.onUpdateRecord, this);
		
		// Grab the XMPP plugin instance
		this.xmppPlugin = container.getPluginByName('xmpp');
		if (this.xmppPlugin)
		{
			// Hook into the preview panel
			this.model.addListener('previewrecordchange', this.onRecordChange, this);
		}
		
	},
	
	update : function(record)
	{
		var entry = undefined;
		
		if (record != undefined)
		{
			var senderEmail = record.data.sent_representing_email_address;
			entry = this.xmppPlugin.getRosterManager().getEntryByEmail(senderEmail);
		}

		
		if (entry)
		{
			this.setIconClass(Zarafa.plugins.xmpp.getIconClass(entry.getPresence().getShow()));						
			this.setText(entry.getDisplayName());
			this.setVisible(true);
		} else
		{
			this.setVisible(false);
		}
		
		this.entry = entry;
		
	},
	
	onClick : function()
	{
		if (this.entry)
		{
			this.xmppPlugin.getChatManager().createChat(this.entry.getJID());			
		}
	},
	
	onRecordChange : function(contextModel, record)
	{
		this.update(record);
	},
	
	onUpdateRecord : function(panel, event, record)
	{
		this.update(record);
	},
	
	destroy : function()
	{
		// Unhook the 'updaterecord' event of the parent panel. 
		this.panel.removeListener('updaterecord', this.onUpdateRecord, this);
		this.model.removeListener('previewrecordchange', this.onRecordChange, this);

		// Superclass.destroy
		Zarafa.plugins.xmpp.XmppPreviewPanelButton.superclass.destroy.call(this);		
	}
	
});

// Register xtype for lazy instantiation
Ext.reg('zarafa.xmpp.previewpanelbutton', Zarafa.plugins.xmpp.XmppPreviewPanelButton);

/**
 * @class Zarafa.plugins.xmpp.XmppPreviewPanelPlugin
 * @extends Zarafa.core.Plugin
 * 
 * A notification plug-in for XMPP. Fades in a message in the lower-left hand side of the status bar
 * whenever a new chat message is received. The message lingers for five seconds before fading out
 * again.
 * 
 */
Zarafa.plugins.xmpp.XmppPreviewPanelPlugin = Ext.extend(Zarafa.core.Plugin, {
	
	/**
	 * Initialize plugin
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.xmpp.XmppPreviewPanelPlugin.superclass.initPlugin.apply(this, arguments);

		// Find the XMPP plugin and get the chat- and roster manager
		var xmppPlugin = container.getPluginByName('xmpp');
		this.chatManager = xmppPlugin.getChatManager();
		this.rosterManager = xmppPlugin.getRosterManager();
		
		// Hook events
//		this.chatManager.addListener('messagereceived', this.onMessageReceived, this);
//		this.rosterManager.addListener('presencechanged', this.onPresenceChanged, this);

		// Insertion point
		this.registerInsertionPoint('previewpanel.toolbar.right', function(insertionPointName, panel, model) {
			
			return {
				xtype : 'zarafa.xmpp.previewpanelbutton',
				panel : panel,
				model : model
			};
			
		}, this);

	},

	/*
	 * Handles the 'messagereceived' event fired by the chat manager. 
	 */
	onMessageReceived : function(manager, chat, message)
	{
	},
	
	/*
	 * Handles the 'messagereceived' event fired by the chat manager. 
	 */
	onPresenceChanged : function(roster, entry)
	{
	}
	
});

// Register the plugin with the container.
Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'xmpp-previewpanel-plugin',
		displayName : _('XMPP Preview Panel Plugin'),
		settingsName : 'xmpp',
		allowUserVisible : false,
		pluginConstructor : Zarafa.plugins.xmpp.XmppPreviewPanelPlugin
	}));
});
