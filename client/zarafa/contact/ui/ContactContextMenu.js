Ext.namespace('Zarafa.contact.ui');

/**
 * @class Zarafa.contact.ui.ContactContextMenu
 * @extends Zarafa.core.ui.menu.ConditionalMenu
 * @xtype zarafa.contactcontextmenu
 */
Zarafa.contact.ui.ContactContextMenu = Ext.extend(Zarafa.core.ui.menu.ConditionalMenu, {
	// Insertion points for this class
	/**
	 * @insert context.contact.contextmenu.actions
	 * Insertion point for adding actions menu items into the context menu
	 * @param {Zarafa.contact.ui.ContactContextMenu} contextmenu This contextmenu
	 */
	/**
	 * @insert context.contact.contextmenu.options
	 * Insertion point for adding options menu items into the context menu
	 * @param {Zarafa.contact.ui.ContactContextMenu} contextmenu This contextmenu
	 */

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			items : [
				this.createContextActionItems(),
				{ xtype : 'menuseparator' },
				container.populateInsertionPoint('context.contact.contextmenu.actions', this),
				{ xtype : 'menuseparator' },
				container.populateInsertionPoint('context.contact.contextmenu.options', this)
			],
			defaults : {
				xtype: 'zarafa.conditionalitem',
				hideOnDisabled : false
			}
		});
	
		Zarafa.contact.ui.ContactContextMenu.superclass.constructor.call(this, config);
	},
	
	/**
	 * Create the Action context menu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Action context menu items
	 * @private
	 */
	createContextActionItems : function()
	{
		return [{
			text : _('Open'),
			iconCls : 'icon_open',
			scope : this,
			handler : this.onContextItemOpen,
			singleSelectOnly : true
		}, {
			text : _('Print'),
			iconCls : 'icon_print',
			scope : this,
			handler : this.onContextItemPrint,
			singleSelectOnly : true
		}, {
			xtype: 'menuseparator'
		}, {
			text : _('Categories'),
			iconCls : 'icon_categories',
			scope : this,
			handler : this.onContextItemCategories,
			singleSelectOnly : true
		}, {
			xtype: 'menuseparator'
		}, {
			text : _('Delete'),
			iconCls : 'icon_delete',
			scope : this,
			handler : this.onContextItemDelete
		}];
	},

	/**
	 * Event handler which is called when the user selects the 'Open'
	 * item in the context menu. This will open the item in a new dialog.
	 * @private
	 */
	onContextItemOpen : function()
	{
		Zarafa.contact.Actions.openDialog(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Print'
	 * item in the context menu. This will open the print dialog.
	 * @private
	 */
	onContextItemPrint : function()
	{
		Zarafa.common.Actions.openPrintDialog(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Categories'
	 * item in the context menu. This will open {@link Zarafa.common.categories.dialogs.CategoriesContentPanel CategoriesContentPanel}.
	 * @private
	 */
	onContextItemCategories : function()
	{
		Zarafa.common.Actions.openCategoriesContent(this.records);
	},

	/**
	 * Event handler which is called when the user selects the 'Delete'
	 * item in the context menu. This will delete selected contacts from view.
	 * @private
	 */
	onContextItemDelete : function()
	{
		var store;

		Ext.each(this.records, function(record) {
			store = record.store;
			store.remove(record);
		});

		store.save(this.records);
	}
});

Ext.reg('zarafa.contactcontextmenu', Zarafa.contact.ui.ContactContextMenu);
