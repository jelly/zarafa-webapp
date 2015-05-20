Ext.namespace('Zarafa.plugins.facebook');

/**
 * @class Zarafa.plugins.facebook.FbEventSelectionGrid
 * @extends Ext.grid.GridPanel
 * grid with events from facebook
 */
Zarafa.plugins.facebook.FbEventSelectionGrid = Ext.extend(Ext.grid.GridPanel, {

	/*
	 * @constructor
	 * @param {object} config Configuration options.
	 */
	constructor: function(config)
	{
		config = config || {};

		Ext.apply(config, {
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					width: 120,
					sortable: false
					},
				columns: [
					{header: _('Name'), name: 'name', dataIndex: 'name'},
					{header: _('Status'), name:  'rsvp_status',dataIndex: 'rsvp_status'},
					{header: _('Start Time'), name:  'start_time',dataIndex: 'start_time'},
					{header: _('End Time'), name: 'end_time',dataIndex: 'end_time'},
					{header: _('Location'), name: 'location',dataIndex: 'location'},
					{header: _('Description'), name: 'description', dataIndex: 'description'}
				]
			}),
			frame : true,
			buttons: [
				{
					xtype: 'button',
					width: 'auto',
					text: _('Save'),
					handler: this.onSave,
					scope: this
				}
			],
			viewConfig: {
				forceFit: true
			},
			scroll: true,
			sm: new Ext.grid.RowSelectionModel({multiSelect:true}),
			enableRowBody: true
		});
		Zarafa.plugins.facebook.FbEventSelectionGrid.superclass.constructor.call(this, config);
	},

	/**
	 * function for save facebook events in zarafa calendar
	 * @private
	 */
	onSave: function() {
		this.saveEvents();
	},

	/**
	 * create an appointment record from
	 * facebook event and save it in calendar
	 */
	saveEvents: function() {
		//receive existing calendar store
		var calendarStore = new Zarafa.calendar.AppointmentStore();
		var calendarFolder =  container.getHierarchyStore().getDefaultFolder('calendar');
		//receive Records from grid rows
		var newRecords = this.selModel.getSelections();
		Ext.each(newRecords, function(newRecord) {
			var record = newRecord.convertToAppointmentRecord(calendarFolder);
			calendarStore.add(record);
			calendarStore.save();
		}, this);
		this.dialog.close();
	}
});

Ext.reg('facebook.fbeventselectiongrid', Zarafa.plugins.facebook.FbEventSelectionGrid);