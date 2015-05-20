Ext.namespace('Zarafa.plugins.xmpp');

/**
 * @class Zarafa.plugins.xmpp.XmppVCard
 * @extends Object
 * 
 * Represents vCard information about an XMPP roster entry. This can be used for instance
 * to relate roster entries and email addresses. 
 * 
 */
// TODO parse the rest of the VCARD information
// TODO implement avatars
Zarafa.plugins.xmpp.XmppVCard = Ext.extend(Object, {
	
	/**
	 * @constructor
	 */
	constructor : function()
	{
		
		// Set populated to false. This property is used to check if the 
		// vcard has previously been populated using a vcard query. 
		this.populated = false;
		
		// Image is not initialised initially (to be used for avatar)
		this.imageType = '';
		this.imageData = '';
		
		// Initialise group list
		this.emailAddresses = [];
		
		// Initialise full name
		this.fullName = '';
		
		// Parent constructor
		Zarafa.plugins.xmpp.XmppVCard.superclass.constructor.call(this);
	},
	
	/**
	 * 
	 * @return {Array}
	 */
	getEmailAddresses : function()
	{
		return this.emailAddresses;
	},
	
	/**
	 * @return {String} full name (i.e. 'Bill Gates').
	 */
	getFullName : function()
	{
		return this.fullName;
	},
	
	/**
	 * Checks if a given email is one of the email addresses in this vCard.
	 * 
	 * @param {String} email email address to check against. 
	 * @return {Boolean} true iff the email address is in this vcard instance.
	 */
	containsEmail : function(email)
	{
		return this.emailAddresses.indexOf(email) != -1;
	},
	
	/**
	 * Extracts the email addresses from a vCard XML item. 
	 *  
	 * @param {Element} element a <vCard> dom element from an information query (<iq>) message.
	 */
	populateEmail : function(element)
	{
		// Get email addresses from the vCard element. First get the <EMAIL> element
		var emailElements = element.getElementsByTagName('EMAIL');
		
		// If there is at least one such element, just take the first one (assume that there are
		// either zero or none). Iterate over its children.
		if (emailElements.length>0)
			Ext.each(emailElements[0].childNodes, function(emailElement) {
				
				// These tags may be empty (i.e. <USER></USER>), so check
				// if emailElement.firstChild isn't falsy. 
				if (emailElement.firstChild)
					this.emailAddresses.push(emailElement.firstChild.nodeValue);
				
			}, this);
	},
	
	/**
	 * Extracts the avatar (photo) from a vCard XML item. 
	 *  
	 * @param {Element} element a <vCard> dom element from an information query (<iq>) message.
	 */
	populatePhoto : function(element)
	{
		/*
		// Get avatars from the vCard element. First get the <PHOTO> element
		var photoElements = element.getElementsByTagName('PHOTO');
		
		// If there is at least one such element, just take the first one (assume that there are
		// either zero or none). Iterate over its children.
		if (photoElements.length>0)
		{
			...
		}
		*/
	},
	
	/**
	 * Extracts the personal info from a vCard XML item (name, address, etc.) 
	 *  
	 * @param {Element} element a <vCard> dom element from an information query (<iq>) message.
	 * TODO incomplete
	 */
	populatePersonalInfo : function(element)
	{
		this.fullName = Zarafa.plugins.xmpp.getChildNodeValue(element, 'FN');
	},
	
	/**
	 * Populates the vCard with data from an XML DOM element. 
	 *  
	 * @param {Element} element a <vCard> dom element from an information query (<iq>) message.
	 */
	populate : function(element)
	{
		
		// Get email addresses
		this.populateEmail(element);
		
		// Get avatar
		this.populatePhoto(element);
		
		// Personal information (name, department, address, etc.)
		this.populatePersonalInfo(element);
		
		// Signal that the vCard has now been populated with data from a vCard element
		this.populated = true;
	},
	
	/**
	 * @return {Boolean} true iff this entry has been previously populated with data from a vCard element. 
	 */
	isPopulated : function()
	{
		return this.populated;
	}

	
});
