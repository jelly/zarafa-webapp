Ext.namespace('Zarafa.mail.ui');

/**
 * @class Zarafa.mail.ui.MailGridContextMenu
 * @extends Zarafa.core.ui.menu.ConditionalMenu
 * @xtype zarafa.mailgridcontextmenu
 *
 * Extend {@link Zarafa.core.ui.menu.ConditionalMenu ConditionalMenu} to add the
 * {@link Zarafa.core.ui.menu.ConditionalItems ConditionalItems} for the
 * MailContext.
 */
Zarafa.mail.ui.MailGridContextMenu = Ext.extend(Zarafa.core.ui.menu.ConditionalMenu, {
	// Insertion points for this class
	/**
	 * @insert context.mail.contextmenu.actions
	 * Insertion point for adding actions menu items into the context menu
	 * @param {Zarafa.mail.ui.MailGridContextMenu} contextmenu This contextmenu
	 */
	/**
	 * @insert context.mail.contextmenu.options
	 * Insertion point for adding options menu items into the context menu
	 * @param {Zarafa.mail.ui.MailGridContextMenu} contextmenu This contextmenu
	 */

	/**
	 * @cfg {Zarafa.mail.MailContext} context The context to which this panel belongs
	 */
	context : undefined,

	/**
	 * The {@link Zarafa.mail.MailContextModel} which is obtained from the {@link #context}.
	 * @property
	 * @type Zarafa.mail.MailContextModel
	 */
	model : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context)) {
			config.model = config.context.getModel();
		}

		Ext.applyIf(config, {
			items: [
				this.createContextActionItems(),
				{ xtype: 'menuseparator' },
				container.populateInsertionPoint('context.mail.contextmenu.actions', this),
				{ xtype: 'menuseparator' },
				this.createContextOptionsItems(),
				{ xtype: 'menuseparator' },
				container.populateInsertionPoint('context.mail.contextmenu.options', this)
			]
		});

		Zarafa.mail.ui.MailGridContextMenu.superclass.constructor.call(this, config);
	},

	/**
	 * Create the Action context menu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Action context menu items
	 * @private
	 */
	createContextActionItems : function()
	{
		return [{
			xtype: 'zarafa.conditionalitem',
			text : _('Open'),
			iconCls : 'icon_open',
			singleSelectOnly: true,
			handler: this.onContextItemOpen,
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Save email as file'),
			iconCls : 'icon_saveaseml',
			handler: this.onContextItemEml,
			scope: this
		},{
			//Print button, hide this as this functionality is still not implemented, so hide this button
			hidden: false,
			xtype: 'zarafa.conditionalitem',
			text : _('Print'),
			iconCls : 'icon_print',
			singleSelectOnly: true,
			handler: this.onContextItemPrint,
			scope: this
		},{
			xtype: 'menuseparator'
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Reply'),
			iconCls : 'icon_replyEmail',
			beforeShow : this.onMenuItemBeforeShow,
			singleSelectOnly: true,
			responseMode : Zarafa.mail.data.ActionTypes.REPLY,
			handler: this.onContextItemResponse,
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Reply All'),
			iconCls : 'icon_replyAllEmail',
			singleSelectOnly: true,
			beforeShow : this.onMenuItemBeforeShow,
			responseMode : Zarafa.mail.data.ActionTypes.REPLYALL,
			handler: this.onContextItemResponse,
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Forward'),
			iconCls : 'icon_forwardEmail',
			singleSelectOnly: true,
			beforeShow : this.onMenuItemBeforeShow,
			responseMode : Zarafa.mail.data.ActionTypes.FORWARD,
			handler: this.onContextItemResponse,
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Forward as attachment'),
			iconCls : 'icon_embedded_attachment',
			singleSelectOnly: true,
			beforeShow : this.onMenuItemBeforeShow,
			responseMode : Zarafa.mail.data.ActionTypes.FORWARD_ATTACH,
			handler: this.onContextItemResponse,
			scope: this
		}];
	},

	/**
	 * Create the Option context menu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Option context menu items
	 * @private
	 */
	createContextOptionsItems : function()
	{
		return [{
			xtype: 'zarafa.conditionalitem',
			text : _('Mark Read'),
			iconCls: 'icon_mail icon_message_read',
			beforeShow : function(item, records) {
				this.onReadFlagItemBeforeShow(item, records, false);
			},
			handler : function() {
				this.onReadFlagItemClicked(true);
			},
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Mark Unread'),
			iconCls: 'icon_mail icon_message_unread',
			beforeShow : function(item, records) {
				this.onReadFlagItemBeforeShow(item, records, true);
			},
			handler : function() {
				this.onReadFlagItemClicked(false);
			},
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Categories'),
			iconCls : 'icon_categories',
			handler : function() {
				Zarafa.common.Actions.openCategoriesContent(this.records);
			},
			scope: this
		},{
			xtype: 'menuseparator'
		},
		Zarafa.mail.dialogs.MailFlagsMenu.createMailFlagSubmenu(true),
		Zarafa.mail.dialogs.MailFlagsMenu.createStateMailFlagButtons(),
		{
			xtype: 'menuseparator'
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Move to Junk Folder'),
			iconCls : 'icon_junk',
			handler: this.onContextItemJunk,
			scope: this
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Delete'),
			iconCls : 'icon_delete',
			handler: this.onContextItemDelete,
			scope: this
		},{
			xtype: 'menuseparator'
		},{
			xtype: 'zarafa.conditionalitem',
			text : _('Options'),
			iconCls : 'icon_openMessageOptions',
			beforeShow : this.onMenuItemBeforeShow,
			singleSelectOnly: true,
			handler : this.onContextItemOptions,
			scope: this
		}];
	},

	/**
	 * Event handler which is called when the user selects the 'Open'
	 * item in the context menu. This will open the item in a new panel.
	 * @private
	 */
	onContextItemOpen : function()
	{
		Zarafa.mail.Actions.openMailContent(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Save email as file'
	 * item in the context menu. This will request to download selected message
	 * as file (RFC822-formatted e-mail stream) with eml extension.
	 * @private
	 */
	onContextItemEml : function()
	{
		Zarafa.common.Actions.openSaveEmlDialog(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Print'
	 * item in the context menu. This will open the print dialog for this record.
	 * @private
	 */
	onContextItemPrint : function()
	{
		Zarafa.common.Actions.openPrintDialog(this.records);
	},

	/**
	 * Called when one of the "Reply"/"Reply All"/"Forward" menuitems are clicked.
	 * @param {Ext.Button} button The button which was clicked
	 * @private
	 */
	onContextItemResponse : function(button)
	{
		Zarafa.mail.Actions.openCreateMailResponseContent(this.records, this.model, button.responseMode);
	},

	/**
	 * Event handler which determines if menu items should be visible or not.
	 * It will check if record is faulty then hide menu items which are not supported.
	 *
	 * @param {Zarafa.core.ui.menu.ConditionalItem} item The item to enable/disable
	 * @param {Zarafa.core.data.IPMRecord[]} records The records which must be checked
	 * to see if the item must be enabled or disabled.
	 * @private
	 */
	onMenuItemBeforeShow : function(item, records)
	{
		Ext.each(records, function(record) {
			if(record.isFaultyMessage()) {
				// hide menu item and break the loop
				item.setVisible(false);

				return false;
			}
		}, this);
	},

	/**
	 * Event handler which determines if the Read Flag button must be shown.
	 * There are two kind of read flag buttons which can both make use of this
	 * function (Mark as Read and Mark as Unread buttons).
	 *
	 * This function will loop through all given {@link Zarafa.core.data.IPMRecord records}
	 * and will determine if this button can be applied to any of the records.
	 * For example, if 10 records are selected and one or more are marked as read,
	 * the Mark as Unread button will be enabled. If no records are marked as read,
	 * the button will not be enabled.
	 *
	 * @param {Zarafa.core.ui.menu.ConditionalItem} item The item to enable/disable
	 * @param {Zarafa.core.data.IPMRecord[]} records The records which must be checked
	 * to see if the item must be enabled or disabled.
	 * @param {Boolean} read The required Read state value for one or more Records before
	 * this item is enabled.
	 * @private
	 */
	onReadFlagItemBeforeShow : function(item, records, read)
	{
		var count = 0;

		Ext.each(records, function(record) {
			if (record.isRead() == read) {
				count++;
			}
		}, this);

		item.setDisabled(count == 0);
	},

	/**
	 * Event handler which is called when the item has been clicked.
	 * This will mark all selected records as read or unread.
	 *
	 * @param {Boolean} read The value for of the Read flag.
	 * @private
	 */
	onReadFlagItemClicked : function(read)
	{
		Zarafa.common.Actions.markAsRead(this.records, read);
	},

	/**
	 * Event handler which is called when the user selects the "Move to Junk"
	 * item in the context menu. This will move all selected items to the junk folder.
	 * @private
	 */
	onContextItemJunk : function()
	{
		var junkfolder = container.getHierarchyStore().getDefaultFolder('junk');
		var store = undefined;

		Ext.each(this.records, function(record) {
			store = record.store;
			record.moveTo(junkfolder);
		}, this);

		store.save(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Delete'
	 * item in the context menu. This will delete all selected records.
	 * @private
	 */
	onContextItemDelete : function()
	{
		Zarafa.common.Actions.deleteRecords(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Mail Options'
	 * item in the context menu. This will open the MailOptions panel.
	 * @private
	 */
	onContextItemOptions : function()
	{
		Zarafa.mail.Actions.openMailOptionsContent(this.records, {
			autoSave : true
		});
	}
});

Ext.reg('zarafa.mailgridcontextmenu', Zarafa.mail.ui.MailGridContextMenu);
