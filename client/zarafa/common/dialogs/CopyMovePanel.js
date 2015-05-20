Ext.namespace('Zarafa.common.dialogs');

/**
 * @class Zarafa.common.dialogs.CopyMovePanel
 * @extends Ext.Panel
 * @xtype zarafa.copymovepanel
 *
 * Panel for users to copy or move the given {@link Zarafa.core.data.IPMRecord[] records}
 * to a differnt {@link Zarafa.hierarchy.data.MAPIFolderRecord folder}.
 */
Zarafa.common.dialogs.CopyMovePanel = Ext.extend(Ext.Panel, {
	/**
	 * @cfg {Zarafa.core.data.IPMRecord} record The record(s) which are being
	 * copied or moved through this panel
	 */
	record : undefined,
	/**
	 * @cfg {Zarafa.core.mapi.ObjectType} objectType The Objecttype of the
	 * {@link #record} which have been set on this panel. This is needed
	 * to determine if we are copy/moving folders or messages.
	 */
	objectType : undefined,
	/**
	 * @constructor
	 * @param {Object} config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		if (config.record) {
			if (!Ext.isArray(config.record)) {
				config.record = [ config.record ];
			}

			if (!config.objectType) {
				config.objectType = config.record[0].get('object_type')
			}
		}

		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'zarafa.copymovepanel',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			border: false,
			bodyStyle: 'padding: 5px; background-color: inherit;',
			header: true,
			items: [
				this.createTreePanel()
			],
			buttons: [{
				text: _('Copy'),
				handler: this.onCopy,
				scope: this,
				ref: '../copyButton',
				disabled: true
			},{
				text: _('Move'),
				handler: this.onMove,
				scope: this,
				ref: '../moveButton',
				disabled: true
			},{
				text: _('Cancel'),
				handler: this.onCancel,
				scope: this
			}]
		});

		Zarafa.common.dialogs.CopyMovePanel.superclass.constructor.call(this, config);
	},

	/**
	 * Creates a {@link Zarafa.hierarchy.ui.Tree treepanel}
	 * which contains all the {@link Zarafa.hierarchy.data.MAPIFolderRecord folders}
	 * to which the {@link Zarafa.core.data.IPMRecord records} can be
	 * copied or moved to.
	 * @return {Object} Configuration object for the tree panel.
	 * @private
	 */
	createTreePanel : function()
	{
		return {
			xtype: 'panel',
			layout: 'form',
			border: false,
			flex: 1,
			bodyStyle: 'background-color: inherit;',
			items: [{
				xtype: 'displayfield',
				value: _('Destination folder') + ':',
				hideLabel : true
			},{
				xtype: 'zarafa.hierarchytree',
				border: true,
				enableDD : false,
				treeSorter : true,
				anchor: '100% 90%',
				ref: '../hierarchyTree',
				treeSorter : true
			}]
		};
	},

	/**
	 * Function which is called automatically by ExtJs when the {@link Ext.Panel panel}
	 * is being rendered. This will add the event handler for selection changes, and
	 * will load the hierarchy model.
	 * @param {Ext.Container} ct The parent container for this panel
	 * @param {Number} position The position of this panel inside its parent
	 * @private
	 */
	onRender : function(ct, position)
	{
		Zarafa.common.dialogs.CopyMovePanel.superclass.onRender.call(this, ct, position);

		if (this.objectType == Zarafa.core.mapi.ObjectType.MAPI_MESSAGE) {
			this.setTitle(String.format(ngettext('There is {0} message selected.', 'There are {0} messages selected.', this.record.length), this.record.length));
		} else if (this.objectType == Zarafa.core.mapi.ObjectType.MAPI_FOLDER) {
			this.setTitle(String.format(_('Folder \'{0}\' selected.'), Ext.util.Format.htmlEncode(this.record[0].getDisplayName())));
		}
	},

	/**
	 * Initialize the event handlers
	 * @protected
	 */
	initEvents : function()
	{
		Zarafa.common.dialogs.CopyMovePanel.superclass.initEvents.apply(this, arguments);

		// If there is a folder we should select, the enable the 'load' event handler
		// as we will have to wait until the correct node has been loaded.
		var folder = this.dialog.getSelectedFolder();
		if (folder) {
			this.mon(this.hierarchyTree, 'load', this.onTreeNodeLoad, this);
		}
		this.mon(this.hierarchyTree.getSelectionModel(), 'selectionchange', this.onSelectionChange, this);
	},

	/**
	 * Fired when the {@link Zarafa.hierarchy.ui.Tree Tree} fires the {@link Zarafa.hierarchy.ui.Tree#load load}
	 * event. This function will try to select the {@link Ext.tree.TreeNode TreeNode} in
	 * {@link Zarafa.hierarchy.ui.Tree Tree} intially. When the given node is not loaded yet, it will try again
	 * later when the event is fired again.
	 *
	 * @private
	 */
	onTreeNodeLoad : function() {
		// Select folder in hierarchy tree.
		var folder = this.dialog.getSelectedFolder();

		// If the folder could be selected, then unregister the event handler.
		if (this.hierarchyTree.selectFolderInTree(folder)) {
			this.mun(this.hierarchyTree, 'load', this.onTreeNodeLoad, this);
		}
	},

	/**
	 * Event handler which is trigggered when the user select a {@link Zarafa.hierarchy.data.MAPIFolderRecord folder}
	 * from the {@link Zarafa.hierarchy.ui.Tree tree}. This will determine if a valid
	 * {@link Zarafa.hierarchy.data.MAPIFolderRecord folder} is selected to which the {@link Zarafa.core.data.IPMRecord records}
	 * can indeed be copied or moved to.
	 * @param {DefaultSelectionModel} selectionModel The selectionModel for the treepanel
	 * @param {TreeNode} node The selected tree node
	 * @private
	 */
	onSelectionChange : function(selectionModel, node)
	{
		if (!Ext.isDefined(node) || (node.getFolder().isIPMSubTree() && this.objectType == Zarafa.core.mapi.ObjectType.MAPI_MESSAGE)) {
			this.copyButton.disable();
			this.moveButton.disable();
		} else {
			this.copyButton.enable();
			this.moveButton.enable();
		}
	},

	/**
	 * Event handler which is triggered when the user presses the Copy
	 * {@link Ext.Button button}. This will copy all {@link Zarafa.core.data.IPMRecord records}
	 * and will close the {@link Zarafa.common.dialogs.CopyMovePanel dialog} when it is done.
	 * @private
	 */
	onCopy : function()
	{
		var folder = this.hierarchyTree.getSelectionModel().getSelectedNode().getFolder();
		var store = this.record[0].getStore();

		if (!Ext.isDefined(folder)) {
			return;
		}

		if (Ext.isEmpty(this.record)) {
			return;
		}

		Ext.each(this.record, function(record) {
			record.copyTo(folder);
		}, this);

		this.dialog.selectFolder(folder);

		store.save(this.record);

		this.dialog.close();
	},

	/**
	 * Event handler which is triggered when the user presses the Move
	 * {@link Ext.Button button}. This will move all {@link Zarafa.core.data.IPMRecord records}
	 * and will close the {@link Zarafa.common.dialogs.CopyMovePanel dialog} when it is done.
	 * @private
	 */
	onMove : function()
	{
		var folder = this.hierarchyTree.getSelectionModel().getSelectedNode().getFolder();
		var store = this.record[0].getStore();

		if (!Ext.isDefined(folder)) {
			return;
		}

		if (Ext.isEmpty(this.record)) {
			return;
		}

		Ext.each(this.record, function(record) {
			record.moveTo(folder);
		}, this);

		this.dialog.selectFolder(folder);

		store.save(this.record);

		this.dialog.close();
	},

	/**
	 * Event handler which is triggered when the user presses the cancel
	 * {@link Ext.Button button}. This will close the {@link Zarafa.common.dialogs.CopyMovePanel dialog}
	 * without copying or moving any {@link Zarafa.core.data.IPMRecord records}.
	 * @private
	 */
	onCancel : function()
	{
		this.dialog.close();
	}
});

Ext.reg('zarafa.copymovepanel', Zarafa.common.dialogs.CopyMovePanel);
