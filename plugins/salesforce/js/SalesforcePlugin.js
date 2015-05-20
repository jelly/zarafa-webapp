Ext.namespace('Zarafa.plugins.salesforce');

/**
 * @class Zarafa.plugins.dropboxattachment.DropBoxAttachmentPlugin
 * @extends Zarafa.core.Plugin
 * This class is used for adding files from the users's Dropbox folder
 * to his emails as attachments
 */
Zarafa.plugins.salesforce.SalesforcePlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.salesforce.SalesforcePlugin.superclass.initPlugin.apply(this, arguments);

		this.registerInsertionPoint('context.mail.contextmenu.options', this.putCreateContactCaseMenuItem)
	},

	/**
	 * Generates a button for work with dropbox attachment plugin
	 * @private
	 */
	putCreateContactCaseMenuItem : function()
	{
		var menuitem = {
			xtype       : 'zarafa.conditionalitem',
			text        : _('Create Case in Salesforce'),
			overflowText: _('Create Case in Salesforce'),
			iconCls     : 'icon_salesforce',
			handler     : this.showSalesforceCreateCaseDialog,
			scope       : this
		};
		return menuitem;
	},

	/**
	 * Initializes Dialog for adding attachment from Dropbox to email
	 * @param {Object} btn
	 * @private
	 */
	showSalesforceCreateCaseDialog : function(btn)
	{
		//In current version we take only the last selected record
		var selectedRecords = container.getCurrentContext().getModel().getSelectedRecords();
		var lastRecord = selectedRecords.pop();

		var queryString = 	'load=custom&name=salesforce&' +
							'entryid='+lastRecord.get('entryid')+
							'&parent_entryid='+lastRecord.get('parent_entryid')+
							'&store_entryid='+lastRecord.get('store_entryid');

		window.open('index.php?' + queryString , _('Create Case in Salesforce'), "width=920,height=520");
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'salesforce',
		displayName : _('SalesForce'),
		pluginConstructor : Zarafa.plugins.salesforce.SalesforcePlugin
	}));
});
