Ext.namespace('Zarafa.hierarchy');

/**
 * @class Zarafa.hierarchy.HierarchyContext
 * @extends Zarafa.core.Context
 */
Zarafa.hierarchy.HierarchyContext = Ext.extend(Zarafa.core.Context, {
	/*
	 * @constructor
	 * @param config
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			hasToolbar : false,
			hasContentPanel : false
		});

		Zarafa.hierarchy.HierarchyContext.superclass.constructor.call(this, config);

		this.registerInsertionPoint('main.maintoolbar.new.folder', this.createNewFolderButton, this);

		// Register hierarchy specific dialog types
		Zarafa.core.data.SharedComponentType.addProperty('hierarchy.dialog.folderselection');
		Zarafa.core.data.SharedComponentType.addProperty('hierarchy.dialog.folderproperties');
		Zarafa.core.data.SharedComponentType.addProperty('hierarchy.dialog.foldersize');
		Zarafa.core.data.SharedComponentType.addProperty('hierarchy.dialog.opensharedfolder');
	},

	/**
	 * Bid for the type of shared component and the given record.
	 * This will bid on a dialog.crate or dialog.view for a record with a 
	 * message class set to IPM or IPM.Note.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent: function(type, record)
	{
		var bid = -1;

		switch (type) {
			case Zarafa.core.data.SharedComponentType['common.create']:
			case Zarafa.core.data.SharedComponentType['common.contextmenu']:
				if (record instanceof Zarafa.core.data.MAPIRecord) {
					if (record.get('object_type') == Zarafa.core.mapi.ObjectType.MAPI_FOLDER) {
						bid = 1;
					}
				}
				break;
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.folderselection']:
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.folderproperties']:
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.foldersize']:
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.opensharedfolder']:
				bid = 1;
				break;
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent: function(type, record)
	{
		var component;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['common.create']:
				component = Zarafa.hierarchy.dialogs.CreateFolderContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.folderselection']:
				component = Zarafa.hierarchy.dialogs.FolderSelectionContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.folderproperties']:
				component = Zarafa.hierarchy.dialogs.FolderPropertiesContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.foldersize']:
				component = Zarafa.hierarchy.dialogs.FolderSizeContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['hierarchy.dialog.opensharedfolder']:
				component = Zarafa.hierarchy.dialogs.SharedFolderContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['common.contextmenu']:
				component = Zarafa.hierarchy.ui.ContextMenu;
				break;
		}
		return component;
	},

	/**
	 * Create "New Email" {@link Ext.menu.MenuItem item} for the "New item"
	 * {@link Ext.menu.Menu menu} in the {@link Zarafa.mail.ui.MailToolbar toolbar}.
	 * This button should be shown in all {@link Zarafa.core.Context contexts} and
	 * is used to create a new Email.
	 *
	 * @param {Zarafa.core.Context} context (optional) context object that will be used for scoping if this
	 * method is called from constructor of {@link Zarafa.calendar.ui.MailToolbar MailToolbar}
	 * @return {Object} The menu item for creating a new Email item
	 * @static
	 */
	createNewFolderButton: function(context)
	{
		if(Ext.isEmpty(context) || !(context instanceof Zarafa.core.Context))
			context = this;

		if(!(context instanceof Zarafa.core.Context))
			return;

		return [{
			xtype: 'menuitem',
			text: _('Folder'),
			tooltip : _('Folder')+' (Ctrl + Alt + F)',
			plugins : 'zarafa.menuitemtooltipplugin',
			iconCls: 'icon_createFolder',
			newMenuIndex: 1,
			handler: this.onCreateFolder,
			scope: this
		}];
	},

	/**
	 * Open the {@link Zarafa.common.dialogs.CreateFolderContentPanel CreateFolderContentPanel} for
	 * creating a new folder within the Store hierarchy.
	 * @private
	 */
	onCreateFolder : function()
	{
		Zarafa.hierarchy.Actions.openCreateFolderContent();
	}
});

Zarafa.onReady(function() {
	container.registerContext(new Zarafa.core.ContextMetaData({
		name : 'hierarchy',
		allowUserVisible : false,
		pluginConstructor : Zarafa.hierarchy.HierarchyContext
	}));
});
