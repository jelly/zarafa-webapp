Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesFileGridContextMenu
 * @extends Zarafa.core.ui.menu.ConditionalMenu
 * @xtype zarafa.filesfilegridcontextmenu
 *
 * Extend {@link Zarafa.core.ui.menu.ConditionalMenu ConditionalMenu} to add the
 * {@link Zarafa.core.ui.menu.ConditionalItems ConditionalItems} for the
 * FilesContext.
 */
Zarafa.plugins.files.ui.FilesFileGridContextMenu = Ext.extend(Zarafa.core.ui.menu.ConditionalMenu, {
	// Insertion points for this class
	/**
	 * @insert context.files.contextmenu.actions
	 * Insertion point for adding actions menu items into the context menu
	 * @param {Zarafa.plugins.files.ui.FilesGridContextMenu} contextmenu This contextmenu
	 */
	/**
	 * @insert context.files.contextmenu.options
	 * Insertion point for adding options menu items into the context menu
	 * @param {Zarafa.plugins.files.ui.FilesGridContextMenu} contextmenu This contextmenu
	 */

	/**
	 * @cfg {Zarafa.plugins.files.context.FilesContext} context The context to which this panel belongs
	 */
	context : undefined,

	/**
	 * The {@link Zarafa.plugins.files.FilesContextModel} which is obtained from the {@link #context}.
	 * @property
	 * @type Zarafa.plugins.files.context.FilesContextModel
	 */
	model : undefined,
	
	/**
	 * The {@link Zarafa.plugins.files.ui.FilesFileGrid} which is obtained from the {@link #config}.
	 * @property
	 * @type Zarafa.plugins.files.ui.FilesFileGrid
	 */
	grid : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};

		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context))
			config.model = config.context.getModel();
		
		Ext.applyIf(config, {
			items: [
				this.createContextActionItems(),
				{ xtype: 'menuseparator' },
				container.populateInsertionPoint('context.filescontext.contextmenu.actions', this),
				{ xtype: 'menuseparator' },
				container.populateInsertionPoint('context.filescontext.contextmenu.options', this)
			]
		});

		Zarafa.plugins.files.ui.FilesFileGridContextMenu.superclass.constructor.call(this, config);
	},
	
	/**
	 * Apply the {@link #emptySelectOnly}, {@link #nonEmptySelectOnly}, {@link #singleSelectOnly}
	 * and {@link #multiSelectOnly} filters to determine if the item must be {@link #setDisabled disabled}
	 * or not.
	 * @private
	 */
	applyItemFilter : function(records, singleSelectOnly, fileOnly, noRoot) {
		var visible = true;
		
		if (singleSelectOnly) {
			if (!Ext.isDefined(records) || (Ext.isArray(records) && records.length != 1))
				visible = false;
		}
		
		if (fileOnly) {
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				if(record.get('type') == Zarafa.plugins.files.data.FileTypes.FOLDER) {
					visible = false;
					break;
				}
			}
		}
		
		if (noRoot) {
			for (var i = 0; i < records.length; i++) {
				var record = records[i];
				if(record.get('id') === (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") || record.get('filename') === "..") {
					visible = false;
					break;
				}
			}
		}
		
		return visible;
	},

	/**
	 * Create the Action context menu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Action context menu items
	 * @private
	 */
	createContextActionItems : function() {
		return [{
			xtype: 'zarafa.conditionalitem',
			text : dgettext('plugin_files', 'Open'),
			iconCls : 'icon_open',
			handler: this.onContextItemOpen,
			beforeShow : function(item, records) {
				var visible = this.applyItemFilter(records, false, true, false);
				var visibleFolders = this.applyItemFilter(records, true, false, false);
				
				item.setVisible(visible || visibleFolders);
			},
			scope: this
		},
		{
			xtype: 'zarafa.conditionalitem',
			text : dgettext('plugin_files', 'Rename'),
			iconCls : 'icon_rename',
			handler: this.onContextItemRename,
			beforeShow : function(item, records) {
				item.setVisible(this.applyItemFilter(records, true, false, true));
			},
			scope: this
		},
		{
			xtype: 'zarafa.conditionalitem',
			text : dgettext('plugin_files', 'Attach to mail'),
			iconCls : 'icon_replyEmail',
			handler: this.onContextItemAttach,
			beforeShow : function(item, records) {
				var visible = this.applyItemFilter(records, false, true, true);
				
				var max_file_size = container.getSettingsModel().get('zarafa/v1/main/attachments/max_attachment_size');
				for (var i = 0; i < records.length; i++) {
					var record = records[i];
					if(record.get('message_size') > max_file_size) {
						visible = false;
						break;
					}
				}
				
				item.setVisible(visible);
			},
			scope: this
		},
		{
			xtype: 'zarafa.conditionalitem',
			text : dgettext('plugin_files', 'Delete'),
			iconCls : 'icon_delete',
			handler: this.onContextItemDelete,
			beforeShow : function(item, records) {
				item.setVisible(this.applyItemFilter(records, false, false, true));
			},
			scope: this
		},
		{
			xtype: 'zarafa.conditionalitem',
			text : dgettext('plugin_files', 'Info'),
			iconCls : 'icon_info',
			disabled : Zarafa.plugins.files.data.ComponentBox.getContext().getCurrentViewMode() == Zarafa.plugins.files.data.ViewModes.NO_PREVIEW ? false : true,
			handler: this.onContextItemInfo,
			beforeShow : function(item, records) {
				item.setVisible(this.applyItemFilter(records, true, false, true));
			},
			scope: this
		}];
	},

	/**
	 * Event handler which is called when the user selects the 'Open'
	 * item in the context menu. This will open the item in a new panel.
	 * @private
	 */
	onContextItemOpen : function() {
		Zarafa.plugins.files.data.Actions.openFilesContent(this.records);
	},
	
	/**
	 * Event handler which is called when the user selects the 'Delete'
	 * item in the context menu. This will delete all selected records.
	 * @private
	 */
	onContextItemDelete : function() {
		var allowDelete = true;
		
		Ext.each(this.records, function(record) {
			if(record.get('id') === (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") || record.get('filename') === "..") {
				allowDelete = false;
			}
		}, this);
		
		var askOnDelete = container.getSettingsModel().get('zarafa/v1/contexts/files/ask_before_delete');
		
		if(allowDelete) {
			if(askOnDelete) {
				Ext.MessageBox.confirm(dgettext('plugin_files', 'Confirm deletion'), dgettext('plugin_files', 'Are you sure?'), this.doDelete, this);
			} else {
				this.doDelete();
			}
		}
		
	},
	
	/**
	 * Delete the selected files.
	 *
	 * @param {String} button The value of the button
	 * @private
	 */
	doDelete : function (button) {
		if(!Ext.isDefined(button) || button === 'yes') {
			Zarafa.plugins.files.data.ComponentBox.getStore().on('remove', this.deleteDone, null, {single: true});
			Zarafa.common.Actions.deleteRecords(this.records);
		}
	},
	
	/**
	 * Function gets called after files were removed.
	 * @private
	 */
	deleteDone : function () {
		if(container.getCurrentContext().getCurrentView() === Zarafa.plugins.files.data.Views.ICON) {
			Zarafa.plugins.files.data.Actions.clearCache();
		} else {
			Zarafa.plugins.files.data.Actions.refreshNavigatorTree();
		}
	},
	
	/**
	 * Event handler which is called when the user selects the 'Info'
	 * item in the context menu. This will load the preview panel with infos about the file
	 * @private
	 */
	onContextItemInfo : function() {
		var count = this.records.length;
		var record = undefined;
		
		if (count == 1)
			record = this.records[0];
	
		var config = Ext.applyIf({}, {
			modal : true,
			record : record
		});
		
		var componentType = Zarafa.core.data.SharedComponentType['zarafa.plugins.files.fileinfopanel'];
		Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
	},
	
	/**
	 * Event handler which is called when the user selects the 'Rename'
	 * item in the context menu. This will load the preview panel with infos about the file
	 * @private
	 */
	onContextItemRename : function() {
		Zarafa.plugins.files.data.Actions.openRenameDialog(this.model, this.records[0]);
	},
	
	/**
	 * Event handler which is called when the user selects the 'Attach to Mail'
	 * item in the context menu. 
	 * @private
	 */
	onContextItemAttach : function() {
		var emailRecord = container.getContextByName("mail").getModel().createRecord();
		var idsList = [];
		var attachmentStore = emailRecord.getAttachmentStore();

		Ext.each(this.records, function(record) {
			idsList.push(record.get('id'));
		}, this);
		
		container.getNotifier().notify('info.files', dgettext('plugin_files', 'Attaching'), dgettext('plugin_files', 'Creating email... Please wait!'));
		
		try {
			container.getRequest().singleRequest(
				'filesmodule',
				'download-to-tmp',
				{
					ids : idsList,
					dialog_attachments: attachmentStore.getId()
				},
				new Zarafa.plugins.files.data.ResponseHandler({
					successCallback : this.attachToMail.createDelegate(this, [emailRecord], true)
				})
			);
		} catch (e) {
			Zarafa.plugins.files.data.Actions.msgWarning(e.message);
		}
	},
	
	/**
	 * Attach a file to an email.
	 *
	 * @param {Array} responseItems
	 * @param {Object} response Server response
	 * @param {IPMRecord} emailRecord
	 */
	attachToMail : function(responseItems, response, emailRecord) {
		Zarafa.plugins.files.data.Actions.openCreateMailContent(emailRecord,responseItems);
	}
});

Ext.reg('zarafa.filesfilegridcontextmenu', Zarafa.plugins.files.ui.FilesFileGridContextMenu);
