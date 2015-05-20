Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesPreviewPanel
 * @extends Zarafa.core.ui.PreviewPanel
 * @xtype zarafa.filespreviewpanel
 */
Zarafa.plugins.files.ui.FilesPreviewPanel = Ext.extend(Ext.Panel, {
	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};

		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context))
			config.model = config.context.getModel();
		
		var toolbarButtons = new Zarafa.plugins.files.ui.FilesPreviewPanelToolbarButtons({model: config.model});
		var tbarItems = [
			container.populateInsertionPoint('filespreviewpanel.toolbar.left', this, config.model),
			{xtype: 'tbfill'},
			toolbarButtons.getToolbarButtons(), // Default items in toolbar should be right aligned.
			container.populateInsertionPoint('filespreviewpanel.toolbar.right', this, config.model)
		]
		
		var toolbar = Ext.applyIf(config.tbar || {}, {
			cls: 'zarafa-previewpanel-toolbar',
			xtype : 'zarafa.toolbar',
			height : 33,
			hidden : false,
			items : Ext.flatten(tbarItems)
		});
		
		Ext.applyIf(config, {
			xtype : 'zarafa.filespreviewpanel',
			layout : 'fit',
			stateful : true,
			cls : 'zarafa-previewpanel zarafa-context-mainpanel',
			width : 300, // default values
			height : 300, // default values
			tbar : toolbar			
		});

		Zarafa.plugins.files.ui.FilesPreviewPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('zarafa.filespreviewpanel', Zarafa.plugins.files.ui.FilesPreviewPanel);

