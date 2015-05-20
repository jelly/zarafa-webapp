Ext.namespace('Zarafa.hierarchy.ui');

/**
 * @class Zarafa.hierarchy.ui.MultiSelectHierarchyTree
 * @extends Zarafa.hierarchy.ui.HierarchyTreePanel
 * @xtype zarafa.multiselecthierarchytree
 *
 * Subclass of {@link Zarafa.hierarchy.ui.HierarchyTreePanel HierarchyTree} which will
 * allow multiple selection of folders. This requires the {@link Zarafa.core.Context Context} to fully
 * support showing data from multiple folders at the same time.
 */
Zarafa.hierarchy.ui.MultiSelectHierarchyTree = Ext.extend(Zarafa.hierarchy.ui.HierarchyTreePanel, {
	/**
	 * @cfg {Boolean} Whether to apply colors to this tree's nodes
	 * This is useful when multiple {@link Zarafa.hierarchy.data.MAPIFolderRecord} folders are allowed to be selected
	 */
	colored : false,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		// Default Node Config
		config.nodeConfig = Ext.applyIf(config.nodeConfig || {}, {
			checked : false
		});

		Zarafa.hierarchy.ui.MultiSelectHierarchyTree.superclass.constructor.call(this, config);

		if (Ext.isDefined(this.model)) {
			this.on('checkchange', this.onTreeNodeCheckChange, this);
			this.on('click', this.onTreeNodeClick, this);
			this.mon(this.model, 'folderchange', this.onFolderChange, this);
		}
	},

	/**
	 * Called when a treeNode is click in tree. The corresponding folder is added to,
	 * or removed from the active folder list depending on the state of the check box.
	 * @param {Ext.tree.TreeNode} node tree node.
	 * @private
	 */
	onTreeNodeClick : function(treeNode)
	{
		this.onTreeNodeCheckChange(treeNode, !treeNode.getUI().isChecked());
	},

	/**
	 * Called when a check box in the calendar tree is toggled. The corresponding folder is added to,
	 * or removed from the active folder list depending on the state of the check box.
	 * @param {Ext.tree.TreeNode} node tree node.
	 * @param {Boolean} checked indicates whether the box is checked.
	 * @private
	 */
	onTreeNodeCheckChange : function(node, checked)
	{
		var folder = node.getFolder();

		if (checked) {
			this.model.addFolder(folder);
		} else {
			this.model.removeFolder(folder);
		}
	},

	/**
	 * Handles a folderchange event from the model. This occurs when the user selects or deselects a folder from the folder hierarchy.
	 * @param {Zarafa.core.ContextModel} model Context model that fired the event.
	 * @param {Zarafa.hierarchy.data.MAPIFolderRecord[]} folders list of currently selected folders.
	 * @private
	 */
	onFolderChange : function(model, folders)
	{
		this.updateAll();
	}
});

Ext.reg('zarafa.multiselecthierarchytree', Zarafa.hierarchy.ui.MultiSelectHierarchyTree);
