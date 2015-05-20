Ext.namespace('Zarafa.common.ui.grid');

/**
 * @class Zarafa.common.ui.grid.GridView
 * @extends Ext.grid.GridView
 * @xtype zarafa.gridview
 *
 * Zarafa specific GridView which contain extra features and bugfixes
 * which could not be resolved by plugins or directly in extjs.
 */
Zarafa.common.ui.grid.GridView = Ext.extend(Ext.grid.GroupingView, {
	/**
	 * @cfg {Boolean} disableScrollToTop {@link Ext.grid.GridView} by default scrolls to top when data is loaded in
	 * {@link Zarafa.core.data.MAPIStore MAPIStore}, but in our case {@link Zarafa.core.ContextModel ContextModel} handles
	 * selection of records based on settings. so this flag will disable default functionality of {@link Ext.grid.GridView}.
	 */
	disableScrollToTop : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		Ext.applyIf(config, {
			enableGrouping : true,
			enableGroupingMenu : false,
			groupTextTpl : '{text:htmlEncode} ({values.rs.length} {[ngettext("Item","Items", values.rs.length)]})',
			disableScrollToTop : false,
			deferEmptyText : true,
			emptyText : '<div class="emptytext">' + _('There are no items to show in this view') + '</div>',
			forceFit : true
		});

		Zarafa.common.ui.grid.GridView.superclass.constructor.call(this, config);

		this.initEvents();
	},

	/**
	 * Initialize event handlers
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.common.ui.grid.GridView.superclass.initEvents.call(this);

		this.on('rowremoved', this.onRowRemoved, this);
	},

	/**
	 * Binds a new Store and ColumnModel to this GridView. Removes any listeners from the old objects (if present)
	 * and adds listeners to the new ones
	 * @param {Ext.data.Store} newStore The new Store instance
	 * @param {Ext.grid.ColumnModel} newColModel The new ColumnModel instance
	 * @private
	 */
	initData : function(newStore, newColModel)
	{
		if (this.ds) {
			this.ds.un('exception', this.onException, this);
		}

		Zarafa.common.ui.grid.GridView.superclass.initData.apply(this, arguments);

		if (this.ds) {
			this.ds.on('exception', this.onException, this);
		}
	},

	/**
	 * Event handler will be called when the {@link Zarafa.core.data.MAPIStore Store} has
	 * fired an exception event.
	 * @param {Ext.data.DataProxy} proxy The proxy which fired the event.
	 * No event handler may modify any properties inside the provided record.
	 * @param {String} type See {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
	 * for description.
	 * @param {String} action See {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
	 * for description.
	 * @param {Object} options See {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
	 * for description.
	 * @param {Object} response See {@link Ext.data.DataProxy}.{@link Ext.data.DataProxy#exception exception}
	 * for description.
	 * @param {Zarafa.core.data.MAPIRecord} record The record which was subject of the request
	 * that encountered an exception.
	 * @param {String} error (Optional) Passed when a thrown JS Exception or JS Error is
	 * available.
	 * @private
	 */
	onException : function(proxy, type, action, options, response, arg)
	{
		if (options && options.actionType === 'list') {
			this.mainBody.update('<div class="x-grid-empty"><div class="emptytext">' + response.error.info.display_message + '</div></div>');
		}
	},

	/**
	 * Event handler is used to execute {@link #scrollToTop} method to scroll to first item after
	 * {@link Zarafa.core.data.MAPIStore MAPIStore} has completed loading all data, but we don't need this
	 * default behaviour and handle it differently through {@link Zarafa.core.ContextModel ContextModel},
	 * so to disable this functionality we have provided a config {@link #disableScrollToTop}.
	 * @param {Ext.data.Store} store The store which was loaded
	 * @param {Ext.data.Record[]} records The records which were loaded into the store
	 * @param {Object} options The options which were used to load the data
	 */
	onLoad : function(store, record, options)
	{
		// if grid view is destroyed then we shouldn't call this function.
		// if reload/search is called than we don't want to scroll, and if load is called than we should scroll to top.
		if (!Ext.isDefined(options.reload) && this.disableScrollToTop !== true && Ext.isDefined(this.scroller.dom) && options.actionType == 'list') {
			Zarafa.common.ui.grid.GridView.superclass.onLoad.apply(this, arguments);
		}
	},

	/**
	 * Event handler which is called when the data inside the store has changed.
	 * Because {@link #refresh} blocks {@link #applyEmptyText}, we have to call it
	 * here manually again.
	 * @private
	 */
	onDataChange : function()
	{
		Zarafa.common.ui.grid.GridView.superclass.onDataChange.apply(this, arguments);
		this.applyEmptyText();
	},

	/**
	 * Displays the configured emptyText if there are currently no rows to display
	 * @private
	 */
	applyEmptyText : function()
	{
		// When we are reloading, do not apply the empty text, we do not
		// want to confuse the user by indicating no items are found, while we in fact
		// are still downloading the list of items.
		if (!this.grid.store.isExecuting(Zarafa.core.Actions['list'])) {
			Zarafa.common.ui.grid.GridView.superclass.applyEmptyText.call(this);
		}
	},

	/**
	 * This is called internally, once, by this.render after the HTML elements are added to the grid element.
	 * This is always intended to be called after renderUI. Sets up listeners on the UI elements
	 * and sets up options like column menus, moving and resizing.
	 * This function is overridden to use a {@link Zarafa.common.ui.grid.GridDragZone} for the {@link #dragZone},
	 * rather then the default {@link Ext.grid.GridDragZone}.
	 * @private
	 */
	afterRenderUI : function()
	{
		Zarafa.common.ui.grid.GridView.superclass.afterRenderUI.apply(this, arguments);

		if (this.dragZone) {
			this.dragZone.destroy();

			this.dragZone = new Zarafa.common.ui.grid.GridDragZone(this.grid, {
				ddGroup : this.grid.ddGroup || 'GridDD'
			});
		}
	},

	/**
	 * Called when the GridView has been rendered.
	 * This will check if the store has been loaded already, and apply
	 * the emptyText if needed.
	 * @private
	 */
	afterRender : function()
	{
		Zarafa.common.ui.grid.GridView.superclass.afterRender.apply(this, arguments);

		// When deferEmptyText is false, the emptyText will only be applied after
		// the store has been loaded (the 'load' event has been fired). However, when
		// we arrive here, while the store has already been loaded, we would show nothing,
		// since we missed the event.
		var store = this.grid.store;
		if (this.deferEmptyText === false && store) {
			if (!store.lastOptions || !Ext.isEmpty(Object.keys(store.lastOptions))) {
				this.applyEmptyText();
			}
		}
	},

	/**
	 * Called after a row has been removed for the GridView.
	 * This will check if the store has a next/previous row to select in the Grid
	 * @private
	 */
	onRowRemoved : function(view, rowIndex, record)
	{
		var sm = this.grid.getSelectionModel();
		var itemCount = this.grid.store.getCount();

		if (itemCount > 0) {
			// check for the next item in store else select the previous item
			if(rowIndex < itemCount) {
				sm.selectRow(rowIndex);
			} else {
				sm.selectRow(rowIndex - 1);
			}
		} else {
			sm.clearSelections();
			// When the store is empty, sm.clearSelections will not
			// fire any events to indicate that the selections have
			// changed...
			sm.fireEvent('selectionchange', sm);
		}
	}
});

Ext.reg('zarafa.gridview', Zarafa.common.ui.grid.GridView);
