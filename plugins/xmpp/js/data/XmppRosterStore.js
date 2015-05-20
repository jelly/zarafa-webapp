Ext.namespace('Zarafa.plugins.xmpp.data');

// Record type
Zarafa.plugins.xmpp.data.RosterRecord = Ext.data.Record.create(
		[{ name : 'id' }, { name : 'jid' }, { name : 'name'}, {name : 'subscription'}, {name : 'show'}, {name : 'status'}, { name : 'displayname'}, { name : 'group'}]);

/**
 * @class Zarafa.plugins.xmpp.data.XmppRosterStore
 * @extends Ext.data.GroupingStore
 * @xtype zarafa.xmpprosterstore
 * 
 * A store that exposes the roster to ExtJS views such as grids, dataviews, and so on. The store is a grouping
 * store and groups by the 'group' property (naturally). If an entry appears in more than one group, it appears
 * in the store more than once.
 * 
 */
// TODO initialise the showOffline setting from the configuration, and have the widget store this setting
// as a persistent value.
Zarafa.plugins.xmpp.data.XmppRosterStore = Ext.extend(Ext.data.GroupingStore, {
	
	/**
	 * @constructyor
	 * @param {Object} config configuration object.
	 */
	constructor : function(config)
	{
		
		config = Ext.applyIf(config || {}, {
			
			// Standard data reader
		    reader: new Ext.data.ArrayReader({
		    		idIndex: 0
		    	},
		    	Zarafa.plugins.xmpp.data.RosterRecord
		    ),
		    
		    sortInfo: {field: 'group', direction: 'ASC'},
	        groupOnSort: true,
	        remoteGroup: true,
	        groupField: 'group'		    
		
		});
		
		// Initialise the search string to ''
		// This field is used when searching for roster entries and can be set using the
		// setSearchString() method
		this.searchString = '';
		
		// Initialise the showOffline setting to true. The default is to show all users, 
		// not just the ones that are online.
		this.showOffline = true;
		
		// Call parent constructor
		Zarafa.plugins.xmpp.data.XmppRosterStore.superclass.constructor.call(this, config);

		this.hookPlugin();
		
	},
	
	/**
	 * Loads the store with data from the XMPP roster.
	 */
	load : function()
	{
		this.update();
	},
	
	/*
	 * Helder method for update. Checks if an entry should appear in the store by
	 * matching it against the search string and by checking if the entry 
	 * represents the currently logged in user.
	 * 
	 * Note that all the string matching is in lowercase to implement 
	 * case-insensitive search. 
	 *  
	 * @param {Zarafa.plugins.xmpp.XmppRosterEntry} entry roster entry to check
	 */
	filter : function(entry) 
	{
		// Filter out the entry that represents the currently logged in user.
		if (entry == this.xmppPlugin.getRosterManager().getMe()) return false;
		
		// Filter out offline users
		if (!this.showOffline && entry.getPresence().getShow() == 'offline')
			return false;

		// If the search string is '', simply return true 
		if (this.searchString=='') return true;
		
		// Convert all the matching strings to lower case, makes for case-insensitive
		// matching.
		var searchString = this.searchString.toLowerCase();

		// Match the user part of the JID
		var jid = entry.getJID(); 
		var user = jid.split('@')[0].toLowerCase();
		if (user.indexOf(searchString)!=-1) return true;
		
		// Match the name part
		var name = entry.getName();
		if (name && name.toLowerCase().indexOf(searchString)!=-1) return true;
	
		// If we've reached this point, the entry did not match the search query.
		return false;
	},
	
	/* 
	 * Updates the store contents.
	 */
	update : function()
	{
		
		if (this.rosterManager)
		{
			
			var data = [];
			data.pushEntry = function(group, entry)
			{
				var key = entry.getJID() + (group ? '/' + group : ''); 
				var displayName = entry.getName() || entry.getJID();
				var show = entry.getPresence().getShow();
				
				if (!group) group = 'Not in a group';

				if (show===null) show = 'online';
				if (show===undefined) show = 'offline';
				
				this.push([ key, entry.getJID(), entry.getName(), entry.getSubscription(), show, entry.getPresence().getStatus(), displayName, group ]);
			};
			
			var entries = [];
			var groups = {};
			
			// Filter out entries that do not match the search string, and
			// also filter out the roster entry that represents 'me' (the
			// user currently logged into the Zarafa client)
			for (var key in this.rosterManager.getEntries())
			{
				var entry = this.rosterManager.getEntries()[key];
				if (this.filter(entry))
					entries.push(entry);
			}

			// First add all entries that do not belong to any groups.
			Ext.each(entries, function(entry) {
				if (entry.getGroups().length == 0)
					data.pushEntry(null, entry);
			});
			
			// Gather the groups and the items in them
			Ext.each(entries, function(entry) {
				Ext.each(entry.getGroups(), function(group) {
					// If the group doesn't exist yet, create it
					if (groups[group] === undefined)
						groups[group] = [];
					
					// Add the entry to the group
					groups[group].push(entry);
				});
			});
			
			// Add the entries that are in one or more groups
			for (var key in groups)
			{
				var group = groups[key];
				for (var i=0, entry; entry=group[i]; i++)
					data.pushEntry(key, entry);
			}
			
			this.loadData(data);
			
		}
	},
	
	/**
	 * Sets the search string. Search in the roster works like a filter. Each element is
	 * matched against the search string both by user (the part before the '@' in the
	 * JID), and the entry name. An entry matches simply when the search string appears
	 * in either field. For example, 'foo' would match 'foo', 'barfoo', and 'foobar'. 
	 * 
	 * Setting the search string to '' disables filtering. 
	 * 
	 * @param {String} search search string. Set to '' to disable.
	 */
	setSearchString : function(search)
	{
		this.searchString = search;
		
		// Update the store contents
		this.update();
	},
	
	/**
	 * Sets whether the store should include entries from the roster that are offline.
	 * 
	 * @param {Boolean} showOffline whether or not to include entries in the roster that are offline. 
	 */
	setShowOffline : function(showOffline)
	{
		this.showOffline = showOffline;
		
		// Update the store contents
		this.update();
	},
	
	/*
	 * Hooks into events from the XMPP plugin's roster manager. 
	 */
	hookPlugin : function()
	{
		// Find the XMPP plugin
		this.xmppPlugin = container.getPluginByName('xmpp');
		
		if (this.xmppPlugin)
		{
			this.rosterManager = this.xmppPlugin.getRosterManager();
			this.rosterManager.addListener('rosterchanged', this.onRosterChanged, this);
			this.rosterManager.addListener('presencechanged', this.onPresenceChanged, this);

			this.update();
			
		} else
			throw 'XMPP plugin not found';
	},
	
	/*
	 * Removes event hooks from the XMPP plugin's roster manager. 
	 */
	unhookPlugin : function()
	{
		// Find the XMPP plugin
		if (this.xmppPlugin)
		{
			this.rosterManager.removeListener('rosterchanged', this.onRosterChanged, this);
			this.rosterManager.removeListener('presencechanged', this.onPresenceChanged, this);
		}
	},
	
	/*
	 * Handles a 'rosterchanged' event by calling update, which in turn populates the store with the new data.
	 */
	onRosterChanged : function()
	{
		this.update();
	},
	
	/*
	 * Handles a 'rosterchanged' event by calling update, which in turn populates the store with the new data.
	 */
	onPresenceChanged : function(manager, entry)
	{
		this.update();
	},

	/*
	 * Destroys the store and releases the event hooks.
	 */
	destroy : function()
	{
		// Unhook the events from the XMPP plugin.
		this.unhookPlugin();
		
		// Call super.destroy
		Zarafa.plugins.xmpp.XmppRosterStore.superclass.destroy();
	}
	
});

Ext.reg('zarafa.xmpprosterstore', Zarafa.plugins.xmpp.data.XmppRosterStore);
