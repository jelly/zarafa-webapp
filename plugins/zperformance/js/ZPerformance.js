Ext.namespace('Zarafa.plugins.zperformance');

/**
 * @class Zarafa.plugins.zperformance.ZPerformancePlugin
 * @extends Zarafa.core.Plugin
 *
 * Assists in measuing performance
 */
Zarafa.plugins.zperformance.ZPerformancePlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Measure the performance for loading the given store using the given options.
	 * This will make 1 call to the server to ensure caching is enabled, and then load
	 * the store for a limited number of times before printing out the average loading
	 * time.
	 *
	 * @param {Ext.data.Store} store The store to load
	 * @param {Object} options The options to be passed to the {@link Ext.data.Store#load} function
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 * @private
	 */
	measureStore : function(store, options, limit)
	{
		var measurements = [];

		// Create the callback function which will be called when the
		// store has been loaded. This will reduce the limit counter,
		// and either call load() again, or will calculate the average.
		var callback = function(store) {
			if (Ext.isDate(store.startdate)) {
				// Add the new loadtime to the table
				var enddate = new Date();
				measurements.push(enddate.getTime() - store.startdate.getTime());
			}

			if (limit--) {
				// We haven't reached the limit yet, reload the store again.
				store.startdate = new Date();
				store.load(options);
			} else {
				// We have reached the limit, start calculating
				// the average load time.
				var avg = 0;
				for (var i = 0; i < measurements.length; i++) {
					avg += measurements[i];
				}
				console.log((avg / measurements.length) + 'ms');

				// Destroy the store.
				store.un('load', callback);
				store.destroy();
			}
		};

		store.on('load', callback);
		store.load(options);
	},

	/**
	 * Measure the performance of loading the hierarchy
	 * This will load the hierarchy a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureHierarchy : function(limit)
	{
		var store = new Zarafa.hierarchy.data.HierarchyStore({
			standalone : false		
		});

		this.measureStore(store, {
			actionType : Zarafa.core.Actions['list']
		}, limit);
	},

	/**
	 * Measure the performance of loading the calendar folder.
	 * This will load the calendar folder a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureCalendarFolder : function(limit)
	{
		var store = new Zarafa.calendar.AppointmentStore({
			standalone : false		
			});
		var folder = container.getHierarchyStore().getDefaultFolder('calendar');

		this.measureStore(store, {
			folder : [ folder ]
		}, limit);
	},

	/**
	 * Measure the performance of loading the contact folder.
	 * This will load the contact folder a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureContactFolder : function(limit)
	{
		var store = new Zarafa.contact.ContactStore({
			standalone : false		
		});
		var folder = container.getHierarchyStore().getDefaultFolder('contact');

		this.measureStore(store, {
			folder : [ folder ]
		}, limit);
	},

	/**
	 * Measure the performance of loading the inbox folder.
	 * This will load the inbox folder a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureInboxFolder : function(limit)
	{
		var store = new Zarafa.mail.MailStore({
			standalone : false		
		});
		var folder = container.getHierarchyStore().getDefaultFolder('inbox');

		this.measureStore(store, {
			folder : [ folder ]
		}, limit);
	},

	/**
	 * Measure the performance of loading the notes folder.
	 * This will load the notes folder a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureNoteFolder : function(limit)
	{
		var store = new Zarafa.note.NoteStore({
			standalone : false		
		});
		var folder = container.getHierarchyStore().getDefaultFolder('note');

		this.measureStore(store, {
			folder : [ folder ]
		}, limit);
	},

	/**
	 * Measure the performance of loading the task folder.
	 * This will load the task folder a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureTaskFolder : function(limit)
	{
		var store = new Zarafa.task.TaskStore({
			standalone : false		
		});
		var folder = container.getHierarchyStore().getDefaultFolder('task');

		this.measureStore(store, {
			folder : [ folder ]
		}, limit);
	},

	/**
	 * Measure the performance of loading the addressbook.
	 * This will load the Global addressbook a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureAddressBook : function(limit)
	{
		var store = new Zarafa.addressbook.AddressBookStore({
			standalone : false		
		});

		this.measureStore(store, {
			actionType : Zarafa.core.Actions['list'],
			params: {
				subActionType : Zarafa.core.Actions['globaladdressbook']
			}
		}, limit);
	},

	/**
	 * Measure the performance of loading the addressbook hierarchy.
	 * This will load the Global addressbook hierarchy a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureAddressBookHierarchy : function(limit)
	{
		var store = new Zarafa.addressbook.AddressBookHierarchyStore({
			standalone : false		
		});

		this.measureStore(store, {
			actionType : Zarafa.core.Actions['list'],
			params : {
				subActionType : 'hierarchy',
				gab : 'all'
			}
		}, limit);
	},

	/**
	 * Measure the performance of loading the reminders.
	 * This will load the reminders a number of times,
	 * and will calculate the average loading time.
	 *
	 * @param {Number} limit The number of measurements to execute
	 * over which the average will have to be calculated.
	 */
	measureReminders : function(limit)
	{
		var store = new Zarafa.common.reminder.data.ReminderStore({
			standalone : false		
		});

		this.measureStore(store, {
			actionType : Zarafa.core.Actions['list']
		}, limit);
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'zperformance',
		displayName : _('ZPerformance'),                                                                          
		pluginConstructor : Zarafa.plugins.zperformance.ZPerformancePlugin
	}));
});
