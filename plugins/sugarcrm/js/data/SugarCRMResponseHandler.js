Ext.namespace('Zarafa.plugins.sugarcrm.data');

/**
 * @class Zarafa.plugins.sugarcrm.data.SugarCRMResponseHandler
 * @extends Zarafa.core.data.AbstractResponseHandler
 *
 * SugarCRM specific response handler.
 */
Zarafa.plugins.sugarcrm.data.SugarCRMResponseHandler = Ext.extend(Zarafa.core.data.AbstractResponseHandler, {

	/**
	 * Opens the window with the url returned from server or show error msg box in case of error.
	 * @param {Object} response Object contained the response data.
	 */
	doItem : function(response) {
		var server_url = response.serverurl;
		if(!Ext.isEmpty(server_url)) {
			window.open(server_url, "", "width=720,height=520,resizable=yes,scrollbars=yes");
		} else {
			Ext.MessageBox.show({
				title   : _('Warning'),
				msg     : response.message,
				icon    : Ext.MessageBox.WARNING,
				buttons : Ext.MessageBox.OK
			});
		}
	}
});

Ext.reg('sugarcrm.responsehandler', Zarafa.plugins.sugarcrm.data.SugarCRMResponseHandler);