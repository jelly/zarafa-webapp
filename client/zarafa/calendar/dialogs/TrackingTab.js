Ext.namespace('Zarafa.calendar.dialogs');

/**
 * @class Zarafa.calendar.dialogs.TrackingTab
 * @extends Ext.Panel
 * @xtype zarafa.trackingtab
 * 
 * TrackingTab tab in the {@link Zarafa.calendar.dialogs.AppointmentPanel}
 * that is used to keep track of responses from attendees for Meeting Requests.
 */
Zarafa.calendar.dialogs.TrackingTab = Ext.extend(Ext.Panel, {
	/**
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config)
	{
		config = config || {};

		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.recordcomponentupdaterplugin');

		Ext.applyIf(config, {
			xtype: 'zarafa.trackingtab',
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			border: false,
			items: [{
				xtype: 'displayfield',
				value: _('The following responses for this meeting have been received') + ':',
				hideLabel : true
			},{
				xtype : 'grid',
				ref : 'responseTrackList',
				flex: 1,
				border: true,
				store: new Zarafa.core.data.IPMRecipientStore(),
				viewConfig : {
					forceFit : true
				},
				columns: [
				//@TODO:there is no iconclass of such items,so need to handle proper rendering class. 		
				/*{
					header : '<p class="icon_index">&nbsp;</p>',
					renderer : Zarafa.common.ui.grid.Renderers.icon,
					width: 24,
					fixed: true
				},*/{
					dataIndex: 'display_name',
					header: _('Name'),
					renderer : Ext.util.Format.htmlEncode,
					sortable: true
				},{
					dataIndex: 'recipient_type',
					header: _('Attendance'),
					sortable: true,
					renderer: Zarafa.common.ui.grid.Renderers.recipienttype
				},{
					dataIndex: 'recipient_trackstatus',
					header: _('Response'),
					sortable: true,
					renderer: Zarafa.common.ui.grid.Renderers.responsestatus
				}]
			}]
		});

		Zarafa.calendar.dialogs.TrackingTab.superclass.constructor.call(this, config);
	},

	/**
	 * Update the {@link Ext.Panel Panel} with the given {@link Zarafa.core.data.IPMRecord IPMRecord}
	 * Also it will build the tracking information data of attendees and pass it the the store
	 * @param {Zarafa.core.data.IPMRecord} record The record to update the panel with
	 * @param {Boolean} contentReset force the component to perform a full update of the data.
	 */
	update : function(record, contentReset)
	{	
		var recipientStore = record.getSubStore('recipients');

		if (recipientStore && this.responseTrackList.getStore() !== recipientStore) {
			this.responseTrackList.reconfigure(recipientStore, this.responseTrackList.getColumnModel());
		}
	}
});

Ext.reg('zarafa.trackingtab', Zarafa.calendar.dialogs.TrackingTab);
