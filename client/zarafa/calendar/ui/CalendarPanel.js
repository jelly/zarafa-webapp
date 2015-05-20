Ext.namespace('Zarafa.calendar.ui');

/**
 * @class Zarafa.calendar.ui.CalendarPanel
 * @extends Ext.Panel
 * @xtype zarafa.calendarpanel
 */
Zarafa.calendar.ui.CalendarPanel = Ext.extend(Ext.Panel, {
	/**
	 * @cfg {Zarafa.calendar.CalendarContext} context The context to which this panel belongs
	 */
	context : undefined,

	/**
	 * The {@link Zarafa.calendar.CalendarContextModel} which is obtained from
	 * the {@link #context}.
	 *
	 * @property
	 * @type Zarafa.calendar.CalendarContextModel
	 */
	model : undefined,

	/**
	 * The store which is attached to this Calendar. This reference is obtained
	 * from the {@link #context}.
	 *
	 * @property
	 * @type Zarafa.core.data.IPMStore
	 */
	store : undefined,

	/**
	 * @cfg {String} loadMaskText text shown when the panel is loading data from the store.
	 */
	loadMaskText : _('Loading') + '...',

	/**
	 * The selection model which manages the selection of {@link Zarafa.core.data.IPMRecord appointments}
	 * inside this calendar.
	 *
	 * @property
	 * @type Zarafa.calendar.ui.AppointmentSelectionModel
	 */
	selectionModel : undefined,

	/**
	 * The selection model which manages the selection of a {@link Zarafa.core.DateRange daterange}
	 * inside the calendar.
	 *
	 * @property
	 * @type Zarafa.calendar.ui.DateRangeSelectionModel
	 */
	rangeSelectionModel : undefined,

	/**
	 * @cfg {Object} viewConfig The configuration which must be applied to the {@link Zarafa.calendar.ui.CalendarMultiView}
	 * which belongs to this calendar panel.
	 */
	viewConfig : undefined,

	/**
	 * The {@link Zarafa.calendar.ui.CalendarMultiView calendarMultiView} which is attached to this panel, the creation
	 * of this view can be configured through {@link #viewConfig}.
	 *
	 * @property
	 * @type Zarafa.calendar.ui.CalendarMultiView
	 */
	view : undefined,

	/**
	 * @cfg {Boolean} showTooltip True to show tooltips when the cursor moves over an appointment.
	 */
	showTooltip : true,

	/**
	 * @cfg {String/Ext.XTemplate} tooltipTitleTpl If {@link #showTooltip tooltips are enabled},
	 * this template is used for the title of the tooltip. The data for the template will
	 * be the data object from the {@link Zarafa.calendar.AppointmentRecord appointment}.
	 */
	tooltipTitleTpl : new Ext.XTemplate(
		'<tpl if="!Ext.isEmpty(values.subject)">',
			'{values.subject:htmlEncode}',
		'</tpl>',
		{
			compiled : true
		}
	),

	/**
	 * @cfg {String/Ext.XTemplate} tooltipTextTpl If {@link #showTooltip tooltips are enabled},
	 * this template is used for the main contents of the tooltip. The data for the template will
	 * be the data object from the {@link Zarafa.calendar.AppointmentRecord appointment}.
	 */
	tooltipTextTpl : new Ext.XTemplate(
		'<tpl if="values.meeting !== Zarafa.core.mapi.MeetingStatus.NONMEETING">',
			_('Organizer') + ': {[this.formatOrganizer(values)]}\n',
		'</tpl>',
		'<tpl if="values.alldayevent != true">',
			_('Time') + ': {[this.formatTime(values.startdate, values.duedate)]}\n',
		'</tpl>',
		'<tpl if="values.alldayevent == true">',
			_('Date') + ': {[this.formatDate(values.startdate, values.duedate)]}\n',
		'</tpl>',
		'<tpl if="!Ext.isEmpty(values.location)">',
			_('Location') + ': {values.location:htmlEncode}\n',
		'</tpl>',
		'<tpl if="!Ext.isEmpty(values.recurring_pattern)">',
			_('Recurrence') + ': {values.recurring_pattern:htmlEncode}\n',
		'</tpl>',
		{
			compiled : true,
			// Format the organizer of the meeting
			formatOrganizer : function(values)
			{
				var value = values.sent_representing_name;
				if (Ext.isEmpty(value)) {
					value = values.sender_name;
				}

				return Ext.util.Format.htmlEncode(value);
			},
			// Format the times for a normal appointment.
			formatTime : function(start, due)
			{
				if (start.clearTime(true).getTime() == due.clearTime(true).getTime()) {
					// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
					return start.format(_('G:i')) + ' - ' + due.format(_('G:i'));
				} else {
					// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
					return start.format(_('jS F G:i')) + ' - ' + due.format(_('jS F G:i'));
				}
			},
			// Format the dates for an allday appointment, this requires the duedate
			// to be reduced by one day, and doesn't print times.
			formatDate : function(start, due)
			{
				due = due.add(Date.HOUR, -1);
				if (Date.diff(Date.DAY, due, start) <= 1) {
					// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
					return start.format(_('jS F Y'));
				} else {
					// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
					return start.format(_('jS F Y')) + ' - ' + due.format(_('jS F Y'));
				}
			}
		}
	),

	/**
	 * @constructor
	 * @param {Object} config configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.apply(this, config, {
			xtype: 'zarafa.calendarpanel',
			border : false
		});

		// Declare events.
		this.addEvents(
			/**
			 * @event beforeappointmentcalendardrop
			 * Fires when an appointment is dragged from this calendar component onto another.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was dropped
			 * @param {Zarafa.calendar.core.MAPIFolder} sourceFolder source folder
			 * @param {Zarafa.calendar.core.MAPIFolder} targetFolder target folder
			 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
			 * @return {Boolean} False to cancel the event
			 */
			'beforeappointmentcalendardrop',
			/**
			 * @event appointmentcalendardrop
			 * Fires when an appointment is dragged from this calendar component onto another.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was dropped
			 * @param {Zarafa.calendar.core.MAPIFolder} sourceFolder source folder
			 * @param {Zarafa.calendar.core.MAPIFolder} targetFolder target folder
			 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
			 */
			'appointmentcalendardrop',
			/**
			 * @event appointmentmouseover
			 * Fires when the mouse is being mover over an appointment.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} record The appointment over which the mouse is moving
			 * @param {Ext.EventObject} event The original event object
			 */
			'appointmentmouseover',
			/**
			 * @event appointmentmouseover
			 * Fires when the mouse is being mover away from an appointment.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} record The appointment over which the mouse has moved out
			 * @param {Ext.EventObject} event The original event object
			 */
			'appointmentmouseout',
			/**
			 * @event beforeappointmentmove
			 * Fires before an appointment is moved.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was moved
			 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
			 * @return {Boolean} False to cancel the event
			 */
			'beforeappointmentmove',
			/**
			 * @event beforeappointmentresize
			 * Fires before an appointment is resized. Resizing in this context means that either the start
			 * date or the due date has been changed.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was resized
			 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
			 * @return {Boolean} False to cancel the event
			 */
			'beforeappointmentresize',
			/**
			 * @event beforeappointmentcreate
			 * Fires before a new appointment is created.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.hierarchy.data.MAPIFolderRecord} folder MAPI folder the appointment should be created in.
			 * @param {Zarafa.core.DateRange} dateRange Appointment date range.
			 * @param {String} text Appointment text
			 * @return {Boolean} False to cancel the event
			 */
			'beforeappointmentcreate',
			/**
			 * @event appointmentmove
			 * Fires when an appointment has been moved.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was moved
			 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
			 */
			'appointmentmove',
			/**
			 * @event appointmentresize
			 * Fires when an appointment has been resized. Resizing in this context means that either the start
			 * date or the due date has been changed.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was resized
			 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
			 */
			'appointmentresize',
			/**
			 * @event appointmentcreate
			 * Fires after a new appointment has been created.
			 * @param {Zarafa.calendar.ui.CalendarPanel} calendar The calendar which fired the event
			 * @param {Zarafa.hierarchy.data.MAPIFolderRecord} folder MAPI folder the appointment should be created in.
			 * @param {Zarafa.core.data.IPMRecord} record Created appointment record.
			 */
			'appointmentcreate',
			/**
			 * @event contextmenu
			 * Fires when the user right-clicks on the calendar body or on an appointment.
			 * @param {Ext.EventObject} event right-click event.
			 * @param {Ext.data.Record} record (optional) if the user right-clicked on an appointment
			 * this will contain the appointment record, undefined otherwise
			 */
			'contextmenu',
			/**
			 * @event dblclick
			 * Fires when the user double-clicks on on an appointment.
			 * @param {Ext.EventObject} event right-click event.
			 * @param {Ext.data.Record} record appointment record.
			 */
			'dblclick',
			/**
			 * @event dayclick
			 * Fires when a user clicks on the header of a day, or on the expand button in the box view.
			 * @param {Zarafa.core.ui.View} source event source
			 * @param {Date} date date of the day.
			 */
			'dayclick',
			/**
			 * @event calendarclose
			 * Fires when the user closes a calendar using the close icon in the calendar tabs.
			 * @param {string} folderid MAPI folder id.
			 */
			'calendarclose'
		);

		Zarafa.calendar.ui.CalendarPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Initialises the component.
	 * @private
	 */
	initComponent : function()
	{
		Zarafa.calendar.ui.CalendarPanel.superclass.initComponent.apply(this, arguments);

		if (!Ext.isDefined(this.model) && Ext.isDefined(this.context)) {
			this.model = this.context.getModel();
		}

		if (!Ext.isDefined(this.store) && Ext.isDefined(this.model)) {
			this.store = this.model.getStore();
		}

		// If no appointment selection model was provided, create a new one.
		if (!Ext.isDefined(this.selectionModel)) {
			// Register remove event on store so that when some record is removed from
			// the store we remove it from the selection as well
			if(this.store){
				this.mon(this.store, 'remove', this.onStoreRemove, this);
			}

			this.selectionModel = new Zarafa.calendar.ui.AppointmentSelectionModel();
		}

		// If no range selection model was provided, create a new one.
		if (!Ext.isDefined(this.rangeSelectionModel)) {
			this.rangeSelectionModel = new Zarafa.calendar.ui.DateRangeSelectionModel();
		}

		// Create a new multi view. The multi view allows multiple calendars to be on screen
		// side-by-side.
		this.viewConfig = this.viewConfig || {};
		Ext.apply(this.viewConfig, {
			context : this.context,
			selectionModel : this.selectionModel,
			rangeSelectionModel : this.rangeSelectionModel
		});
		this.view = new Zarafa.calendar.ui.CalendarMultiView(this.viewConfig);

		// Hook into events of the view.
		this.mon(this.view, {
			'appointmentcalendardrop': this.onAppointmentCalendarDrop,
			'appointmentmouseover': this.onAppointmentMouseOver,
			'appointmentmouseout': this.onAppointmentMouseOut,
			'appointmentmove': this.onAppointmentMove,
			'appointmentresize': this.onAppointmentResize,
			'appointmentcreate': this.onAppointmentCreate,
			'appointmentinitdrag': this.onAppointmentInitDrag,
			'appointmentenddrag': this.onAppointmentEndDrag,
			'contextmenu': this.onViewContextMenu,
			'dblclick': this.onDoubleClick,
			'dayclick': this.onDayClick,
			'calendarclose': this.onCalendarClose,
			scope: this
		});

		// If a store was provided, bind it.
		if (this.store)
			this.bindStore(this.store);

	},

	/**
	 * Function is called when record is removed from the store. It will remove
	 * record from {@link #selectionModel} which are removed from the store.
	 *
	 * @param {Zarafa.calendar.AppointmentStore} store
	 * @param {Ext.data.Record} record The Record that was removed
	 * @param {Number} index The index at which the record was removed
	 *
	 * @private
	 */
	onStoreRemove : function(store, record, index){
		this.selectionModel.deselectRecord(record);
	},

	/**
	 * Relays the 'contextmenu' event.
	 * @param {Object} event The event object
	 * @param {Zarafa.core.data.IPMRecord} record The record on which the context menu was requested
	 * @private
	 */
	onViewContextMenu : function(event, record)
	{
		this.fireEvent('contextmenu', event, record);
		event.stopEvent();
	},

	/**
	 * Relays the 'dblclick' event.
	 * @param {Object} event The event object
	 * @param {Zarafa.core.data.IPMRecord} record The record on which was double clicked
	 * @private
	 */
	onDoubleClick : function(event, record)
	{
		this.fireEvent('dblclick', event, record);
	},

	/**
	 * Relays the 'dayclick' event.
	 * @param {Zarafa.calendar.ui.AbstractCalendarView} source Source calendar view.
	 * @param {Date} date The date on which was clicked
	 * @private
	 */
	onDayClick : function(source, date)
	{
		this.fireEvent('dayclick', source, date);
	},

	/**
	 * Relays the 'calendarclose' event.
	 * @param {Zarafa.core.IPMFolder} folder The folder which was closed
	 * @private
	 */
	onCalendarClose : function(folder)
	{
		this.fireEvent('calendarclose', folder);
	},

	/**
	 * Relays the 'appointmentcalendardrop' event.
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was dragged
	 * @param {Zarafa.calendar.core.MAPIFolder} sourceFolder source folder
	 * @param {Zarafa.calendar.core.MAPIFolder} targetFolder target folder
	 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
	 * @param {Ext.EventObject} event The original event object
	 * @private
	 */
	onAppointmentCalendarDrop : function(multiview, appointment, sourceFolder, targetFolder, dateRange, event)
	{
		if (this.fireEvent('beforeappointmentcalendardrop', this, appointment, sourceFolder, targetFolder, dateRange) !== false) {
			// Move the selected record to the new folder.
			// FIXME: We receive a dateRange, we should apply it to the target record
			// so we can actually drop the copy into a specific location of the target folder
			if (event.ctrlKey) {
				appointment.copyTo(targetFolder);
			} else {
				appointment.moveTo(targetFolder);
			}
			appointment.save();

			this.fireEvent('appointmentcalendardrop', this, appointment, sourceFolder, targetFolder, dateRange);
		}
	},

	/**
	 * Forwards the 'appointmentmouseover' event to the parent calendar panel
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Zarafa.calendar.AppointmentRecord} record The appointment over which the mouse is moving
	 * @param {Ext.EventObject} event The original event object
	 * @private
	 */
	onAppointmentMouseOver : function(multiview, appointment, event)
	{
		if (this.showTooltip === true) {
			var tooltip = this.view.getTooltipInstance();
			if (tooltip) {
				var id = appointment.store.data.getKey(appointment);
				var title = this.tooltipTitleTpl.apply(appointment.data);
				var text = this.tooltipTextTpl.apply(appointment.data);

				// As component ID we use the RecordKey, use the MixedCollection#getKey,
				// as that will generate a fully unique ID in case of recurring series.
				tooltip.show(id, { title : title, text: text }, event);
			}
		}

		this.fireEvent('appointmentmouseover', this, appointment, event);
	},

	/**
	 * Forwards the 'appointmentmouseout' event to the parent calendar panel
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Zarafa.calendar.AppointmentRecord} record The appointment over which the mouse has moved out
	 * @param {Ext.EventObject} event The original event object
	 * @private
	 */
	onAppointmentMouseOut : function(multiview, appointment, event)
	{
		if (this.showTooltip === true) {
			var tooltip = this.view.getTooltipInstance();
			if (tooltip) {
				tooltip.hide(event);
			}
		}

		this.fireEvent('appointmentmouseout', this, appointment, event);
	},

	/**
	 * Event handler which is fired when the {@link Zarafa.calendar.ui.CalendarMultiView#appointmentmove appointmentmove}
	 * event has been fired on the {@link #view}. This will update the start/due date of the given {@link Zarafa.core.data.IPMRecord appointment},
	 * and fire the {@link #beforeappointmentmove} and {@link #appointmentmove} events.
	 *
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was moved
	 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
	 * @param {Ext.EventObject} event The original event object
	 * @private
	 */
	onAppointmentMove : function(multiview, appointment, dateRange, event)
	{
		if (appointment.isMeetingSent() && !appointment.isAppointmentInPast() && appointment.getMessageAction('send') !== true) {
			this.doAppointmentChangeConfirmation(appointment, dateRange, this.doAppointmentMove);
		} else {
			this.doAppointmentMove(appointment, dateRange);
		}
	},

	/**
	 * This will update the given record with the new startDate object.
	 * This is called by {@link #onAppointmenMove}.
	 * @param {Zarafa.calendar.AppointmentRecord} appointment The appointment which was changed
	 * @param {Zarafa.core.DateRange} dateRange The new daterange for the appointment
	 * @private
	 */
	doAppointmentMove : function(appointment, dateRange)
	{
		if (this.fireEvent('beforeappointmentmove', this, appointment, dateRange) !== false) {
			this.doAppointmentChange(appointment, dateRange);

			if (appointment.isMeetingSent() && !appointment.isAppointmentInPast()) {
				appointment.addMessageAction('send', true);
			}

			appointment.save();
			this.fireEvent('appointmentmove', this, appointment, dateRange);
		}
	},

	/**
	 * Event handler which is fired when the {@link Zarafa.calendar.ui.CalendarMultiView#appointmentresize appointmentresize}
	 * event has been fired on the {@link #view}. This will update the start/due date of the given {@link Zarafa.core.data.IPMRecord appointment},
	 * and fire the {@link #beforeappointmentresize} and {@link #beforeappointmentresize} events.
	 *
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Zarafa.calendar.AppointmentRecord} appointment the appointment record that was resized
	 * @param {Zarafa.core.DateRange} dateRange The dateRange which must be applied to the appointment
	 * @param {Ext.EventObject} event The original event object
	 * @private
	 */
	onAppointmentResize : function(multiview, appointment, dateRange, event)
	{
		if (appointment.isMeetingSent() && !appointment.isAppointmentInPast() && appointment.getMessageAction('send') !== true) {
			this.doAppointmentChangeConfirmation(appointment, dateRange, this.doAppointmentResize);
		} else {
			this.doAppointmentResize(appointment, dateRange);
		}
	},

	/**
	 * This will update the given record with the new {@link Zarafa.core.DateRange dateRange} object.
	 * This is called by {@link #onAppointmentResize}.
	 * @param {Zarafa.calendar.AppointmentRecord} appointment The appointment which was changed
	 * @param {Zarafa.core.DateRange} dateRange The DateRange used to update the record
	 * @private
	 */
	doAppointmentResize : function(appointment, dateRange)
	{
		if (this.fireEvent('beforeappointmentresize', this, appointment, dateRange) !== false) {
			this.doAppointmentChange(appointment, dateRange);

			if (appointment.isMeetingSent() && !appointment.isAppointmentInPast()) {
				appointment.addMessageAction('send', true);
			}

			appointment.save();
			this.fireEvent('appointmentresize', this, appointment, dateRange);
		}
	},

	/**
	 * Called when the time for a meeting has been changed by the user, by a drag & drop action,
	 * e.g. resizing or moving. This will ask the user if he wants to open the given meeting
	 * in a new {@link Zarafa.core.ui.ContentPanel ContentPanel} where he can modify his changes,
	 * or if he wants to directly send an update the attendees.
	 * @param {Zarafa.calendar.AppointmentRecord} appointment The appointment which was changed
	 * @param {Zarafa.core.DateRange} dateRange The daterange indicating the new time/duration
	 * @param {Function} changeCallback The callback function which should be called if the
	 * user wants to change the meeting immediately without a ContentPanel
	 * @private
	 */
	doAppointmentChangeConfirmation : function(appointment, dateRange, changeCallback)
	{
		Zarafa.common.dialogs.MessageBox.select(
			_('Zarafa WebApp'),
			_('The time of the meeting has changed. Choose one of the following:'),
			function(button, select) {
				if (button == 'ok') {
					if (select.id == 'review_changes') {
						// The user has selected the option to review the changes in a ContentPanel.
						var tasks = [];
						tasks.push({
							fn : function(panel, contentRecord, task, callback) {
								var newDateRange = dateRange.clone();
								if (!contentRecord.isOpened()) {
									var fn = function(store, recordFromStore) {
										if (recordFromStore === contentRecord) {
											store.un('open', fn, task);
											this.doAppointmentChange(contentRecord, newDateRange);
											callback();
										}
									};

									// We defer the callback function by 1 ms, to get out of the
									// 'write' event loop which indicates that the data from the
									// server was obtained. During that loop all other stores
									// will be modified as well, and we don't want our changes
									// to be applied to any other store then the current.
									contentRecord.getStore().on('open', fn, this, { delay : 1 });
								} else {
									this.doAppointmentChange(contentRecord, newDateRange);
									callback();
								}
							},
							scope : this
						});
						var config = {
							recordComponentPluginConfig : {
								loadTasks : tasks
							}
						};
						Zarafa.calendar.Actions.openMeetingRequestContent(appointment, config);
					} else {
						// The user wants to directly save the changes
						changeCallback.call(this, appointment, dateRange);
					}
				}
			},
			this,
			[{
				boxLabel: _('Save changes and send an update to all recipients'),
				id : 'send_update',
				name: 'select',
				checked: true
			},{
				boxLabel: _('Open meeting request with changes'),
				id : 'review_changes',
				name: 'select'
			}]
		);
	},

	/**
	 * This will update the given record with the new {@link Zarafa.core.DateRange dateRange} object.
	 * @param {Zarafa.core.data.IPMRecord} record The record which must be updated
	 * @param {Zarafa.core.DateRange} dateRange The DateRange used to update the record
	 * @private
	 */
	doAppointmentChange : function(record, dateRange)
	{
		record.beginEdit();

		var startDate = dateRange.getStartDate();
		var dueDate = dateRange.getDueDate();

		record.set('alldayevent', dateRange.isAllDay());
		record.set('startdate', startDate, true);	// Force the change to PHP
		record.set('duedate', dueDate, true);		// Force the change to PHP
		record.set('commonstart', startDate);
		record.set('commonend', dueDate);

		// Appointment durations are stored in minutes.
		record.set('duration', dateRange.getDuration(Date.MINUTE));

		// update reminder times aswell
		if (record.get('reminder') === true) {
			record.set('reminder_time', startDate);
			record.set('flagdueby', startDate.add(Date.MINUTE, -record.get('reminder_minutes')));
		}

		// set delegate properties if needed
		if(!record.userIsStoreOwner()) {
			var storeRecord = container.getHierarchyStore().getById(record.get('store_entryid'));
			if(storeRecord) {
				record.setDelegatorInfo(storeRecord, true);
			}
		}

		record.endEdit();
	},

	/**
	 * Event handler which is fired when the {@link Zarafa.calendar.ui.CalendarMultiView#appointmentcreate appointmentcreate}
	 * event has been fired on the {@link #view}. This will update the start/due date of the given {@link Zarafa.core.data.IPMRecord appointment},
	 * and fire the {@link #beforeappointmentcreate} and {@link #beforeappointmentcreate} events.
	 *
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Zarafa.core.IPMFolder} folder The folder in which the appointment must be created
	 * @param {Zarafa.core.DateRange} dateRange The dateRange which must be applied to the appointment
	 * @param {String} text The subject for the new appointment
	 * @private
	 */
	onAppointmentCreate : function(multiview, folder, dateRange, text)
	{
		if (this.fireEvent('beforeappointmentcreate', this, folder, dateRange, text) !== false) {
			var record = this.model.createRecord(folder, dateRange);

			record.set('subject', text);

			this.store.add(record);
			record.save();

			this.fireEvent('appointmentcreate', this, folder, record);
		}
	},

	/**
	 * Event handler for the {@link Zarafa.calendar.ui.CalendarMultiView#appointmentinitdrag} event
	 * This is initiated from {@link Zarafa.calendar.ui.CalendarViewDragZone} and passed through
	 * the {@link Zarafa.calendar.ui.AbstractCalendarDaysView individual calendar} and the {@link Zarafa.calendar.ui.CalendarMultiView mutliview}
	 *
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Ext.EventObject} event The mouse event
	 * @param {Zarafa.calendar.ui.AppointmentView} The appointment on which the event occurred
	 */
	onAppointmentInitDrag : function(multiview, event, appointment)
	{
		if (this.showTooltip === true) {
			var tooltip = multiview.getTooltipInstance();
			if (tooltip) {
				tooltip.hide();
			}
		}
	},

	/**
	 * Event handler for the {@link Zarafa.calendar.ui.CalendarMultiView#appointmentenddrag} event
	 * This is initiated from {@link Zarafa.calendar.ui.CalendarViewDragZone} and passed through
	 * the {@link Zarafa.calendar.ui.AbstractCalendarDaysView individual calendar} and the {@link Zarafa.calendar.ui.CalendarMultiView mutliview}
	 *
	 * @param {Zarafa.calendar.ui.CalendarMultiView} multiview The Calendar MultiView which fired the event
	 * @param {Ext.EventObject} event The mouse event
	 * @param {Zarafa.calendar.ui.AppointmentView} The appointment on which the event occurred
	 */
	onAppointmentEndDrag : Ext.emptyFn,

	/**
	 * Called when the component is rendered.
	 * @param {Ext.Element} container The container in which the panel is being rendered
	 * @private
	 */
	onRender : function(container)
	{
		// Parent render.
		Zarafa.calendar.ui.CalendarPanel.superclass.onRender.apply(this, arguments);

		// Initialise and render the view.
		this.view.render(this.body);
	},

	/**
	 * Event handler which is fired when the panel has been resized.
	 * @private
	 */
	onResize : function()
	{
		Zarafa.calendar.ui.CalendarPanel.superclass.onResize.apply(this, arguments);

		if (this.rendered)
			this.view.layout();
	},

	/**
	 * Event handler which is fired when the panel has been rendered
	 * @private
	 */
	afterRender : function()
	{
		Zarafa.calendar.ui.CalendarPanel.superclass.afterRender.apply(this, arguments);
		this.loadMask = new Zarafa.common.ui.LoadMask(this.body, {msg: this.loadMaskText});
		this.view.layout();

		Zarafa.core.KeyMapMgr.activate(this, 'view.mapimessage');
	},

	/**
	 * Returns the calendar's CalendarView object.
	 * @return {Zarafa.calendar.ui.CalendarMultiView} The calendar view
	 */
	getView : function()
	{
		return this.view;
	},

	/**
	 * Gets the calendar's selection model. This can be used to listen for selection and de-selection of appointments,
	 * and to get a list of currently selected appointments.
	 * @return {Zarafa.calendar.ui.AppointmentSelectionModel} the calendar's selection model.
	 */
	getSelectionModel : function()
	{
		return this.selectionModel;
	},

	/**
	 * Gets the range selection model. Can be used to listen for selection and de-selection of date ranges in the calendar,
	 * and to get the currently selected range.
	 * @return {Zarafa.calendar.ui.DateRangeSelectionModel} date range selection model.
	 */
	getRangeSelectionModel : function()
	{
		return this.rangeSelectionModel;
	},

	/**
	 * Bind the given store to this view. This will add listeners for the
	 * {@link Ext.data.Store#beforeload}, {@link Ext.data.Store#load} and {@link Ext.data.Store#exception} events.
	 * @param {Zarafa.core.data.IPMStore} store The store to bind
	 */
	bindStore : function(store)
	{
		this.store = store;

		if (Ext.isDefined(store)) {
			this.mon(store, {
				'beforeload': this.onBeforeLoad,
				'load': this.onLoad,
				'exception': this.onLoadException,
				'notify': this.onStoreNotify,
				scope: this
			});
		}

		this.view.bindStore(store);
	},

	/**
	 * Release a store previously bound using {@link #bindStore}, this will
	 * unhook all event listeners.
	 * @param {Zarafa.core.data.IPMStore} store The store to release
	 */
	releaseStore : function(store)
	{
		if (!Ext.isDefined(store)) {
			this.mun(store, {
				'beforeload': this.onBeforeLoad,
				'load': this.onLoad,
				'exception': this.onLoadException,
				'notify': this.onStoreNotify,
				scope: this
			});
		}

		this.view.releaseStore(store);
		this.store = undefined;
	},

	/**
	 * Event handler which is fired before the {@link #store} begins loading new
	 * data from the server.
	 * @private
	 */
	onBeforeLoad : function()
	{
		if (this.loadMask)
			this.loadMask.show();
	},

	/**
	 * Event handler which is fired after the {@link #store} has loaded new
	 * data from the server.
	 * @private
	 */
	onLoad : function()
	{
		if (this.loadMask)
			this.loadMask.hide();
	},

	/**
	 * Event handler which is fired after the {@link #store} has encountered
	 * an exception while loading data from the server.
	 * @private
	 */
	onLoadException : function()
	{
		if (this.loadMask)
			this.loadMask.hide();
	},

	/**
	 * Event handler which is fired when the {@link #store} fires the
	 * {@link Zarafa.core.data.IPMStore#notify 'notify'} event. If this
	 * is a {@link Zarafa.core.data.Notifications#objectCreated objectCreated}
	 * notification, this will {@link Zarafa.calendar.ui.DateRangeSelectionModel#clearSelections clear}
	 * the {@link #rangeSelectionModel}.
	 * @param {Zarafa.core.data.IPMStore} store The store which fired the event
	 * @param {Zarafa.core.data.Notifications} notification The notification action
	 * @param {Ext.data.Record/Array} records The record or records which have been affected by the notification.
	 * @param {Object} data The data which has been recieved from the PHP-side which must be applied
	 * to the given records.
	 * @param {Number} timestamp The {@link Date#getTime timestamp} on which the notification was received
	 * @param {Boolean} success The success status, True if the notification was successfully recieved.
	 * @private
	 */
	onStoreNotify : function(store, action, records, data, timestamp, success)
	{
		var selectionModel = this.getRangeSelectionModel();

		if (!Ext.isEmpty(records) && selectionModel.isActive() && action === Zarafa.core.data.Notifications.objectCreated) {
			var selection = selectionModel.getDateRange();
			var record = records[0];

			// Check if the current selection matches the new record
			if (selection.getStartTime() === record.get('startdate').getTime() && selection.getDueTime() === record.get('duedate').getTime()) {
				selectionModel.clearSelections();
			}
		}
	},

	/**
	 * Called when the calendar is being destroyed, this will also
	 * destroy the {@link #view}.
	 */
	destroy : function()
	{
		this.view.destroy();
		// super class destroy
		Zarafa.calendar.ui.CalendarPanel.superclass.destroy.apply(this, arguments);
	}
});

Ext.reg('zarafa.calendarpanel', Zarafa.calendar.ui.CalendarPanel);
