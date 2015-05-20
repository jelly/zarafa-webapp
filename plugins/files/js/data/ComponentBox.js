Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.ComponentBox
 * The global component box which holds all aliases to important components
 * @singleton
 */
Zarafa.plugins.files.data.ComponentBox = Ext.extend(Object, {
	/**
	 * Get the files context
	 * @return {Zarafa.plugins.files.context.FilesContext}
	 */
	getContext : function() {
		// should we return container.getContextByName("filescontext")? performance will be lower...
		return container.getCurrentContext();
	},
	
	/**
	 * Get the files context model
	 * @return {Zarafa.plugins.files.context.FilesContextModel}
	 */
	getContextModel : function() {
		return this.getContext().getModel();
	},
	
	/**
	 * Get the files gridstore
	 * @return {Zarafa.plugins.files.data.FilesStore}
	 */
	getStore : function() {
		return this.getContextModel().getStore();
	},
	
	/**
	 * Get the navigatorpanel
	 * @return {Zarafa.core.ui.NavigationPanel}
	 */
	getNavigatorPanel : function() {
		return container.getNavigationBar();
	},
	
	/**
	 * Get the navigator treepanel
	 * @return {Zarafa.plugins.files.ui.NavigatorTreePanel}
	 */
	getNavigatorTreePanel : function() {
		return this.getNavigatorPanel().filesTreepanel;
	},
	
	/**
	 * Get the main panel
	 * @return {Zarafa.core.ui.MainViewport}
	 */
	getMainPanel : function() {
		try {
			return container.getContentPanel();
		} catch (e) {
			// this is a workaround for webapps < 1.3
			return container.getTabPanel().getItem(0).getActiveItem();
		}
	},
	
	/**
	 * Get the preview panel
	 * @return {Zarafa.plugins.files.ui.FilesPreviewPanel}
	 */
	getPreviewPanel : function() {
		return this.getMainPanel().filesPreview;
	},
	
	/**
	 * Get the tabpanel
	 * @return {Zarafa.core.ui.ContextContainer}
	 */
	getTabPanel : function() {
		return container.getTabPanel();
	},
	
	/**
	 * Get the tabpanel items
	 * @return {Array}
	 */
	getTabPanelItems : function() {
		return this.getTabPanel().items.items;
	},
	
	/**
	 * Get the files gridpanel
	 * @return {Zarafa.plugins.files.ui.FilesFileGrid}
	 */
	getViewPanel : function() {
		return this.getMainPanel().filesViewPanel;
	},
	
	/**
	 * Get the files grid toolbar
	 * @return {Zarafa.plugins.files.ui.FilesToolbar}
	 */
	getViewPanelToolbar : function() {
		var viewPanel = this.getViewPanel();
		if(viewPanel)
			return viewPanel.topToolbar;
		else
			return undefined;
	}
});

// make it a singleton
Zarafa.plugins.files.data.ComponentBox = new Zarafa.plugins.files.data.ComponentBox();
