Ext.namespace('Zarafa.calendar.dialogs');

/**
 * @class Zarafa.calendar.dialogs.SendMeetingRequestConfirmationContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype zarafa.sendmeetingrequestconfirmcontentpanel
 */
Zarafa.calendar.dialogs.SendMeetingRequestConfirmationContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
	/**
	 * @cfg {Zarafa.core.ui.IPMRecord} record The record for which the
	 * propose new time content panel is opened.
	 */
	record : undefined,

	/**
	 * @cfg {Zarafa.core.mapi.ResponseStatus} responseType The response type value selected by user.
	 */
	responseType : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		config = Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'zarafa.sendmeetingrequestconfirmcontentpanel',
			layout: 'fit',
			title: _('Send Meeting Request Confirmation'),
			modal : true,
			width: 350,
			height: 250,
			items: [{
				xtype: 'zarafa.sendmeetingrequestconfirmpanel',
				record: config.record,
				responseType: config.responseType,
				ref: 'sendMRConfirmationPanel',
				buttons: [{
					text: _('Ok'),
					handler: this.onOk,
					scope: this
				},{
					text: _('Cancel'),
					handler: this.onCancel,
					scope: this
				}]
			}]
		});

		Zarafa.calendar.dialogs.SendMeetingRequestConfirmationContentPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Event handler which is raised when the user clicks the "Ok" {@link Ext.Button button}
	 * @private
	 */
	onOk : function()
	{
		this.sendMRConfirmationPanel.updateRecord(this.record);
		this.close();
	},

	/**
	 * Event handler which is raised when the user clicks the "Cancel" {@link Ext.Button button}
	 *
	 * This will close the panel.
	 * @private
	 */
	onCancel : function()
	{
		this.close();
	}
});

Ext.reg('zarafa.sendmeetingrequestconfirmcontentpanel', Zarafa.calendar.dialogs.SendMeetingRequestConfirmationContentPanel);
