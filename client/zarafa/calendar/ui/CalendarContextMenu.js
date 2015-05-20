Ext.namespace('Zarafa.calendar.ui');

/**
 * @class Zarafa.calendar.ui.CalendarContextMenu
 * @extends Zarafa.core.ui.menu.ConditionalMenu
 * @xtype zarafa.calendarcontextmenu
 *
 * Extend {@link Zarafa.core.ui.menu.ConditionalMenu ConditionalMenu} to add the
 * {@link Zarafa.core.ui.menu.ConditionalItems ConditionalItems} for the
 * CalendarContext.
 */
Zarafa.calendar.ui.CalendarContextMenu = Ext.extend(Zarafa.core.ui.menu.ConditionalMenu, {
	// Insertion points for this class
	/**
	 * @insert context.calendar.contextmenu.actions
	 * Insertion point for adding actions menu items into the context menu
	 * @param {Zarafa.calendar.ui.CalendarContextMenu} contextmenu This contextmenu
	 */
	/**
	 * @insert context.calendar.contextmenu.options
	 * Insertion point for adding options menu items into the context menu
	 * @param {Zarafa.calendar.ui.CalendarContextMenu} contextmenu This contextmenu
	 */

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		if (Ext.isDefined(config.records) && !Ext.isArray(config.records)) {
			config.records = [ config.records ];
		}							

		config = Ext.applyIf(config, {
			items: [
				this.createContextActionItems(),
				{ xtype: 'menuseparator' },
				container.populateInsertionPoint('context.calendar.contextmenu.actions', this),
				{ xtype: 'menuseparator' },
				this.createContextOptionsItems(),
				{ xtype: 'menuseparator' },
				container.populateInsertionPoint('context.calendar.contextmenu.options', this)
			]
		});

		Zarafa.calendar.ui.CalendarContextMenu.superclass.constructor.call(this, config);
	},

	/**
	 * Create the Action context menu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Action context menu items
	 * @private
	 */
	createContextActionItems : function()
	{
		return [{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_create_appointment',
			text : _('New Appointment'),
			beforeShow : this.beforeShowPhantom,
			meetingRequest: false,
			handler : this.onCreate,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_create_meeting_request',
			text : _('New Meeting Request'),
			beforeShow : this.beforeShowPhantom,
			meetingRequest: true,
			handler : this.onCreate,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_open',
			text : _('Open'),
			beforeShow : this.beforeShowNonPhantom,
			handler : this.onOpen,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_delete',
			text : _('Delete'),
			beforeShow : this.beforeShowNonPhantom,
			handler : this.onDelete,
			scope: this
		}];
	},

	/**
	 * Create the Option context menu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Option context menu items
	 * @private
	 */
	createContextOptionsItems : function()
	{
		return [{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_categories',
			text : _('Categories'),
			beforeShow : this.beforeShowNonPhantom,
			handler : this.onCategories,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_busystatus',
			text : _('Show as'),
			beforeShow : this.beforeShowNonPhantom,
			menu : {
				xtype: 'zarafa.conditionalmenu',
				items: this.createBusyStatusItems()
			}
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_appointmentlabel',
			text : _('Label'),
			beforeShow : this.beforeShowNonPhantom,
			menu : {
				xtype: 'zarafa.conditionalmenu',
				items: this.createLabelItems()
			}
		}];
	},

	/**
	 * Create the Busy status context submenu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Busy status context submenu items
	 * @private
	 */
	createBusyStatusItems : function()
	{
		return [{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_busystatus_free',
			text : Zarafa.core.mapi.BusyStatus.getDisplayName(Zarafa.core.mapi.BusyStatus.FREE),
			busyStatus : Zarafa.core.mapi.BusyStatus.FREE,
			handler : this.onSetBusyStatus,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_busystatus_tentative',
			text : Zarafa.core.mapi.BusyStatus.getDisplayName(Zarafa.core.mapi.BusyStatus.TENTATIVE),
			busyStatus: Zarafa.core.mapi.BusyStatus.TENTATIVE,
			handler : this.onSetBusyStatus,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_busystatus_busy',
			text : Zarafa.core.mapi.BusyStatus.getDisplayName(Zarafa.core.mapi.BusyStatus.BUSY),
			busyStatus: Zarafa.core.mapi.BusyStatus.BUSY,
			handler : this.onSetBusyStatus,
			scope: this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'icon_busystatus_outofoffice',
			text : Zarafa.core.mapi.BusyStatus.getDisplayName(Zarafa.core.mapi.BusyStatus.OUTOFOFFICE),
			busyStatus: Zarafa.core.mapi.BusyStatus.OUTOFOFFICE,
			handler : this.onSetBusyStatus,
			scope: this
		}];
	},

	/**
	 * Create the Label context submenu items
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Label context submenu items
	 * @private
	 */
	createLabelItems : function()
	{
		return [{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-none',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.NONE),
			labelValue: Zarafa.core.mapi.AppointmentLabels.NONE,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-important',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.IMPORTANT),
			labelValue: Zarafa.core.mapi.AppointmentLabels.IMPORTANT,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-work',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.WORK),
			labelValue: Zarafa.core.mapi.AppointmentLabels.WORK,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-personal',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.PERSONAL),
			labelValue: Zarafa.core.mapi.AppointmentLabels.PERSONAL,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-holiday',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.HOLIDAY),
			labelValue: Zarafa.core.mapi.AppointmentLabels.HOLIDAY,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-required',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.REQUIRED),
			labelValue: Zarafa.core.mapi.AppointmentLabels.REQUIRED,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			 iconCls : 'zarafa-calendar-appointment-label-travel-required',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.TRAVEL_REQUIRED),
			labelValue: Zarafa.core.mapi.AppointmentLabels.TRAVEL_REQUIRED,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-prepare-required',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.PREPARE_REQUIRED),
			labelValue: Zarafa.core.mapi.AppointmentLabels.PREPARE_REQUIRED,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-birthday',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.BIRTHDAY),
			labelValue: Zarafa.core.mapi.AppointmentLabels.BIRTHDAY,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-special-date',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.SPECIAL_DATE),
			labelValue: Zarafa.core.mapi.AppointmentLabels.SPECIAL_DATE,
			handler : this.onSetLabel,
			scope : this
		},{
			xtype : 'zarafa.conditionalitem',
			iconCls : 'zarafa-calendar-appointment-label-phone-interview',
			text : Zarafa.core.mapi.AppointmentLabels.getDisplayName(Zarafa.core.mapi.AppointmentLabels.PHONE_INTERVIEW),
			labelValue: Zarafa.core.mapi.AppointmentLabels.PHONE_INTERVIEW,
			handler : this.onSetLabel,
			scope : this
		}];
	},

	/**
	 * Makes the given menuitem invisible when any of the records is not a phantom record.
	 * @param {Zarafa.core.ui.menu.MenuItem} item The item which is being tested
	 * @param {Zarafa.core.data.MAPIRecord[]} records The records on which this context
	 * menu is operating.
	 * @private
	 */
	beforeShowPhantom : function(item, records)
	{
		var hasNonPhantoms = false;
		for (var i = 0, len = records.length; i < len; i++) {
			if (records[i].phantom === false) {
				hasNonPhantoms = true;
			}
		}
		item.setVisible(!hasNonPhantoms);
	},

	/**
	 * Makes the given menuitem invisible when any of the records is a phantom record.
	 * @param {Zarafa.core.ui.menu.MenuItem} item The item which is being tested
	 * @param {Zarafa.core.data.MAPIRecord[]} records The records on which this context
	 * menu is operating.
	 * @private
	 */
	beforeShowNonPhantom : function(item, records)
	{
		var hasPhantoms = false;
		for (var i = 0, len = records.length; i < len; i++) {
			if (records[i].phantom === true) {
				hasPhantoms = true;
			}
		}
		item.setVisible(!hasPhantoms);
	},

	/**
	 * Open the categories dialog for all selected records
	 * @param {Zarafa.core.ui.menu.ConditionalItem} button The selected menuitem
	 */
	onCategories : function(button)
	{
		Zarafa.common.Actions.openCategoriesContent(this.records);
	},

	/**
	 * Set the busy state for all selected records
	 * @param {Zarafa.core.ui.menu.ConditionalItem} button The selected menuitem
	 */
	onSetBusyStatus : function(button)
	{
		var store = undefined;
		var records = this.records;

		Ext.each(records, function(record) {
			store = record.getStore();
			record.set('busystatus', button.busyStatus);
		}, this);

		store.save(records);
	},

	/**
	 * Set the label for all selected records
	 * @param {Zarafa.core.ui.menu.ConditionalItem} button The selected menuitem
	 */
	onSetLabel : function(button)
	{
		var store = undefined;
		var records = this.records;

		Ext.each(this.records, function(record) {
			store = record.getStore();
			record.set('label', button.labelValue);
		}, this);

		store.save(records);
	},

	/**
	 * Open the selected record
	 * @param {Zarafa.core.ui.menu.ConditionalItem} button The selected menuitem
	 */
	onOpen : function(open)
	{
		Zarafa.calendar.Actions.openAppointmentContent(this.records);
	},

	/**
	 * Delete all selected records
	 * @param {Zarafa.core.ui.menu.ConditionalItem} button The selected menuitem
	 */
	onDelete : function(button)
	{
		Zarafa.common.Actions.deleteRecords(this.records);
	},

	/**
	 * Create a new appointment / meeting request
	 * @param {Zarafa.core.ui.menu.ConditionalItem} button The selected menuitem
	 */
	onCreate : function(button)
	{
		if (button.meetingRequest) {
			for (var i = 0, len = this.records.length; i < len; i++) {
				var record = this.records[i];

				// Change meeting status only if it is not a meeting, otherwise leave as it is (in order not to overwrite old meeting status)
				if (record.get('meeting') === Zarafa.core.mapi.MeetingStatus.NONMEETING) {
					record.convertToMeeting();
				}
			}
			Zarafa.calendar.Actions.openMeetingRequestContent(this.records);
		} else {
			Zarafa.calendar.Actions.openAppointmentContent(this.records);
		}
	}
});

Ext.reg('zarafa.calendarcontextmenu', Zarafa.calendar.ui.CalendarContextMenu);
