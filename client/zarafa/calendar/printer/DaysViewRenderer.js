// -*- coding: utf-8; indent-tabs-mode: nil -*-
Ext.namespace('Zarafa.calendar.printer');

/**
 * @class Zarafa.calendar.printer.DaysViewRenderer
 * @extends Zarafa.common.printer.renderers.BaseRenderer
 *
 * Baseclass to be used to print calendar appointments.
 */
Zarafa.calendar.printer.DaysViewRenderer = Ext.extend(Zarafa.common.printer.renderers.BaseRenderer, {
	/**
	 * @property customStylesheetPath
	 * @type Array of Strings
	 * The paths at which the print stylesheets can be found for a specific renderer
	 */
	customStylesheetPath: 'client/resources/css-extern/print.calendar.css',

	/**
	 * @cfg {String} timeStyle The style attribute which must be applied to  the
	 * &lt;td&gt; element containing the timestamp for the appointment
	 */
	timeStyle : '',

	/**
	 * Prepares data suitable for use in an XTemplate from the component 
	 * @param {Ext.Component} component The component to acquire data from
	 * @return {Array} An empty array (override this to prepare your own data)
	 */
	prepareData: function(context)
	{
		var data = Zarafa.calendar.printer.DaysViewRenderer.superclass.prepareData.apply(this, arguments);
		var model = context.getModel();
		var daterange = model.dateRange;
		var numDays = daterange.getDuration(Date.DAY);

		var startDate = daterange.getStartDate().clone();
		var dueDate = daterange.getDueDate().clone();

		// Set the startDate to 12:00 to be able to call Date.add(Date.DAY, ..)
		// safely for DST switches at 00:00 in Brasil.
		startDate.setHours(12);
		dueDate.setHours(12);

		// Obtain the daterange information, substract 1 day from duedate
		// as it is set to 00:00 of the day _after_ the duedate.
		data['currenttime'] = new Date();
		data['startdate'] = startDate.clearTime();
		data['duedate'] = dueDate.add(Date.DAY, -1).clearTime();

		for (var i = 0, len = numDays; i < len; i++) {
			var key = 'date' + (i + 1);
			data[key] = startDate.add(Date.DAY, i).clearTime();
			data[key + '_table_data'] = '';
		}

		var items = model.getStore().getRange();
		var offset = startDate.getDay();
		for (var i = 0, len = items.length; i < len; i++) {
			var start = items[i].get('commonstart');
			var end = items[i].get('commonend');
			if (!Ext.isDate(start) || !Ext.isDate(end)) {
				continue;
			}

			// Check if the appointment fits into the range,
			// if it doesn't bind the limits to the printed range.
			var showStart = start;
			if (start < startDate) {
				showStart = startDate.clone();
			}
			var showEnd = end;
			if (end > dueDate) {
				showEnd = dueDate.clone();
			}

			var subject = items[i].get('subject');
			if (!Ext.isString(subject)) {
				subject = '';
			}

			var timeformat;
			var showDate = start.getDayOfYear() !== end.getDayOfYear() || start.getYear() !== end.getYear();
			if (showDate) {
				// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
				timeformat = _('jS F Y G:i');
			} else {
				// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
				timeformat = _('G:i');
			}

			var showDays = Math.floor(Date.diff(Date.DAY, showEnd, showStart));
			var allday = items[i].get('alldayevent');
			if (allday) {
				// allday events end on midnight the next day, so deduct
				// one, since we only deal in days here.
				if (showEnd === end) {
					showDays--;
				}
			}

			var append = '<tr class="calendar-'+ (allday ? 'allday' : 'normal') + '">';
			if (!allday) {
				append += '<td class="nowrap" style="' + this.timeStyle + '">'
					+ start.format(timeformat) + ' - ' + (showDate ? '<br>' : '')
					+ end.format(timeformat) + '</td>';
			}
			append += '<td class="calendar-item" colspan='+ (allday ? '2' : '1') +'>'
				+ Ext.util.Format.htmlEncode(subject) + '</td></tr>';

			var startday = showStart.getDay();
            if (startday < offset) {
                startday += 7;
            }
            startday -= (offset - 1);
			for (var n = 0; n <= showDays && n < numDays; n++) {
				data['date' + (startday + n) + '_table_data'] += append;
			}
		}
		return data;
	},

	/**
	 * Add additional rendering into the newly created dom tree containing the processed template
	 * 
	 * @param {Document} webappDOM original webapp DOM
	 * @param {Document} printDOM DOM containing processed print template
	 * @param {Zarafa.calendar.CalendarContextModel} context calendar context to render for printing
	 */
	postRender: function(webappDOM, printDOM, context)
	{
		var daterange = context.getModel().dateRange;
		var left = daterange.getStartDate().clone();
		var right = daterange.getDueDate().clone();

		right.setMonth(right.getMonth()+1);

		/*
		 * Particularly in IE, Nodes are not allowed to be inserted into another document
		 * from the one in which they were created.
		 * Actually, Here we are trying to create element in printing document, using our original document which is not possible.
		 * As a solution, we are creating/rendering date picker into the body and than copies the html structure
		 * of date picker into the printing document.
		 */
		if (Ext.isIE11){
			var leftDP = new Ext.DatePicker({
				renderTo: Ext.getBody(),
				hidden : true,
				width : '200px',
				value: left,
				showToday: false
			});

			var rightDP = new Ext.DatePicker({
				renderTo: Ext.getBody(),
				hidden : true,
				width : '200px',
				value: right,
				showToday: false
			});

			printDOM.getElementById('datepicker_left').innerHTML = leftDP.el.dom.innerHTML;
			printDOM.getElementById('datepicker_right').innerHTML = rightDP.el.dom.innerHTML;

			// Destroys date picker component with its element from the DOM.
			leftDP.destroy();
			rightDP.destroy();
		} else {
			var leftDP = new Ext.DatePicker({
				renderTo: printDOM.getElementById('datepicker_left'),
				value: left,
				showToday: false
			});

			var rightDP = new Ext.DatePicker({
				renderTo: printDOM.getElementById('datepicker_right'),
				value: right,
				showToday: false
			});
		}
	}
});
