Ext.namespace('Zarafa.calendar.ui');

/**
 * @class Zarafa.common.ui.ContextMainPanelToolbar
 * @extends Ext.Toolbar
 * @xtype zarafa.contextmainpaneltoolbar
 *
 * Main toolbar for all the contexts which contains paging toolbar, foldertitle
 * and some context related menu buttons e.g. copy/move, delete
 */
Zarafa.common.ui.ContextMainPanelToolbar = Ext.extend(Ext.Toolbar, {
	/**
	 * @cfg {Zarafa.core.Context} context The context to which this toolbar belongs
	 */
	context: undefined,
	
	/**
	 * The {@link Zarafa.core.ContextModel} which is obtained from the {@link #context}.
	 * @property
	 * @type Zarafa.mail.MailContextModel
	 */
	model : undefined,

	/**
	 * @cfg {Array} paging Configuration objects of pagination toolbars which should
	 * be added. This can be used if the default pagination toolbar is not sufficient,
	 * and in some situations should be swapped with a different paging toolbar.
	 */
	paging : undefined,

	/**
	 * @cfg {String} defaultTitle The title for the {@link Ext.Panel} Panel
	 */
	defaultTitle: _('Zarafa WebApp'),
	
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

		// Built up the items array
		var items = [];

		// Then we add all pagination toolbars which are registered,
		// and we add our own default pagination toolbar.
		items.push({
			xtype: 'zarafa.paging',
			ref : 'pagesToolbar',
			pageSize : 50,
			store : config.model ? config.model.getStore() : undefined
		});

		if (!Ext.isEmpty(config.paging)) {
			items = items.concat(config.paging);
		}

		// We fill everything up to the right
		items.push({
			xtype: 'tbfill'
		});

		// We add the default buttons
		items = items.concat([{
			xtype: 'zarafa.toolbarbutton',
			overflowText : _('Copy/Move'),
			tooltip: _('Copy/Move') + ' (Ctrl + M)',
			iconCls: 'icon_copy',
			nonEmptySelectOnly: true,
			handler: this.onCopyMove,
			scope: this
		},{
			xtype: 'zarafa.toolbarbutton',
			overflowText: _('Delete'),
			tooltip: _('Delete') + ' (DELETE)',
			iconCls: 'icon_delete',
			nonEmptySelectOnly: true,
			handler: this.onDelete,
			scope: this
		}]);

		// Add the extra items
		if (!Ext.isEmpty(config.items)) {
			items = items.concat(config.items);
		}

		// Delete config.items as we will override it
		// during Ext.applyIf.
		delete config.items;

		// Update configuration
		Ext.applyIf(config, {
			items : items,
			enableOverflow : true
		});

		Zarafa.common.ui.ContextMainPanelToolbar.superclass.constructor.call(this, config);
	},

	/**
	 * Open the {@link Zarafa.common.dialogs.CopyMoveContentPanel CopyMoveContentPanel} for copying
	 * or moving the currently selected folders.
	 * @private
	 */
	onCopyMove : function()
	{
		Zarafa.common.Actions.openCopyMoveContent(this.model.getSelectedRecords());
	},

	/**
	 * Delete the currently selected messages. If any of the records is a recurring item,
	 * then the {@link #Zarafa.common.dialogs.MessageBox.select MessageBox} will be used
	 * to select between the recurring and single appointment.
	 * @private
	 */
	onDelete : function()
	{
		Zarafa.common.Actions.deleteRecords(this.model.getSelectedRecords());
	},

	/**
	 * Open the Print dialog
	 * @private
	 */
	onPrint : function()
	{
		Zarafa.common.Actions.openPrintDialog(this.model.getSelectedRecords());
	}
});

Ext.reg('zarafa.contextmainpaneltoolbar', Zarafa.common.ui.ContextMainPanelToolbar);
