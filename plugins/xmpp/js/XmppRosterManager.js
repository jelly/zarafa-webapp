Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppRosterManager
 * @extends Ext.util.Observable
 * 
 * The roster manager maintains a list of known users. The manager obtains a complete list of known 
 * users at login, after which updates to this list (i.e. user add/remove events, presence changed)
 * are sent from the server as separate notifications (presence messages). 
 * 
 * For more information on the XMPP roster and roster management, refer to 
 * <a href="http://xmpp.org/rfcs/rfc3921.html#roster">Section 7 of the XMPP specification (rfc3921)</a>. 
 * 
 */
// TODO add an 'entry changed' event for when the vCard is loaded, or for when some other change
// to a single item is made.
Zarafa.plugins.xmpp.XmppRosterManager = Ext.extend(Ext.util.Observable, {
	
	/**
	 * @constructor
	 * @param {Zarafa.plugins.xmpp.XmppPlugin} xmppPlugin XMPP plugin instance that the roster manager belongs to. 
	 */
	constructor : function(xmppPlugin)
	{
		
		// Reference to the XMPP plugin that this roster manager belongs to
		this.xmppPlugin = xmppPlugin;
		
		// Entries are kept in a map.
		this.entries = {};
	
		// Empty config object. Just a place holder for when someone wants to add it to the
		// parameter list in the future.
		var config = {};
		this.addEvents({
			/**
			 * @event rosterchanged
			 * 
			 * Fires when the set of entries in the roster has changed. It fires straight after the 
			 * roster has first been obtained from the server through and IQ query message, and when
			 * users are added to- or deleted from the roster. 
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppRosterManager} rosterManager roster manager that fired the event
			 * @param {Object} entries map of entries in the roster, with JID as index.
			 */
			'rosterchanged' : true,
			
			/**
			 * @event presencechanged
			 * 
			 * Fires when the presence of an invididual entry changes. 
			 * 
			 * @param {Zarafa.plugins.xmpp.XmppRosterManager} rosterManager roster manager that fired the event
			 * @param {Zarafa.plugins.xmpp.XmppRosterEntry} item item whose presence has changed 
			 */
			'presencechanged' : true
		});
		
		
		this.listeners = config.listeners;

		// Call superclass constructor
		Zarafa.plugins.xmpp.XmppRosterManager.superclass.constructor.call(this, config);
		
		// Hook the event listeners of the connection object 
		// TODO unhook this somewhere for a cleanup? Only relevant if plugins can get un-loaded at run-time I guess?
		var connection = xmppPlugin.getConnection();
		connection.registerHandler('onconnect', this.onConnect.createDelegate(this));
		connection.registerHandler('ondisconnect', this.onDisconnect.createDelegate(this));
		connection.registerHandler('presence', this.onPresence.createDelegate(this));
		connection.registerHandler('iq', this.onIQ.createDelegate(this));
	},
	
	/*
	 * Handles a connection event from the XMPP connection. Clears and re-initialises the
	 * roster data.
	 */
	onConnect : function()
	{
		// Get roster
		this.queryRoster();
		
		// Get own vCard
		this.queryVCard();

		// Fire changed event
		this.fireEvent('rosterchanged', this, this.entries);
	},
	
	/*
	 * Handles a disconnect even from the XMPP connection. Clears the roster.
	 */
	onDisconnect : function()
	{
		// TODO fire event
		this.entries = {};
		
		// Fire changed event
		this.fireEvent('rosterchanged', this, this.entries);
	},
	
	/*
	 * Parses an XMPP presence packet.
	 */
	// TODO can a presence packet contain multiple presence nodes?
	onPresence : function(packet)
	{
		// Get the <presence> 
		var presenceNode = packet.getDoc().firstChild;
		
		// Get the from field
		var from = presenceNode.getAttribute('from');
		
		// The from field is constructed as JID/resource, so remove the resource part
		// here to yield the JID
		from = Zarafa.plugins.xmpp.splitJID(from).jid;

		// Optional show/status nodes
		// As per XMPP spec, the <show> is omitted when the user is online
		var show = Zarafa.plugins.xmpp.getChildNodeValue(presenceNode, 'show') || 'online';
		var status = Zarafa.plugins.xmpp.getChildNodeValue(presenceNode, 'status') || '';
		
		// Get the presence type
		var type = presenceNode.getAttribute('type');
		if (type == 'unavailable') show = 'offline';

		// Get an entry object that corresponds to JID 
		var entry = this.entries[from];
		
		// If the entry is not found in the roster, create a new one
		if (!entry)
		{
			// Create new entry
			entry = new Zarafa.plugins.xmpp.XmppRosterEntry(from, null, null);
			
			// Add it to the roster
			this.entries[from] = entry;
		
			// Fire changed event
			this.fireEvent('rosterchanged', this, this.entries);
			
		}

		// Update entry presence
		entry.getPresence().setShow(show);
		entry.getPresence().setStatus(status);
		
		var xElements = presenceNode.getElementsByTagName('x');

		/*
		for (var i=0, xElement; xElement=xElements[i]; i++)
		{
			var xmlns = xElement.getAttribute('xmlns');

			// Check if this JID has a vCard that can be queried
//			if (xmlns.indexOf(NS_VCARD) != -1 && !entry.getVCard().isPopulated())
//				this.queryVCard(from);
			
			// Check if this JID has an avatar image that can be retrieved
			// if (xmlns.indexOf('vcard-temp:x:update') != -1)
			// ...
		}
		*/
		
		// Fire presence changed event
		this.fireEvent('presencechanged', this, entry);
		
	},
	
	/**
	 * Sends a request to the server to acquire the roster.  
	 * 
	 * Refer to RFC3921 Section 7.3 for more information
	 * http://xmpp.org/rfcs/rfc3921.html#roster
	 */
	queryRoster : function()
	{
		// Create a new JSJacIQ object, which represents an IQ (information query) packet,
		// and populate it with the required information.
		var packet = new JSJaCIQ();
	    packet.setIQ(null, 'get', 'roster_1');
	    packet.setQuery(NS_ROSTER);
	    
	    // Sends the IQ packet to the server.
	    this.xmppPlugin.getConnection().sendIQ(packet, {result_handler: this.queryRosterCallback.createDelegate(this) });
	},
	
	/**
	 * Callback function for the queryRoster method. It inspects the received packet's contents and
	 * builds a list of roster entries. 
	 * @param {JsJacPacket} packet
	 */
	queryRosterCallback : function(packet)
	{
		// This method first clears the entries map and then repopulates it
		// from scratch as entries are found in the packet. This saves us from
		// having to write logic to remove entries from the current roster 
		// that do not appear in the packet. 
		
		// Retain the old entries so that we may re-insert them into the roster
		// as they are found in the packet
		var oldEntries = this.entries || {};
		var me = this.getMe();
		
		// Clear the roster, but retain the 'me' object.
		this.entries = {};
		this.entries[me.getJID()] = me;
		
		var itemNodeList = packet.getDoc().getElementsByTagName('item');
		for (var i=0, item; item = itemNodeList.item(i); i++)
		{
			var jid = item.getAttribute('jid');
			var name = item.getAttribute('name');
			var subscription = item.getAttribute('subscription');
			
			// Check if the user already existed in the roster, and recycle it if so
			var entry = oldEntries[jid];
			
			// If no entry is found, add it  
			if (entry)
			{
				
				entry.setJID(jid);
				entry.setName(name);
				entry.setSubscription(subscription);

				entry.clearGroups();
			} else
			{
				entry = new Zarafa.plugins.xmpp.XmppRosterEntry(jid, name, subscription);
			}

			// Add the entry to the entry map
			this.entries[jid] = entry;
			
			// Query the entry's vCard info
			this.queryVCard(jid);
			
			// Process for nested <group> elements. Since a user can be a member
			// of multiple groups, there may be zero or more.
			var groupNodeList = item.childNodes;
			for (var j=0, groupElement; groupElement = groupNodeList.item(j); j++)
			{
				// Child nodes of <item> should be <group>, but let's skip any non-<group>
				// nodes here just to make sure this method doesn't break when new stuff
				// gets added to the spec.
				if (groupElement.nodeName != 'group') continue;
				
				var groupName = groupElement.firstChild.nodeValue;
				
				// Add the group to the entry
				entry.addGroup(groupName);
			}
		}
		
		// Fire changed event
		this.fireEvent('rosterchanged', this, this.entries, this.groups);
	},
	
	/**
	 * Sends an information query (IQ) packet to the XMPP server to request the vCard for
	 * a given entry. 
	 * 
	 * @param {String} jid jid of the entry to query. 
	 */
	queryVCard : function(jid)
	{
		// Create a new JSJacIQ object, which represents an IQ (information query) packet,
		// and populate it with the required information.
		var packet = new JSJaCIQ();
	    packet.setIQ(jid, 'get', Math.random() * 10000000);
	    
	    // Cross-browser method for getting a <vCard xmlns="vcard-temp"/> element.
	    var doc = packet.getDoc();
	    if (doc.createElementNS)
    	{
    	    var vCardElement = doc.createElementNS(NS_VCARD, 'vCard');
    	    doc.firstChild.appendChild(vCardElement);
    	} else
		{
    	    var vCardElement = packet.appendNode('vcard');
    	    vCardElement.setAttribute('xmlns', NS_VCARD);
		}

	    // Fill in the 'from' field
	    // doc.firstChild.setAttribute('from', this.xmppPlugin.getUserJID());
	    
	    // Sends the IQ packet to the server.
	    this.xmppPlugin.getConnection().sendIQ(packet, { result_handler: this.queryVCardCallback.createDelegate(this) });
	},
	
	/*
	 * Handles a vcard query result.
	 */
	queryVCardCallback : function(packet)
	{
		var element = packet.getDoc().firstChild;
		
		// Get the JID of the originating user
		var from = element.getAttribute('from');
		
		if (from)
		{
			from = Zarafa.plugins.xmpp.splitJID(from).jid;
			
			// Get a roster entry for this vCard
			var entry = this.getEntryByJID(from);
			
			entry.getVCard().populate(element.getElementsByTagName('vCard')[0]);
		}
	},

	/*
	 * Handles incoming IQ (information query) packets and passes packets of the namespace
	 * 'jabber:iq:roster' (NS_ROSTER) to the processRosterQuery method. These packets update
	 * the roster contents and can hold messages about items being added, removed, or updated.
	 * 
	 * A large packet carrying multiple items is sent by the server to the client in response
	 * to the roster query sent by the queryRoster method. This packet is used to populate the
	 * roster initially after connect.
	 * 
	 * @param {JSJacIQ} packet incoming IQ packet 
	 */
	onIQ : function(packet)
	{
		// Process query items
		var queryNodes = packet.getDoc().firstChild.getElementsByTagName('query');
		Ext.each(queryNodes, function(query) {
			if (query.getAttribute('xmlns') == NS_ROSTER) this.processRosterQuery(query);
		}, this);
	},
	
	/*
	 * Processes a roster query element.
	 * 
	 * Refer to RFC3921 Section 7.3 for more information
	 * http://xmpp.org/rfcs/rfc3921.html#roster
	 * 
	 * @param {Element} element dom element that represents a <query> element.
	 */
	processRosterQuery : function(element)
	{
		
		Ext.each(element.getElementsByTagName('item'), function(item) {
			
			// Get the JID, name, and subscription type
			var jid = item.getAttribute('jid');
			var name = item.getAttribute('name');
			var subscription = item.getAttribute('subscription');
			
			// Get entry object
			var entry = this.entries[jid];
			
			// If the subscription type is 'remove' and the item exists in the
			// roster, remove it
			if (subscription == 'remove' && entry)
				delete this.entries[jid];

			// If the subscription type is not 'remove', add/update the entry
			if (subscription != 'remove')
			{
				// If the entry doesn't exist in the roster, create it.
				if (!entry)
				{
					entry = new Zarafa.plugins.xmpp.XmppRosterEntry(jid, name, subscription);
					this.entries[jid] = entry;
					
					// Get vCard for the new entry
					this.queryVCard(jid);
				}
				
				// Collect groups
				entry.clearGroups();
				Ext.each(item.getElementsByTagName('group'), function(group) {
					entry.addGroup(group.firstChild.nodeValue);
				});
			}
			
		}, this);
		
		// Fire presence changed event
		this.fireEvent('rosterchanged', this, this.entries);
		
	},

	/**
	 * Returns a map of entries
	 * @return {Object} map of roster entries, indexed by JID.
	 */
	getEntries : function()
	{
		return this.entries;
	},

	/**
	 * Gets and entry by (bare) JID. If the entry does not exists, this method returns undefined.
	 * @param {String} jid entry's bare JID. 
	 * @return {Zarafa.plugins.xmpp.XmppRosterEntry} the entry that corresponds to the given bare JID, or undefined if no such entry exists.
	 */
	getEntryByJID : function(jid)
	{
		return this.entries[jid];
	},
	
	/**
	 * Gets a roster entry by email address.
	 * 
	 * @param {String} email email address to look for.
	 * @return {Zarafa.plugins.xmpp.XmppRosterEntry} the entry that corresponds to the email address, or undefined if no such entry exists.
	 */
	getEntryByEmail : function(email)
	{
		for (var key in this.entries)
			if (this.entries[key].getVCard().containsEmail(email))
				return this.entries[key];
		
		return undefined;
	},
	
	/**
	 * Finds the XmppRosterEntry that corresponds to the currently logged in user. If the entry is not found, a new unitinialised entry is
	 * created.
	 * @return {XmppRosterEntry} the entry that corresponds to the currently logged in user.
	 */
	getMe : function()
	{
		var jid = this.xmppPlugin.getUserJID();
		var me = this.entries[jid];
		
		if (!me)
			this.entries[jid] = me = new Zarafa.plugins.xmpp.XmppRosterEntry(jid, null, 'both');
		
		return me;
	},
	
	/**
	 * @return {String} the 'show' property of the entry that represents the currently logged in user.
	 */
	getMyShow : function()
	{
		return this.getMe().getPresence().getShow();
	},
	
	/**
	 * @return {String} the status string of the entry that represents the currently logged in user.
	 */
	getMyStatus : function()
	{
		return this.getMe().getPresence().getStatus();
	},
	
	/**
	 * Sets the presence (show, status) of the currently logged in user and sends it to the XMPP server. For
	 * a description of the show and status properties, see {@see Zarafa.plugins.xmpp.XmppPresence}.
	 * 
	 * @param {String} show show presence (i.e. 'away', 'dnd', etc.) 
	 * @param {String} status status text (i.e. 'I'm not here right now) 
	 */
	setPresence : function(show, status)
	{
		// Get the entry of the currently logged in user and get its presence
		// If there is currently no entry in the roster that corresponds to this user,
		// Create a new empty presence object and use that instead
		var me = this.getMe();
		
		// Update the me object
		me.getPresence().setShow(show);
		me.getPresence().setStatus(status);

		// Send the presence packet to the server
		this.xmppPlugin.getConnection().send(me.getPresence().toJSJacPresence());
		
		// Fire presence changed event
		this.fireEvent('presencechanged', this, me);
	}
	
});
