Class('CalendarPanel', {

	view : Property('CalendarMultiView', false),
	
}, 'Ext.Panel');

Class('CalendarMultiView', {
	
	timeStrips : Property('TimeStripView[]', false),
	calendars : Property('AbstractCalendarView[]', false),
	
	addTimeStrip : Method('void', [ Argument('name', 'String'), Argument( 'timeDifference', 'Number') ], true)

}, 'Zarafa.core.ui.View');

Class('AbstractCalendarView', {

	appointments : Property('AppointmentView[]', false)

}, 'Zarafa.core.ui.View');

Class('AppointmentView', {

}, 'Zarafa.core.ui.View');

Class('TimeStripView', {

}, 'Zarafa.core.ui.View');

Class('CalendarDaysView', {

}, 'AbstractCalendarView');

Class('CalendarWeekView', {

	headerDragDrop : Property('CalendarWeekViewDragDrop', false),
	bodyDragDrop : Property('CalendarWeekViewDragDrop', false)

}, 'AbstractCalendarView');

Class('CalendarWeekViewDragDrop', {

}, 'Ext.dd.DragDrop');

Class('CalendarMonthView', {

}, 'AbstractCalendarView');

dump();
