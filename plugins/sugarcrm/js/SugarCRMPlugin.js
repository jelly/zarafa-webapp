Ext.namespace('Zarafa.plugins.sugarcrm');

/**
 * @class Zarafa.plugins.sugarcrm.SugarCRMPlugin
 * @extends Zarafa.core.Plugin
 *
 * SugarCRM integration plugin.
 * Allows to archive selected record to SugarCRM.
 */
Zarafa.plugins.sugarcrm.SugarCRMPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Called after constructor.
	 * Registers insertion point in contexts context menus.
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.sugarcrm.SugarCRMPlugin.superclass.initPlugin.apply(this, arguments);

		this.registerInsertionPoint('context.mail.contextmenu.options', this.putAcrhiveMenuIconInContextMenu, this)
	},

	/**
	 * Creates configured context menu item.
	 *
	 * @return {Zarafa.core.ui.menu.ConditionalItem} menuItem MenuItem instance
	 */
	putAcrhiveMenuIconInContextMenu : function() {
		var plugin = this;
		var menuItem = {
			xtype       		: 'zarafa.conditionalitem',
			text        		: _('Archive to SugarCRM'),
			iconCls     		: 'icon_sugarcrm_archive',
			singleSelectOnly 	: true,
			handler     		: this.showArchiveToSugarCRMDialog,
			scope 				: this
		};
		return menuItem;
	},

	/**
	 * Send request to server after the user clicked on menu item.
	 * Opens the new window with returned url from server - in case of
	 * success.
	 *
	 */
	showArchiveToSugarCRMDialog : function(conditionalItem) {
		//In current version we take only the last selected record
		var selectedRecords = conditionalItem.getRecords();
		var lastRecord = selectedRecords[0];
		container.getRequest().singleRequest('sugarcrmmodule', 'archive', {
			entryid : lastRecord.get('entryid'),
			parent_entryid : lastRecord.get('parent_entryid'),
			store_entryid : lastRecord.get('store_entryid'),
			profile : 'sugarcrm'
		}, new Zarafa.plugins.sugarcrm.data.SugarCRMResponseHandler());
	}


});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'sugarcrm',
		displayName : _('SugarCRM Plugin'),
		about : Zarafa.plugins.sugarcrm.ABOUT,
		pluginConstructor : Zarafa.plugins.sugarcrm.SugarCRMPlugin
	}));
});
