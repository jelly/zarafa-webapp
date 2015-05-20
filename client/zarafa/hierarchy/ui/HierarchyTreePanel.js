Ext.namespace('Zarafa.hierarchy.ui');

/**
 * @class Zarafa.hierarchy.ui.HierarchyTreePanel
 * @extends Zarafa.hierarchy.ui.Tree
 * @xtype zarafa.hierarchytreepanel
 *
 * HierarchyTreePanel for hierachy list in the main window.
 */
Zarafa.hierarchy.ui.HierarchyTreePanel = Ext.extend(Zarafa.hierarchy.ui.Tree, {
	/**
	 * @cfg {Boolean} enableItemDrop true to enable just drag for {@link Zarafa.core.data.MAPIRecord items}
	 * from a {@Link Ext.grid.GridPanel grid}.
	 */
	enableItemDrop : false,

	/**
	 * The dropZone used by this tree if drop is enabled (see {@link #enableItemDrop})
	 * @property
	 * @type Ext.tree.TreeDropZone
	 */
	itemDropZone : undefined,

	/**
	 * @cfg {Object} itemDropConfig Custom config to pass to the {@link Ext.tree.TreeDropZone} instance
	 */
	itemDropConfig : undefined,

	/**
	 * @cfg {Object} bbarConfig Custom config to pass to the {@link Zarafa.hierarchy.ui.HierarchyTreeBottomBar}.
	 * By default the xtype in this object is set to zarafa.hierarchytreebottombar.
	 */
	bbarConfig: undefined,

	/**
	 * Reference to the {@link Ext.form.Checkbox Checkbox} in the top toolbar.
	 * @property
	 * @type Ext.form.Checkbox
	 */
	showAllFoldersCheckbox: undefined,

	/**
	 * @cfg {Boolean} showAllFoldersDefaultValue True to render the 'Show all folders'
	 * {@link #showAllFoldersCheckbox checkbox} as {@link Ext.form.Checkbox#checked checked}.
	 */
	showAllFoldersDefaultValue : false,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		var checked = Ext.isDefined(config.showAllFoldersDefaultValue) ?
				config.showAllFoldersDefaultValue : this.showAllFoldersDefaultValue;

		Ext.applyIf(config, {
			xtype : 'zarafa.hierarchytreepanel',
			baseCls: 'zarafa-hierarchy-treepanel',
			flex : 1,
			minHeight : 100,
			stateful : true,
			tbar: {
				items: [
				// Start aligning right
				'->',
				{
					xtype : 'displayfield',
					value : _('Show all folders')
				},{
					xtype : 'spacer',
					width: 5,
					height: 5
				},{
					xtype: 'checkbox',
					cls: 'zarafa-hierarchy-treepanel-showallfolders',
					ref: '../showAllFoldersCheckbox',
					checked : checked,
					listeners : {
						check: this.onCheckShowAllFoldersCheckbox,
						scope: this
					}
				}]
			},
			loadMask : true,
			treeSorter : true,
			trackMouseOver : true,
			// Default values for the Drag&Drop objects.
			// By default is Drag&Drop disabled...
			dragConfig : {
				ddGroup: 'dd.mapifolder'
			},
			dropConfig : {
				ddGroup: 'dd.mapifolder',
				expandDelay : 250,
				allowParentInsert : true
			},
			enableItemDrop : true,
			itemDropConfig : {
				ddGroup: 'dd.mapiitem'
			},
			ddAutoScrollContainer : true
		});

		if(!Ext.isDefined(config.bbar)){
			config.bbarConfig = config.bbarConfig || {};
			config.bbar = Ext.applyIf(config.bbarConfig, {
				xtype : 'zarafa.hierarchytreebottombar'
			});
		}

		this.addEvents(
			/**
			 * @event beforeitemdrop
			 * Fires when a DD object is dropped on a node in this tree for preprocessing. Return false to cancel the drop. The dropEvent
			 * passed to handlers has the following properties:<br />
			 * <ul style="padding:5px;padding-left:16px;">
			 * <li>tree - The TreePanel</li>
			 * <li>target - The node being targeted for the drop</li>
			 * <li>data - The drag data from the drag source</li>
			 * <li>point - The point of the drop - append, above or below</li>
			 * <li>source - The drag source</li>
			 * <li>rawEvent - Raw mouse event</li>
			 * <li>dropNode - Drop node(s) provided by the source <b>OR</b> you can supply node(s)
			 * to be inserted by setting them on this object.</li>
			 * <li>cancel - Set this to true to cancel the drop.</li>
			 * <li>dropStatus - If the default drop action is cancelled but the drop is valid, setting this to true
			 * will prevent the animated 'repair' from appearing.</li>
			 * </ul>
			 * @param {Object} dropEvent
			 */
			'beforeitemdrop',
			/**
			 * @event itemdrop
			 * Fires after a DD object is dropped on a node in this tree. The dropEvent
			 * passed to handlers has the following properties:<br />
			 * <ul style="padding:5px;padding-left:16px;">
			 * <li>tree - The TreePanel</li>
			 * <li>target - The node being targeted for the drop</li>
			 * <li>data - The drag data from the drag source</li>
			 * <li>point - The point of the drop - append, above or below</li>
			 * <li>source - The drag source</li>
			 * <li>rawEvent - Raw mouse event</li>
			 * <li>dropNode - Dropped node(s).</li>
			 * </ul>
			 * @param {Object} dropEvent
			 */
			'itemdrop'
		);

		Zarafa.hierarchy.ui.HierarchyTreePanel.superclass.constructor.call(this, config);
	},


	/**
	 * Called after the tree has been {@link #render rendered} This will initialize
	 * all event handlers and when {@link #enableDD Drag & Drop} has been enabled,
	 * it will initialize the {@link #dropZone} with a special
	 * {@link Zarafa.hierarchy.ui.HierarchyFolderDropZone Folder DropZone} object.
	 * When {@link #enableItemDrop} has been enabled, it will also initialize the
	 * {@link #itemDropZone} using the {@link Zarafa.hierarchy.ui.HierarchyItemDropZone Item DropZone}.
	 * @private
	 */
	initEvents : function()
	{
		// Add listeners to Zarafa.hierarchy.ui.Tree events
		this.on('contextmenu', this.onTreeNodeContextMenu, this);
		this.on('click', this.onFolderClicked, this);
		this.mon(this.store, 'remove', this.onStoreRemove, this);
		this.mon(this.store, 'removeFolder', this.onFolderRemove, this);
		this.mon(container, 'folderselect', this.onFolderSelect, this);

		// TODO This needs to be fixed by lazy loading the stuff in the mainPanel, then we can do container.getNavigationBar()
		// But at the moment it is instantiated as getMainPanel is run and so we cannot yet get the navigationBar that way
		var navigationPanel = this.findParentByType('zarafa.navigationpanel');
		if(navigationPanel){
			this.mon(navigationPanel, 'toggleshowallfolders', this.onToggleShowAllFolders, this);
		}

		// Add listener for the 'load' event so we can select
		// the currently active folder (when a folder was activated
		// before the hierarchy is shown).
		this.mon(this.loader, 'load', this.onHierarchyLoaderLoad, this);

		if (this.stateful === true) {
			this.on('expandnode', this.saveFolderState, this, { buffer : 5 });
			this.on('collapsenode', this.saveFolderState, this, { buffer : 5 });
		}

		if (this.enableDD || this.enableDrop) {
			// Initialize a special DropZone which has better support for detecting where
			// mapifolders can be dropped inside the hierarchy.
			if (!this.dropZone) {
				this.dropZone = new Zarafa.hierarchy.ui.HierarchyFolderDropZone(this, this.dropConfig || {
					ddGroup: this.ddGroup || 'TreeDD', appendOnly: this.ddAppendOnly === true
				});
			}

			this.on('nodedrop', this.onNodeDrop, this);
		}

		if (this.enableItemDrop) {
			// Initialize a special DropZone which has support for dragging MAPIRecord objects
			// from a grid into the hierarchy.
			if (!this.itemDropZone) {
				this.itemDropZone = new Zarafa.hierarchy.ui.HierarchyItemDropZone(this, this.itemDropConfig || {
					ddGroup: this.ddGroup || 'TreeDD'
				});
			}

			this.on('itemdrop', this.onItemDrop, this);
		}

		Zarafa.hierarchy.ui.HierarchyTreePanel.superclass.initEvents.call(this);
	},

	/**
	 * Event handler which is trigggered after drop is completed on {@link Zarafa.hierarchy.ui.Tree Tree}.
	 * @param {Object} dropEvent The object describing the drop information
	 * @private
	 */
	onNodeDrop : function(dropEvent)
	{
		if (Ext.isDefined(dropEvent.dropNode)) {
			var targetNode = dropEvent.target;

			switch (dropEvent.point) {
				case 'above':
				case 'below':
					targetNode = dropEvent.target.parentNode;
					break;
				case 'append':
				default:
					break;
			}

			var sourceFolder = dropEvent.dropNode.getFolder();
			var targetFolder = targetNode.getFolder();

			if (dropEvent.rawEvent.ctrlKey) {
				sourceFolder.copyTo(targetFolder);
			} else {
				sourceFolder.moveTo(targetFolder);
			}

			sourceFolder.save();
		}
	},

	/**
	 * Event handler which is trigggered after drop of item is completed on {@link Zarafa.hierarchy.ui.Tree Tree}.
	 * @param {Object} dropEvent The object describing the drop information
	 * @private
	 */
	onItemDrop : function(dropEvent)
	{
		if (!Ext.isEmpty(dropEvent.dropItem)) {
			var targetNode = dropEvent.target;

			var sourceNodes = Ext.isArray(dropEvent.dropItem) ? dropEvent.dropItem : [ dropEvent.dropItem ];
			var targetFolder = targetNode.getFolder();
			var store = sourceNodes[0].getStore();

			if (dropEvent.rawEvent.ctrlKey) {
				for (var i = 0, len = sourceNodes.length; i < len; i++) {
					sourceNodes[i].copyTo(targetFolder);
				}
			} else {
				for (var i = 0, len = sourceNodes.length; i < len; i++) {
					sourceNodes[i].moveTo(targetFolder);
				}
			}

			store.save(sourceNodes);
		}
	},

	/**
	 * Event handler which is fired when the {@link #store} fires the
	 * {@link Zarafa.hierarchy.data.HierarchyStore#remove} event handler. This will check
	 * if any of the folders inside the store is currently opened, and
	 * will deselect those folders.
	 *
	 * @param {Zarafa.hierarchy.data.HierarchyStore} store The store which fired the event
	 * @param {Zarafa.hierarchy.data.MAPIStoreRecord} storeRecord The store which was deleted
	 * @private
	 */
	onStoreRemove : function(store, storeRecord)
	{
		var subFolders = storeRecord.getSubStore('folders');

		if (this.model) {
			subFolders.each(function(folder) {
				this.model.removeFolder(folder);
			}, this);
		}
	},

	/**
	 * Event handler which is fired when the {@link #store} fires the
	 * {@link Zarafa.hierarchy.data.HierarchyStore#removeFolder} event handlerr. This will check
	 * if the folder is currently opened, and will deselect that folder.
	 *
	 * @param {Zarafa.hierarchy.data.HierarchyStore} store The store which fired the event
	 * @param {Zarafa.hierarchy.data.MAPIStoreRecord} storeRecord The store from where the folder is
	 * removed
	 * @param {Zarafa.hierarchy.data.MAPIFolderRecord} folder The folder which was removed from the store
	 * @private
	 */
	onFolderRemove : function(store, storeRecord, folder)
	{
		if (this.model) {
			this.model.removeFolder(folder);
		}
	},

	/**
	 * Fires when the {@link Zarafa.core.Container} fires the
	 * {@link Zarafa.core.Container#folderselect} event. This
	 * will search for the corresponding node in the tree,
	 * and will mark the given folder as {@link #selectFolderInTree selected}.
	 *
	 * @param {Zarafa.hierarchy.data.MAPIFolderRecord|Array} folder The folder which
	 * is currently selected.
	 * @private
	 */
	onFolderSelect : function(folder)
	{
		if (Ext.isArray(folder)) {
			folder = folder[0];
		}

		// Select the node of selected folder.
		if (folder) {
			this.selectFolderInTree(folder);
		}
	},

	/**
	 * Fires when the {@link #loader} fires the {@link Zarafa.hierarchy.data.HierarchyTreeLoader#load}
	 * event to indicate that all nodes have been rendered into the tree.
	 * This will {@link #selectFolderInTree select} {@link Zarafa.core.ContextModel#getFolders all folders}
	 * @private
	 */
	onHierarchyLoaderLoad : function()
	{
		if (this.model) {
			var folders = this.model.getFolders();
			for (var i = 0, len = folders.length; i < len; i++) {
				this.selectFolderInTree(folders[i]);
			}
		}
	},

	/**
	 * Fired on contextmenu event on {@link Zarafa.hierarchy.ui.FolderNode}
	 * @param {Zarafa.hierarchy.ui.FolderNode} treeNode The node on which the contextmenu
	 * was requested.
	 * @param {Ext.EventObject} eventObj The event object with event information
	 * @private
	 */
	onTreeNodeContextMenu : function(treeNode, eventObj)
	{
		Zarafa.core.data.UIFactory.openDefaultContextMenu(treeNode.getFolder(), { position : eventObj.getXY(), contextNode : treeNode });
	},

	/**
	 * Fired when a node is clicked in {@link Zarafa.hierarchy.ui.Tree}.
	 * It calls container to change folder.
	 * @param {Ext.tree.TreeNode} node which is clicked
	 */
	onFolderClicked : function(treeNode)
	{
		var folder = treeNode.getFolder();
		Zarafa.hierarchy.Actions.openFolder(folder);
	},

	/**
	 * @return {Zarafa.hierarchy.ui.TreeEditor} The tree editor which can be used
	 * @private
	 */
	getTreeEditor : function()
	{
		if (!this.treeEditor) {
			this.treeEditor = new Zarafa.hierarchy.ui.TreeEditor(this);
		}
		return this.treeEditor;
	},

	/**
	 * Triggers node editing
	 * @param {Zarafa.hierarchy.ui.FolderNode} treeNode node to be edited
	 */
	startEditingNode : function(treeNode)
	{
		this.getTreeEditor().startEditingNode(treeNode);
	},

	/**
	 * When {@link #stateful} is enabled, this will test if the given
	 * folder has the 'is_open' state enabled.
	 * If the folder is not found in the settings, the rule is that
	 * {@link Zarafa.hierarchy.data.MAPIFolderRecord#isIPMSubTree subtrees}
	 * will be expaned by default, all other folders are collapsed.
	 * @param {Zarafa.hierarchy.data.MAPIFolderRecord} folder The folder to check
	 * @return {Boolean} True if the folder should be expanded by default
	 * @private
	 */
	isFolderOpened : function(folder)
	{
		var opened;
		if (this.stateful === true) {
			var state = container.getHierarchyStore().getState(folder, 'tree');
			if (state) {
				opened = state.is_open;
			}
		}
		if (!Ext.isDefined(opened)) {
			opened = Zarafa.hierarchy.ui.HierarchyTreePanel.superclass.isFolderOpened.call(this, folder);
		}
		return opened;
	},

	/**
	 * Event handler for the {@link #expandnode} and {@link #collapsenode} events. When
	 * {@link #stateful} is enabled, then this function will save the current
	 * state of the given node.
	 *
	 * @param {Zarafa.hierarchy.ui.FolderNode} node The node which will be saved into the settings
	 * @private
	 */
	saveFolderState : function(node)
	{
		if (this.stateful === true && !node.isRoot) {
			var folder = node.getFolder();

			container.getHierarchyStore().applyState(folder, 'tree', { is_open : node.expanded });
		}
	},

	/**
	 * Called when the {@link #showAllFoldersCheckbox} checkbox in the top toolbar is checked or
	 * unchecked. It will set the toggle showAllFolders option in the
	 * {@link Zarafa.core.ui.NavigationPanel}.
	 * @param {Ext.Form.Checkbox} button The pressed button
	 * @param {Boolean} checkState True when checkbox is checked, false when not
	 */
	onCheckShowAllFoldersCheckbox: function(checkbox, checkState)
	{
		container.getNavigationBar().setShowFolderList(checkState);
	},

	/**
	 * Called when the {@link Zarafa.core.ui.NavigationPanel} fires the
	 * {@link Zarafa.core.ui.NavigationPanel#toggleshowallfolders toggleshowallfolders} event. Then
	 * we change the {@link #showAllFoldersCheckbox} button in the top toolbar accordingly.
	 * @param {Boolean} show Value of the showAllFolders state
	 */
	onToggleShowAllFolders: function(show)
	{
		// Suspend events to stop the check-event that will fire from triggering all kinds of
		// other updates externally.
		this.suspendEvents(false);

		this.showAllFoldersCheckbox.setValue(show);

		this.resumeEvents();
	},

	/**
	 * Called before the panel is being destroyed.
	 */
	beforeDestroy : function()
	{
		if (this.rendered) {
			Ext.destroy(this.itemDropZone);
		}

		Zarafa.hierarchy.ui.HierarchyTreePanel.superclass.beforeDestroy.apply(this, arguments);
	}
});
Ext.reg('zarafa.hierarchytreepanel', Zarafa.hierarchy.ui.HierarchyTreePanel);
