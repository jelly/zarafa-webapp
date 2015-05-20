Ext.namespace('Zarafa.plugins.files.context');

/**
 * @class Zarafa.plugins.files.FilesContext
 * @extends Zarafa.core.Context
 *
 * This class will be used as a controller between {@link Zarafa.plugins.files.FilesContextModel FilesContextModel}
 * and {@link Zarafa.plugins.files.ui.FilesMainPanel FilesMainPanel}
 * Context that handles displaying files type messages.
 */
Zarafa.plugins.files.context.FilesContext = Ext.extend(Zarafa.core.Context, {
	// Insertion points for this class
	/**
	 * @insert main.maintoolbar.view.files
	 * Insertion point for populating the main toolbar with a View button. This item is only visible
	 * when this context is active.
	 * @param {Zarafa.mail.FilesContext} context This context
	 */

	/**
	 * When searching, this property marks the {@link Zarafa.core.Context#getCurrentView view}
	 * which was used before {@link #onSearchStart searching started} the view was switched to
	 * {@link Zarafa.mail.data.Views#SEARCH}.
	 * @property
	 * @type Mixed
	 * @private
	 */
	oldView : undefined,

	/**
	 * When searching, this property marks the {@link Zarafa.core.Context#getCurrentViewMode viewmode}
	 * which was used before {@link #onSearchStart searching started} the viewmode was switched to
	 * {@link Zarafa.mail.data.ViewModes#SEARCH}.
	 * @property
	 * @type Mixed
	 * @private
	 */
	oldViewMode : undefined,
	 
	/**
	 * @constructor
	 * @param {Object} config configuration object
	 */
	constructor : function(config) {
		config = config || {};

		Ext.applyIf(config, {
			current_view : Zarafa.plugins.files.data.Views.LIST,
			current_view_mode : Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW
		});
				
		// register module names...
		this.registerModules();

		// The tab in the top tabbar
		this.registerInsertionPoint('main.maintabbar.left', this.createMainTab, this);

		// The "New Files" button which is available in all contexts
		this.registerInsertionPoint('main.maintoolbar.new.item', this.createNewFilesButton, this);
		
		// Add buttons to the MainToolbar
		this.registerInsertionPoint('main.toolbar.actions.last', this.createMainToolbarButtons, this);
		
		// Add a tree control showing a list of files folders to the navigation panel.
		// The control will be shown when the user selects the files context from the button panel.
		this.registerInsertionPoint('navigation.center', this.createFilesNavigationPanel, this);
		
		// Extend the Contact and AddressBook context with email buttons
		this.registerInsertionPoint('context.addressbook.contextmenu.actions', this.createSendEmailContextItem, this);
		this.registerInsertionPoint('context.contact.contextmenu.actions', this.createSendEmailContextItem, this);
		this.registerInsertionPoint('context.contact.contactcontentpanel.toolbar.actions', this.createSendEmailButton, this);
		this.registerInsertionPoint('context.contact.distlistcontentpanel.toolbar.actions', this.createSendEmailButton, this);

		Zarafa.plugins.files.context.FilesContext.superclass.constructor.call(this, config);

		// add shared components
		Zarafa.core.data.SharedComponentType.addProperty('zarafa.plugins.files.uploadpanel');
		Zarafa.core.data.SharedComponentType.addProperty('zarafa.plugins.files.attachdialog');
		Zarafa.core.data.SharedComponentType.addProperty('zarafa.plugins.files.fileinfopanel');
	},

	/**
	 * Returns the context model
	 * @return {Zarafa.plugins.files.context.FilesContextModel} the files context model
	 */
	getModel : function() {
		if (!Ext.isDefined(this.model)) {
			this.model = new Zarafa.plugins.files.context.FilesContextModel();
		}
		return this.model;
	},

	/**
	 * Bid for the given {@link Zarafa.hierarchy.data.MAPIFolderRecord folder}
	 * This will bid on any folder of container class 'IPF.Note'.
	 *
	 * @param {Zarafa.hierarchy.data.MAPIFolderRecord} folder The folder for which the context is bidding
	 * @return {Number} 1 when the contexts supports the folder, -1 otherwise
	 */
	bid : function(folder) {
		// Bid 1 when the folder is of the IPF.Files type.
		if (folder.isContainerClass('IPF.Files', true))
			return 1;

		return -1;
	},

	/**
	 * Bid for the type of shared component and the given record.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent: function(type, record) {
		var bid = -1;

		if (Ext.isArray(record))
			record = record[0];
		
		switch (type) {
			case Zarafa.core.data.SharedComponentType['zarafa.plugins.files.uploadpanel']:
			case Zarafa.core.data.SharedComponentType['zarafa.plugins.files.attachdialog']:
			case Zarafa.core.data.SharedComponentType['zarafa.plugins.files.fileinfopanel']:
				bid = 1;
				break;
			case Zarafa.core.data.SharedComponentType['common.create']:
			case Zarafa.core.data.SharedComponentType['common.view']:
			case Zarafa.core.data.SharedComponentType['common.preview']:
				if (record instanceof Zarafa.core.data.IPMRecord && record.isMessageClass('IPM.Files', true))
					bid = 1;
				break;
			case Zarafa.core.data.SharedComponentType['common.contextmenu']:
				if (record instanceof Zarafa.core.data.IPMRecord && record.isMessageClass('IPM.Files', true))
					bid = 1;
				break;
			default : break;
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
	getSharedComponent: function(type, record) {
		var component;
		switch (type) {
			case Zarafa.core.data.SharedComponentType['zarafa.plugins.files.uploadpanel']:
				component = Zarafa.plugins.files.ui.UploadPanel;
				break;
			case Zarafa.core.data.SharedComponentType['zarafa.plugins.files.attachdialog']:
				component = Zarafa.plugins.files.dialogs.AttachFromFilesContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['zarafa.plugins.files.fileinfopanel']:
				component = Zarafa.plugins.files.dialogs.ShowFilesFileContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['common.create']:
				component = Zarafa.plugins.files.dialogs.FilesUploadContentPanel;
				break;
			case Zarafa.core.data.SharedComponentType['common.view']:
				component = Zarafa.plugins.files.ui.FilesViewPanel;
				break;
			case Zarafa.core.data.SharedComponentType['common.preview']:
				component = Zarafa.plugins.files.ui.FilesViewPanel;
				break;
			case Zarafa.core.data.SharedComponentType['common.contextmenu']:
				component = Zarafa.plugins.files.ui.FilesFileGridContextMenu;
				break;
		}
		return component;
	},

	/**
	 * Creates the files tree that is shown when the user selects the files context from the
	 * button panel. It shows a tree of available files folders that can be checked and unchecked.
	 * @private
	 */
	createFilesNavigationPanel : function() {
		return {
			xtype : 'zarafa.contextnavigation',
			context : this,
			items : [{
				xtype : 'panel',
				cls: 'zarafa-context-navigation-block',
				title : container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'),
				items : [{ 
					xtype: 'zarafa.filestreepanel',
					ref : '../../../filesTreepanel'
				}]
			}]
		};
	},

	/**
	 * creates a context panel
	 * @return configuration for files context
	 * @private
	 */
	createContentPanel: function() {
		return {
			xtype : 'zarafa.filesmainpanel',
			context : this
		};
	},

	/**
	 * Create "New File" {@link Ext.menu.MenuItem item} for the "New item"
	 * {@link Ext.menu.Menu menu} in the {@link Zarafa.core.ui.MainToolbar toolbar}.
	 * This button should be shown in all {@link Zarafa.core.Context contexts} and
	 * is used to create a new Sticky Files.
	 *
	 * @return {Object} The menu item for creating a new Sticky Files item
	 */
	createNewFilesButton: function() {
		return {
			xtype: 'menuitem',
			text: dgettext('plugin_files', 'Upload file'),
			iconCls: 'icon_files_category',
			newMenuIndex: 6,
			context: this.getName(),
			handler: function() {
				Zarafa.plugins.files.data.Actions.openCreateFilesContent(this.getModel());
			},
			scope: this
		};
	},

	/**
	 * Handler for the insertion points for extending the Contacts and AddressBook context menus
	 * with buttons to send a mail to the given Contact and Address Book.
	 * @private
	 */
	createSendEmailContextItem : function() {
		return {
			text : dgettext('plugin_files', 'Send file'),
			iconCls : 'icon_attachment',
			scope : this,
			handler : function(item) {
				Zarafa.plugins.files.data.Actions.openCreateMailContentForContacts(this.getModel(), item.parentMenu.records);
			},
			beforeShow : function(item, records) {
				var visible = false;

				for (var i = 0, len = records.length; i < len; i++) {
					var record = records[i];
					if (this.isSendEmailButtonVisible(record)) {
						visible = true;
						break;
					}
				}

				item.setVisible(visible);
			}
		};
	},

	/**
	 * Handler for the insertion points for extending the Contacts and Distribution Dialogs
	 * with buttons to send a mail to the given Contact or Distribution list.
	 * @private
	 */
	createSendEmailButton : function() {
		return {
			xtype : 'button',
			plugins : [ 'zarafa.recordcomponentupdaterplugin' ],
			iconCls : 'icon_attachment',
			overflowText : dgettext('plugin_files', 'Send file'),
			tooltip : {
				title : dgettext('plugin_files', 'Send file'),
				text : dgettext('plugin_files', 'Create a new email message with some files attached.')
			},
			handler : function(btn) {
				Zarafa.plugins.files.data.Actions.openCreateMailContentForContacts(this.getModel(), btn.record);
			},
			scope : this,
			update : function(record, resetContent) {
				this.record = record;
				if (resetContent) {
					// Small workaround, update is called from the btn scope,
					// but the handler from the Context scope. So access
					// isSendEmailButtonVisible from the scope.
					if (!this.scope.isSendEmailButtonVisible(record)) {
						this.hide();
					}
				}
			}
		}
	},
	
	/**
	 * Check if the given record (which represents a Contact or Distribution list
	 * can be mailed (this requires the record not to be a {@link Ext.data.Record#phantom}
	 * and the Contact should {@link Zarafa.contact.ContactRecord#hasEmailAddress have an email address}.
	 * @param {Zarafa.core.data.MAPIRecord} record The record to check
	 * @return {Boolean} True if we can send an email to this contact/distlist
	 * @private
	 */
	isSendEmailButtonVisible : function(record) {
		if (record.phantom) {
			return false;
		} else if (record.isMessageClass('IPM.Contact')) {
			if (!record.hasEmailAddress()) {
				return false;
			}
		}

		return true;
	},
	
	/**
	 * Returns the buttons for the dropdown list of the VIEW-button in the main toolbar. It will use the 
	 * main.maintoolbar.view.files insertion point to allow other plugins to add their items at the end.
	 * 
	 * @return {Ext.Component[]} an array of components
	 */
	getMainToolbarViewButtons : function() {
		var items = container.populateInsertionPoint('main.maintoolbar.view.files', this) || [];
		
		var defaultItems = [{
			overflowText: dgettext('plugin_files', 'No preview'),
			iconCls: 'icon_previewpanel_off',
			text: dgettext('plugin_files', 'No preview'),
			valueViewMode : Zarafa.plugins.files.data.ViewModes.NO_PREVIEW,
			valueDataMode : Zarafa.plugins.files.data.DataModes.ALL,
			handler: this.onContextSelectView,
			scope: this
		},{
			overflowText: dgettext('plugin_files', 'Right preview'),
			iconCls: 'icon_previewpanel_right',
			text: dgettext('plugin_files', 'Right preview'),
			valueViewMode : Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW,
			valueDataMode : Zarafa.plugins.files.data.DataModes.ALL,
			handler: this.onContextSelectView,
			scope: this
		},{
			overflowText: dgettext('plugin_files', 'Bottom preview'),
			iconCls: 'icon_previewpanel_bottom',
			text: dgettext('plugin_files', 'Bottom preview'),
			valueViewMode : Zarafa.plugins.files.data.ViewModes.BOTTOM_PREVIEW,
			valueDataMode : Zarafa.plugins.files.data.DataModes.ALL,
			handler: this.onContextSelectView,
			scope: this
		}];
		
		defaultItems.push();

		return defaultItems.concat(items);
	},
	
	/**
	 * Adds buttons to the maintoolbar like the view switcher button.
	 * @return {Array}
	 * @private
	 */
	createMainToolbarButtons: function() {
		return [{
			xtype : 'splitbutton',
			tooltip: dgettext('plugin_files', 'Switch view'),
			scale: 'large',
			iconCls: 'icon_viewswitch',
			handler: function () {
				this.showMenu();
			},
			listeners: {
				afterrender: this.onAfterRenderMainToolbarButtons,
				scope: this
			},
			menu: new Ext.menu.Menu({
				items: [{
					text : dgettext('plugin_files', 'List'),
					overflowText : dgettext('plugin_files', 'List'),
					tooltip : dgettext('plugin_files', 'List'),
					iconCls : 'note_list_view',
					valueView : Zarafa.plugins.files.data.Views.LIST,
					handler : this.onSwitchView,
					scope: this
				}, {
					text : dgettext('plugin_files', 'Icons'),
					overflowText : dgettext('plugin_files', 'Icons'),
					tooltip : dgettext('plugin_files', 'Icons'),
					iconCls : 'note_icon_view',
					valueView : Zarafa.plugins.files.data.Views.ICON,
					handler : this.onSwitchView,
					scope: this
				}]
			})
		}]
	},
	
	/**
	 * Registers to the {@link Zarafa.core.Container#contextswitch contextswitch} event on the 
	 * {@link Zarafa.core.Container container} so the visiblity of the button can be toggled 
	 * whenever the context is switched. We do this after the button is rendered.
	 * @param {Ext.Button} btn The button
	 * @private
	 */
	onAfterRenderMainToolbarButtons: function(btn) {
		btn.mon(container, 'contextswitch', function(parameters, oldContext, newContext){
			this.setVisiblityMainToolbarButton(btn, newContext);
		}, this);

		btn.mon(this, 'viewchange', function(context, newView, oldView ){
			this.setVisiblityMainToolbarButton(btn, context);
		}, this);

		this.setVisiblityMainToolbarButton(btn);
	},

	/**
	 * Determines whether the passed button has to be shown or not based on what 
	 * {@link Zarafa.core.Context Context} is active. If no Context is supplied as an argument it 
	 * will get that from the {@link Zarafa.core.Container container}.
	 * @param {Ext.Button} btn The button
	 * @param {Zarafa.core.Context} activeContext (Optionial} The active Context
	 * @private
	 */
	setVisiblityMainToolbarButton: function(btn, activeContext) {
		activeContext = activeContext || container.getCurrentContext();
		if(activeContext === this){
			btn.show();
		}else{
			btn.hide();
		}
	},
	
	/**
	 * Event handler which is fired when one of the view buttons has been pressed.
	 * @param {Ext.Button} button The button which was pressed
	 * @private
	 */
	onSwitchView : function(button) {
		var viewMode = this.getCurrentViewMode();
		this.switchView(button.valueView, viewMode);
	},

	/**
	 * Event handler which is fired when one of the View buttons
	 * has been pressed. This will call {@link #setView setView}
	 * to update the view.
	 * @param {Ext.Button} button The button which was pressed
	 * @private
	 */
	onContextSelectView : function(button) {
		this.getModel().setDataMode(button.valueDataMode);
		
		var view = button.valueView;
		var viewMode = button.valueViewMode;
		
		if(!Ext.isDefined(button.valueView))
			view = this.getCurrentView();
		if(!Ext.isDefined(button.valueViewMode))
			viewMode = this.getCurrentViewMode();
		
		this.switchView(view, viewMode);
		
		// update the preview panel (redo layout)
		this.getModel().setPreviewRecord(undefined,true);
	},
	
	/**
	 * Adds a button to the top tab bar for this context.
	 * @return {Object} The button for the top tabbar 
	 * @private
	 */
	createMainTab: function() {
		return {
			text: this.getDisplayName(),
			tabOrderIndex: 7,
			context: this.getName()
		};
	},
	
	/**
	 * Registeres the php models for this context
	 * @private
	 */
	registerModules: function() {
		Zarafa.core.ModuleNames['IPM.FILES'] = {
			list : 'filesbrowsermodule',
			item : 'filesbrowsermodule'
		}
	}
});

/**
 * register the context
 */
Zarafa.onReady(function() {	
	if(Ext.isDefined(container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'))) { // check if user store is initialised
		if(container.getSettingsModel().get('zarafa/v1/plugins/files/enable') === true && container.getSettingsModel().get('zarafa/v1/plugins/filescontext/enable') === true) { // make sure that the master plugin is enabled
			container.registerContext(new Zarafa.core.ContextMetaData({
				name : 'filescontext',
				displayName : container.getSettingsModel().get('zarafa/v1/plugins/files/button_name'),
				allowUserVisible : false,
				pluginConstructor : Zarafa.plugins.files.context.FilesContext
			}));
		}
	}
});
