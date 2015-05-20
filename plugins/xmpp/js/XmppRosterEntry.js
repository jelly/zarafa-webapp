Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppRosterEntry
 * @extends Object
 * 
 * Represents an entry (user) in the roster. 
 * 
 */
Zarafa.plugins.xmpp.XmppRosterEntry = Ext.extend(Object, {
	
	/**
	 * @constructor
	 * @param {String} jid Unique XMPP ID ('Jabber ID')
	 * @param {String} name user name
	 * @param {String} subscription subscription type ('none', 'to', 'from', 'both')
	 */
	constructor : function(jid, name, subscription)
	{
		
		// Copy parameters
		this.jid = jid;
		this.setName(name);
		this.subscription = subscription;
		
		// Initialise group list
		this.groups = [];
		
		// Create a vCard for this entry
		this.vCard = new Zarafa.plugins.xmpp.XmppVCard();
		
		// Create a presence object
		this.presence = new Zarafa.plugins.xmpp.XmppPresence('offline', '');
		
		// Parent constructor
		Zarafa.plugins.xmpp.XmppRosterEntry.superclass.constructor.call(this);
	},
	
	/**
	 * @return {String} JID ('Jabber ID') of this entry.
	 */
	getJID : function()
	{
		return this.jid;
	},
	
	/**
	 * @return {String} returns the user name of this entry. 
	 */
	getName : function()
	{
		return this.name;
	},
	
	/**
	 * Returns a display-friendly representation of the entry. 
	 * @return {String} the name of the entry if this has been set, the JID otherwise. 
	 */
	getDisplayName : function()
	{
		return this.getVCard().getFullName() || this.name || this.jid;
	},
	
	/**
	 * @return {String} subscription type ('none', 'to', 'from', 'both')
	 */
	getSubscription : function()
	{
		return this.subscription;
	},
	
	/**
	 * Sets the entry's JID.
	 * @param {String} jid Unique XMPP ID ('Jabber ID')
	 */
	setJID : function(jid)
	{
		this.jid = jid;
	},
	
	/**
	 * Sets the entry's user name.
	 * @param {String} name user name
	 */
	setName : function(name)
	{
		this.name = Ext.util.Format.htmlEncode(name);
	},
	
	/**
	 * Sets the entry's subscription type.
	 * @param {String} subscription subscription type ('none', 'to', 'from', 'both')
	 */
	setSubscription : function(subscription)
	{
		this.subscription = subscription;
	},
	
	/**
	 * @return {String[]} the set of groups this entry is a member of
	 */
	getGroups : function()
	{
		return this.groups;
	},
	
	/**
	 * Clears the list of groups in this entry. 
	 */
	clearGroups : function()
	{
		this.groups = [];
	},
	
	/**
	 * Adds a group to this entry.  
	 * 
	 * @param {String} group a group this entry is a part of.
	 */
	addGroup : function(group)
	{
		this.groups.push(Ext.util.Format.htmlEncode(group));
	},
	
	/**
	 * Removes a group from this entry.
	 * 
	 * @param {String} group a group this entry is a part of.
	 */
	removeGroup : function(group)
	{
		this.groups.remove(group);
	},
	
	/**
	 * Returns the vCard for this entry.
	 * 
	 * @return {Zarafa.plugins.xmpp.XmppVCard} the vCard for this entry.
	 */
	getVCard : function()
	{
		return this.vCard;
	},
	
	/**
	 * Gets the presence of this entry.
	 * 
	 * @return {Zarafa.plugins.xmpp.XmppPresence} presence object.
	 */
	getPresence : function()
	{
		return this.presence;
	},
	
	/**
	 * Sets the presence of the entry.
	 *  
	 * @param show user availability. One of 'chat', 'dnd', 'away', 'xa', or null 
	 * @param status user status message
	 */
	setPresence : function(show, status)
	{
		this.presence.set(show, status);
	}
	
});
