Ext.namespace('Zarafa.common.freebusy.ui');

/**
 * @class Zarafa.common.freebusy.ui.FreebusyContextMenu
 * @extends Zarafa.core.ui.menu.ConditionalMenu
 * @xtype zarafa.freebusycontextmenu
 *
 * Context menu special for changing the attendee status
 */
Zarafa.common.freebusy.ui.FreebusyContextMenu = Ext.extend(Zarafa.core.ui.menu.ConditionalMenu, {
	// Insertion points for this class
	/**
	 * @insert context.freebusy.userlist.contextmenu
	 * Insertion point for adding items to the context menu that is triggered when right-clicking a user row.
	 * @param {Zarafa.common.freebusy.ui.FreebusyContextMenu} contextmenu This contextmenu
	 */

	/**
	 * @cfg {Boolean} editable Allow the record to be edited
	 */
	editable : true,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		var editable = Ext.isDefined(config.editable) ? config.editable : this.editable;
		var organizer = false;
		var resolved = false;
		if (config.records) {
			if (Ext.isArray(config.records)) {
				config.records = config.records[0];
			}
			organizer = config.records.isMeetingOrganizer()
			resolved = config.records.isResolved();
		}

		Ext.applyIf(config, {
			items : [{
				xtype: 'zarafa.conditionalitem',
				text: _('Edit recipient'),
				hidden : !editable || resolved,
				handler: this.onContextMenuEditRecipientClick,
				scope: this
			},{
				xtype: 'zarafa.conditionalitem',
				text: _('Show Details'),
				hidden : !resolved,
				handler: this.openDetailsContent,
				scope: this
			},'-',{
				xtype: 'zarafa.conditionalitem',
				text: _('Required Attendee'),
				iconCls: 'x-freebusy-userlist-recipienttype-required',
				hidden : !editable || organizer, 
				recipientType : Zarafa.core.mapi.RecipientType.MAPI_TO,
				handler : this.onRecipientTypeChange,
				scope: this
			},{   
				xtype: 'zarafa.conditionalitem',
				text: _('Optional Attendee'),
				iconCls: 'x-freebusy-userlist-recipienttype-optional',
				hidden : !editable || organizer, 
				recipientType : Zarafa.core.mapi.RecipientType.MAPI_CC,
				handler : this.onRecipientTypeChange,
				scope: this
			},{   
				xtype: 'zarafa.conditionalitem',
				text: _('Resource'),
				iconCls: 'x-freebusy-userlist-recipienttype-resource',
				hidden : !editable || organizer, 
				recipientType : Zarafa.core.mapi.RecipientType.MAPI_BCC,
				handler : this.onRecipientTypeChange,
				scope: this
			},
			// Add insertion points
			container.populateInsertionPoint('context.freebusy.userlist.contextmenu', this)
			]	
		});

		Zarafa.common.freebusy.ui.FreebusyContextMenu.superclass.constructor.call(this, config);
	},

	/**
	 * Handler for the "Edit Recipient" option. This will open the edit content panel.
	 * @param {Zarafa.core.ui.ConditionalItem} item The item that was selected
	 * @private
	 */
	onContextMenuEditRecipientClick: function(item)
	{
		Zarafa.core.data.UIFactory.openCreateRecord(this.records);
	},

	/**
	 * Handler for the "Show Details" option. This will convert
	 * the {@link Zarafa.core.dat.IPMRecipientRecord recipient}
	 * into a {@link Zarafa.core.data.MAPIRecord addressbook record}
	 * which can be opened in the Addressbook details content panel.
	 *
	 * @private
	 */
	openDetailsContent : function()
	{   
		Zarafa.common.Actions.openViewRecipientContent(this.records);
	},

	/**
	 * Called when selected on of the options set in the recipient type contextmenu.
	 * @param {Zarafa.core.ui.ConditionalItem} item The item that was selected
	 * @private
	 */
	onRecipientTypeChange: function(item)
	{
		this.records.set('recipient_type', item.recipientType);
	}
});

Ext.reg('zarafa.freebusycontextmenu', Zarafa.common.freebusy.ui.FreebusyContextMenu);
