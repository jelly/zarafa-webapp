Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.NavigatorTreePanel
 * @extends Ext.tree.TreePanel
 * @xtype zarafa.filestreepanel
 * Shows tree of all user files from Files
 */
Zarafa.plugins.files.ui.NavigatorTreePanel = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		Ext.applyIf(config, {
			xtype : 'zarafa.filestreepanel',
			enableDD : true,
			ddGroup : 'dd.filesrecord',
			root: {
				nodeType: 'async',
				text: '/',
				id: '/',
				expanded : true
			},
			autoScroll: true,
			listeners: {
				click: this.onNodeClick,
				beforenodedrop: {fn: function(e) {
				
					// e.data.selections is the array of selected records
					if(Ext.isArray(e.data.selections)) {
						// reset cancel flag
						e.cancel = false;
						
						Ext.each(e.data.selections, function(record) {
							record.setDisabled(true);
						});
						
						// we want Ext to complete the drop, thus return true
						return Zarafa.plugins.files.data.Actions.moveRecords(e.data.selections,e.target.id);
					}
					// if we get here the drop is automatically cancelled by Ext
				}},
				afterrender : function() {
					this.dragZone.lock(); // disable dragging from treepanel
				},
				scope: this
			},
			viewConfig: {
				style : { overflow: 'auto', overflowX: 'hidden' }
			},
			maskDisabled: true,
			loader : new Zarafa.plugins.files.data.DirectoryLoader({loadfiles: false})
		});
		Zarafa.plugins.files.ui.NavigatorTreePanel.superclass.constructor.call(this, config);
	},
	
	/**
	 * eventhandler that handles the click on a node
	 * @param {Object} node
	 */
	onNodeClick : function(node) {
		Zarafa.plugins.files.data.ComponentBox.getStore().loadPath(node.attributes.id);
		var n = this.getNodeById(node.attributes.id);
		
		if(Ext.isDefined(n) && !n.isLeaf()) {
			n.reload();
		}
	}
});

Ext.reg('zarafa.filestreepanel',Zarafa.plugins.files.ui.NavigatorTreePanel); 
