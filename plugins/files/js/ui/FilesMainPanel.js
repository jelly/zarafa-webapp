Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesMainPanel
 * @extends Zarafa.common.ui.ContextMainPanel
 * @xtype zarafa.filesmainpanel
 *
 * this class will be containing all the views that will be created for filess folder
 * main panel for the files content context
 */
Zarafa.plugins.files.ui.FilesMainPanel = Ext.extend(Zarafa.common.ui.ContextMainPanel, {
	// Insertion points for this class
	/**
	 * @insert context.files.toolbar.item
	 * Insertion point for populating Files context's main toolbar.
	 * This item is only visible when this context is active.
	 * @param {Zarafa.plugins.files.ui.FilesMainPanel} panel This panel
	 */
	/**
	 * @insert context.files.toolbar.paging
	 *
	 * Insertion point for populating files context's toolbar with extra
	 * pagination buttons. This can be used to replace the default {@link Ext.PagingToolbar}
	 * with an alternative. Files that by default all paging toolbars will be visible, and
	 * hiding a particular toolbar is the responsibility of the new pagers.
	 * @param {Zarafa.plugins.files.ui.FilesMainPanel} panel This panel
	 */
	/**
	 * @insert context.files.views
	 * Insertion point for adding views within the main panel of files context.
	 * This insertion point should be used in combination with 'main.maintoolbar.view.files'
	 * insertion point, and also view should set its store in the config object, the reference of
	 * {@link Zarafa.plugins.files.FilesContextModel FilesContextModel} is passed as parameter of this
	 * insertion point.
	 * @param {Zarafa.plugins.files.ui.FilesMainPanel} mainpanel This mainpanel
	 * @param {Zarafa.plugins.files.FilesContext} context The context for this panel
	 */
	 
	/**
	 * The main panel in which the various views are located.
	 * @property
	 * @type Zarafa.core.ui.SwitchViewContentContainer
	 */
	viewPanel : undefined,
	
	/**
	 * @constructor
	 * @param filescontext
	 */
	constructor : function(config) {
		config = config || {};
		
		Ext.applyIf(config, {
			xtype : 'zarafa.filesmainpanel',
			layout : 'zarafa.switchborder',
			
			items : [
				this.initMainItems(config),
				this.initPreviewPanel(config.context)
			]
		});
		
		Zarafa.plugins.files.ui.FilesMainPanel.superclass.constructor.call(this,config);
	},
	
	/**
	 * Initializes the the views for the mainpanel
	 *
	 * @param {Object} config Configuration object
	 * @return {Ext.panel}
	 * @private
	 */
	initMainItems : function(config) {
		return {
			xtype: 'panel',
			ref: 'filesViewPanel',
			layout: 'zarafa.collapsible',
			cls : 'zarafa-context-mainpanel',
			minWidth : 200,
			minHeight: 200,
			region : 'center',
			collapsible : false,
			split : true,
			items: [{
				xtype: 'zarafa.switchviewcontentcontainer',
				ref: '../viewPanel',
				layout : 'card',
				lazyItems : this.initViews(config.context)
			}],			
			tbar : {
				xtype: 'zarafa.filestoolbar',
				defaultTitle : dgettext('plugin_files', 'Files'),
				height:33,
				context : config.context
			}
		};
	},
	
	/**
	 * Function will initialize all views associated with files context
	 * it will also get views added through 3rd party plugins and add it here
	 * @param {Zarafa.plugins.files.FilesContextModel} model data part of files context
	 * @return {Array} array of config objects of different views
	 * @private
	 */
	initViews : function(context) {
		// add the standard available views
		var allViews = [{
			xtype: 'zarafa.filesfilegrid',
			flex: 1,
			id : 'files-gridview',
			anchor: '100%',
			context : context
		}, {
			xtype: 'zarafa.filesiconview',
			flex: 1,
			id : 'files-iconview',
			anchor: '100%',
			context : context
		}];

		var additionalViewItems = container.populateInsertionPoint('context.files.views', this, context);
		allViews = allViews.concat(additionalViewItems);

		return allViews;
	},

	/**
	 * Initializes the {@link Zarafa.core.ui.PreviewPanel PreviewPanel}
	 *
	 * @param {Zarafa.mail.FilesContext} context The Files Context
	 * @return {Zarafa.core.ui.PreviewPanel}
	 * @private
	 */
	initPreviewPanel : function(context) {
		return {
			xtype: 'zarafa.filespreviewpanel',
			ref: 'filesPreview',
			region : 'south',
			split : true,
			context: context
		};
	},

	/**
	 * Function called by Extjs when the panel has been {@link #render rendered}.
	 * At this time all events can be registered.
	 * @private
	 */
	initEvents : function() {
		if (Ext.isDefined(this.context)) {
			this.mon(this.context, 'viewchange', this.onViewChange, this);
			this.mon(this.context, 'viewmodechange', this.onViewModeChange, this);

			this.onViewChange(this.context, this.context.getCurrentView());
			this.onViewModeChange(this.context, this.context.getCurrentViewMode());
		}
	},

	/**
	 * Event handler which is fired when the currently active view inside the {@link #context}
	 * has been updated. This will update the call
	 * {@link #viewPanel}#{@link Zarafa.core.ui.SwitchViewContentContainer#switchView}
	 * to make the requested view active.
	 *
	 * @param {Zarafa.core.Context} context The context which fired the event.
	 * @param {Zarafa.plugins.files.data.Views} newView The ID of the selected view.
	 * @param {Zarafa.plugins.files.data.Views} oldView The ID of the previously selected view.
	 */
	onViewChange : function(context, newView, oldView) {
		switch (newView) {
			case Zarafa.plugins.files.data.Views.LIST:
				this.viewPanel.switchView('files-gridview');
				break;
			case Zarafa.plugins.files.data.Views.ICON:
				this.viewPanel.switchView('files-iconview');
				break;
		}
	},

	/**
	 * Event handler which is fired when the {@link Zarafa.core.Context} fires the
	 * {@link Zarafa.core.Context#viewmodechange viewmodechange} event. This will
	 * convert the configured {@link Zarafa.plugins.files.data.ViewModes mode} to a
	 * {@link Zarafa.common.ui.layout.SwitchBorderLayout.Orientation orientation}
	 * to be {@link Zarafa.common.ui.layout.SwitchBorderLayout.setOrientation applied}
	 * to the {@link #layout}.
	 * @param {Zarafa.core.Context} context The context which fired the event
	 * @param {Zarafa.plugins.files.data.ViewModes} newViewMode The new active mode
	 * @param {Zarafa.plugins.files.data.ViewModes} oldViewMode The previous mode
	 * @private
	 */
	onViewModeChange : function(context, newViewMode, oldViewMode) {
		var orientation;

		switch (newViewMode) {
			case Zarafa.plugins.files.data.ViewModes.NO_PREVIEW:
				orientation = Zarafa.common.ui.layout.SwitchBorderLayout.Orientation.OFF;
				break;
			case Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW:
				orientation = Zarafa.common.ui.layout.SwitchBorderLayout.Orientation.HORIZONTAL;
				break;
			case Zarafa.plugins.files.data.ViewModes.BOTTOM_PREVIEW:
				orientation = Zarafa.common.ui.layout.SwitchBorderLayout.Orientation.VERTICAL;
				break;
			case Zarafa.plugins.files.data.ViewModes.SEARCH:
				return;
		}

		// This function could be called when the layout has not yet
		// been instantiated. In that case we update the layoutConfig
		// so it will be automatically picked up by the layout when
		// it needs it.
		var layout = this.getLayout();
		if (!Ext.isFunction(layout.setOrientation)) {
			if (Ext.isString(layout))
				this.layoutConfig = Ext.apply(this.layoutConfig || {}, { orientation : orientation });
			else
				this.layout.orientation = orientation;
		} else
			layout.setOrientation(orientation);
	}
});
//register xtype of files main panel
Ext.reg('zarafa.filesmainpanel',Zarafa.plugins.files.ui.FilesMainPanel);
