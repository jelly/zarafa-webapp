Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesPreviewPanelToolbarButtons
 * @extends Object
 *
 * Contains special toolbar buttons for the previewpanel of the files context.
 */
Zarafa.plugins.files.ui.FilesPreviewPanelToolbarButtons = Ext.extend(Object, {
	/**
	 * @cfg {@link Zarafa.plugins.files.context.FilesContextModel}
	 */
	model : undefined,

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		Ext.apply(this, config);
	},

	/**
	 * Function called when insertion point previewpanel.toolbar.right is called,
	 * Function returns configuration object for Copy/Move, Delete and Print buttons
	 * which are added on the right side of previewpanels toolbar.
	 * 
	 * @return {Object} Configuration object containing buttons
	 * which are added in the {@link Ext.Toolbar Toolbar}.
	 */
	getToolbarButtons : function() {
		return [{
			xtype: 'tbfill'
		},
		{
			xtype: 'zarafa.toolbarbutton',
			tooltip: dgettext('plugin_files', 'Delete'),
			overflowText: dgettext('plugin_files', 'Delete'),
			iconCls : 'icon_delete',
			nonEmptySelectOnly: true,
			handler: this.onDelete,
			model: this.model
		},
		{
			xtype: 'zarafa.toolbarbutton',
			tooltip: dgettext('plugin_files', 'Rename'),
			overflowText: dgettext('plugin_files', 'Rename'),
			iconCls : 'icon_rename',
			nonEmptySelectOnly: true,
			handler: this.onRename,
			model: this.model
		}];
	},
	
	/**
	 * Rename the item
	 * @private
	 */
	onRename : function() {
		var records = this.model.getSelectedRecords();
		
		if(records.length != 1) {
			Zarafa.common.dialogs.MessageBox.show({
				title   : dgettext('plugin_files', 'Warning'),
				msg     : dgettext('plugin_files', 'You can only rename one file!'),
				icon    : Zarafa.common.dialogs.MessageBox.WARNING,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		} else {
			Zarafa.plugins.files.data.Actions.openRenameDialog(this.model, records[0]);
		}
	},
	
	/**
	 * Delete the item
	 * @private
	 */
	onDelete : function() {
		var allowDelete = true;
		var records = this.model.getSelectedRecords();
		
		Ext.each(records, function(record) {
			if(record.get('id') === (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") || record.get('filename') === "..") {
				allowDelete = false;
			}
		}, this);
		
		var askOnDelete = container.getSettingsModel().get('zarafa/v1/contexts/files/ask_before_delete');
		
		if(allowDelete) {
			if(askOnDelete) {
				Ext.MessageBox.confirm(dgettext('plugin_files', 'Confirm deletion'), dgettext('plugin_files', 'Are you sure?'), function showResult(btn) {
					if(btn == 'yes') {
						Zarafa.plugins.files.data.ComponentBox.getStore().on('remove', function handleRemove(store, batch, data) {
								if(container.getCurrentContext().getCurrentView() === Zarafa.plugins.files.data.Views.ICON) {
								Zarafa.plugins.files.data.Actions.clearCache();
							} else {
								Zarafa.plugins.files.data.Actions.refreshNavigatorTree();
							}
						}, null, {single: true});
						
						Zarafa.common.Actions.deleteRecords(records);
					}
				}, this);
			} else {
				Zarafa.plugins.files.data.ComponentBox.getStore().on('remove', function handleRemove(store, batch, data) {
					if(container.getCurrentContext().getCurrentView() === Zarafa.plugins.files.data.Views.ICON) {
						Zarafa.plugins.files.data.Actions.clearCache();
					} else {
						Zarafa.plugins.files.data.Actions.refreshNavigatorTree();
					}
				}, null, {single: true});
						
				Zarafa.common.Actions.deleteRecords(records);
			}
		} else {
			Zarafa.common.dialogs.MessageBox.show({
				title   : dgettext('plugin_files', 'Warning'),
				msg     : dgettext('plugin_files', 'You cannot delete the parent folder!'),
				icon    : Zarafa.common.dialogs.MessageBox.WARNING,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		}
	}
});
