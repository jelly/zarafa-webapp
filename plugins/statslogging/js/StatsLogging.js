Ext.namespace('Zarafa.plugins.statslogging');

/**
 * @class Zarafa.plugins.statslogging.StatsLogging
 * @extends Zarafa.core.Plugin
 * 
 * Simple plugin that will log user experience information
 */
Zarafa.plugins.statslogging.StatsLogging = Ext.extend(Zarafa.core.Plugin, {
	/**
	 * List of actions performed by user. These actions are in the queue to be sent to the server.
	 * @property
	 * @private
	 * @type Array
	 */
	actionQueue : [],
	/**
	 * The identifier of the scheduled interval functions that will send the actions to the server. 
	 * With this identifier the interval can be stopped.
	 * @property
	 * @private
	 * @type Number
	 */
	sendIntervalID: null,

	/**
	 * Function will register all event handlers for the actions we wish to monitor.
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.statslogging.StatsLogging.superclass.initPlugin.apply(this, arguments);

		Zarafa.core.data.ContentPanelMgr.on('createdialog', this.onCreateDialog, this);
		Zarafa.core.data.ContentPanelMgr.on('destroydialog', this.onDestroyDialog, this);
		container.on('contextswitch', this.onContextSwitch, this);
		Ext.ComponentMgr.register = Ext.ComponentMgr.register.createSequence(this.onRegisterComponent, this);

		//TODO fix the default values as a third-party plugin
		var interval = container.getSettingsModel().get(this.getSettingsBase() + '/sendingInterval') || 60;
		this.sendIntervalID = setInterval(this.sendActionQueueToServer.createDelegate(this), interval * 1000);
	},

	/**
	 * Will store the actions in a list that is scheduled to be sent to the server. It adds a time 
	 * indication before the action container hours up till milliseconds.
	 * @param {String} action The user action
	 */
	queueAction: function(action)
	{
		var date = new Date();
		var time = date.format('H:i:s:') + date.getMilliseconds();

		this.actionQueue.push(time + '> ' + action);
	},

	/**
	 * When there are actions stored it will send it to the pluginuiloggingmodule on the server. It 
	 * will also clear the actions list so it can be used for the next set of actions.
	 */
	sendActionQueueToServer: function()
	{
		if(this.actionQueue.length > 0){
			var actions = this.actionQueue;
			this.actionQueue = [];
			container.getRequest().singleRequest(
				'pluginstatsloggingmodule',
				'storeactions',
				{
					actions: actions
				}
			);
		}
	},

	/**
	 * Fired by the {@link Zarafa.core.data.ContentPanelMgr ContentPanelMgr} when a dialog is being created.
	 * @param {Zarafa.core.ui.ContentPanel} contentpanel The contentpanel which has been created
	 * @private
	 */
	onCreateDialog : function(contentpanel)
	{
		try {
			this.queueAction('dialog' + ' - ' + 'dialog: ' + contentpanel.items.get(0).constructor.xtype + ' - ' + 'create');
		} catch(e) {}
	},

	/**
	 * Fired by the {@link Zarafa.core.data.ContentPanelMgr ContentPanelMgr} when a dialog is being closed.
	 * @param {Zarafa.core.ui.ContentPanel} contentpanel The contentpanel which has been destroyed
	 * @private
	 */
	onDestroyDialog : function(contentpanel)
	{
		try {
			this.queueAction('dialog' + ' - ' + 'dialog: ' + contentpanel.items.get(0).constructor.xtype + ' - ' + 'destroy');
		} catch(e) {}
	},

	/**
	 * Fired by the {@link Zarafa.core.Container container} when a context switch is being made.
	 * @param {Zarafa.core.data.IPMFolder} folder The folder which was selected
	 * @param {Zarafa.core.Context} oldContext The old context which is being disabled
	 * @param {Zarafa.core.Context} context The new context which is being enabled
	 * @private
	 */
	onContextSwitch : function(folder, oldContext, context)
	{
		try {
			this.queueAction('context' + ' - ' + 'switch: ' + oldContext.getName() + '->' + context.getName());
		} catch(e) {}
	},

	/**
	 * A {@link Function#createSequence sequence} to the {@link Ext.ComponentMgr#register} function.
	 * This is called whenever a {@link Ext.Component component} is being created. Here we check if
	 * the given component is interesting, and if so add additional event handlers to it.
	 * @param {Ext.Component} component The component which is being registered
	 * @private
	 */
	onRegisterComponent : function(component)
	{
		try {
			if (component.isXType('button')) {
				component.on('click', this.onButtonClick, this);
			} else if (component.isXType('menuitem')) {
				component.on('click', this.onMenuItemClick, this);
			} else if (component.isXType('grid')) {
				component.on('rowbodydblclick', this.onRowDblClick, this);
				component.on('rowdblclick', this.onRowDblClick, this);
				component.on('rowcontextmenu', this.onRowContextmenu, this);
			} else if (component.isXType('treepanel')) {
				component.on('click', this.onTreeClick, this);
				component.on('contextmenu', this.onTreeContextmenu, this);
			} else if (component.isXType('zarafa.navigationbuttonpanel')) {
				component.on('afterrender', this.onButtonPanelAfterRender, this);
			} else if (component.isXType('zarafa.calendarpanel')) {
				component.on('appointmentcalendardrop', this.onCalendarDrop, this);
				component.on('appointmentmove', this.onAppointmentMove, this);
				component.on('appointmentresize', this.onAppointmentResize, this);
				component.on('appointmentcreate', this.onAppointmentCreate, this);
				component.on('contextmenu', this.onCalendarContextMenu, this);
				component.on('dblclick', this.onCalendarDblClick, this);
				component.on('dayclick', this.onCalendarDayClick, this);
				component.on('calendarclose', this.onCalendarClose, this);
			}
		} catch(e) {}
	},

	/**
	 * Fired whenever the {@link Zarafa.core.ui.NavigationButtonPanel} is being rendered,
	 * this will go through all buttons in it and add the {@link #onNavigationButtonClick}
	 * event handlers to the 'click' event.
	 * @param {Ext.Component} The component being rendered
	 * @private
	 */
	onButtonPanelAfterRender : function(cmp)
	{
		try {
			for (var i = 0, len = cmp.openButtons.length; i < len; i++) {
				cmp.openButtons[i].on('click', this.onNavigationButtonClick, this);
			}

			for (var i = 0, len = cmp.closedButtons.length; i < len; i++) {
				cmp.closedButtons[i].on('click', this.onNavigationButtonClick, this);
			}
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a button on the {@link Zarafa.core.ui.NavigationButtonPanel}
	 * has been clicked.
	 * @param {Ext.EventObject} event The event object
	 * @param {Ext.Element} element The element on which the click event was fired
	 * @private
	 */
	onNavigationButtonClick : function(event, element)
	{
		try {
			var txt = 'navigation - ';

			txt += 'item: ' + 'navbutton' + ' - ';
			txt += 'text: ' + (element.textContent || element.classList[1]);

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when the {@link Ext.Button} has been clicked.
	 * @param {Ext.Button} btn The button which was pressed
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onButtonClick : function(btn, event)
	{
		try {
			var dialog = this.getComponentDialog(btn);
			var toolbar = this.getComponentToolbar(btn);
			var txt = 'button - ';

			if (dialog) {
				txt += 'dialog: ' + dialog.constructor.xtype + ' - ';
			}

			if (toolbar) {
				txt += 'toolbar: ' + toolbar.constructor.xtype + ' - ';
			}

			txt += 'item: ' + btn.constructor.xtype + ' - ';
			txt += 'text: ' + (btn.text || btn.overflowText || btn.iconCls);

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when the {@link Ext.menu.Item} has been clicked.
	 * @param {Ext.menu.Item} item The item which was pressed
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onMenuItemClick : function(item, event)
	{
		try {
			var dialog = this.getComponentDialog(item);
			var toolbar = this.getComponentToolbar(item);
			var menu = this.getComponentRootMenu(item);
			var txt = 'menu - ';

			if (dialog) {
				txt += 'dialog: ' + dialog.constructor.xtype + ' - ';
			}

			if (toolbar) {
				txt += 'toolbar: ' + toolbar.constructor.xtype + ' - ';
			}

			if (menu) {
				txt += 'menu: ' + menu.constructor.xtype + ' - ';
			}

			txt += 'item: ' + item.constructor.xtype + ' - ';
			txt += 'text: ' + (item.text || item.overflowText);

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a row has been double-clicked in the {@link Ext.grid.GridPanel}.
	 * @param {Ext.grid.GridPanel} grid The gridPanel which fired the event
	 * @param {Number} rowIndex The row which was double-clicked
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onRowDblClick : function(grid, rowIndex, event)
	{
		try {
			var dialog = this.getComponentDialog(grid);
			var txt = 'grid - ';

			if (dialog) {
				txt += 'dialog: ' + dialog.constructor.xtype + ' - ';
			}

			txt += 'item: ' + grid.constructor.xtype + ' - ';
			txt += 'index: ' + rowIndex;

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when the contextmenu on a row in the {@link Ext.grid.GridPanel} is requested.
	 * @param {Ext.grid.GridPanel} grid The gridPanel which fired the event
	 * @param {Number} rowIndex The row for which the contextmenu was requested
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onRowContextmenu : function(grid, rowIndex, event)
	{
		try {
			var dialog = this.getComponentDialog(grid);
			var txt = 'grid contextmenu - ';

			if (dialog) {
				txt += 'dialog: ' + dialog.constructor.xtype + ' - ';
			}

			txt += 'item: ' + grid.constructor.xtype + ' - ';
			txt += 'index: ' + rowIndex;

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a {@link Ext.tree.TreeNode node} has been clicked
	 * in the {@link Ext.tree.TreePanel}.
	 * @param {Ext.tree.TreeNode} node The node which was clicked
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onTreeClick : function(node, event)
	{
		try {
			var dialog = this.getComponentDialog(node);
			var tree = this.getComponentTree(node);
			var txt = 'tree - ';

			if (dialog) {
				txt += 'dialog: ' + dialog.constructor.xtype + ' - ';
			}

			if (tree) {
				txt += 'tree: ' + tree.constructor.xtype + ' - ';
			}

			txt += 'item: ' + 'node' + ' - ';
			txt += 'text: ' + node.text;

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when the contextmenu for the {@link Ext.tree.TreeNode node}
	 * in the {@link Ext.tree.TreePanel} was requested.
	 * @param {Ext.tree.TreeNode} node The node for which the contextmenu was requested
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onTreeContextmenu : function(node, event)
	{
		try {
			var dialog = this.getComponentDialog(node);
			var tree = this.getComponentTree(node);
			var txt = 'tree contextmenu - ';

			if (dialog) {
				txt += 'dialog: ' + dialog.constructor.xtype + ' - ';
			}

			if (tree) {
				txt += 'tree: ' + tree.constructor.xtype + ' - ';
			}

			txt += 'item: ' + 'node' + ' - ';
			txt += 'text: ' + node.text;

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when the appointment is dropped from one calendar
	 * to another one.
	 * @private
	 */
	onCalendarDrop : function()
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: calendardrop';

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when an appointment is moved by drag & drop
	 * @private
	 */
	onAppointmentMove : function()
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: appointmentmove';

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when an appointment is resized by dragging
	 * @private
	 */
	onAppointmentResize : function()
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: appointmentresize';

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a quick-appointment is created
	 * @private
	 */
	onAppointmentCreate : function()
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: appointmentcreate';

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when the contextmenu on a record or daterange
	 * is requested
	 * @param {Ext.EventObject} event The event object
	 * @param {Ext.data.Record} record The record on which the contextmenu
	 * is requested
	 * @private
	 */
	onCalendarContextMenu : function(event, record)
	{
		try {
			var txt = 'calendar contextmenu - ';

			txt += 'text: ' + (record.phantom ? 'daterange' : 'record');

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a record or daterange is being double-clicked.
	 * @param {Ext.EventObject} event The event object
	 * @param {Ext.data.Record} record The record on which was double-clicked
	 * @private
	 */
	onCalendarDblClick : function(event, record)
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: dblclick - ';
			txt += 'text: ' + (record.phantom ? 'daterange' : 'record');

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a day header is clicked
	 * @param {Zarafa.core.ui.View} view The view which was clicked
	 * @param {Date} date The date which was clicked
	 * @private
	 */
	onCalendarDayClick : function(view, date)
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: dayclick - ';
			txt += 'text: ' + date.toString();

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Event handler which is fired when a calendar tab is being closed
	 * @private
	 */
	onCalendarClose : function()
	{
		try {
			var txt = 'calendar - ';

			txt += 'action: close ';

			this.queueAction(txt);
		} catch(e) {}
	},

	/**
	 * Utility function which will search to which {@link Zarafa.core.ui.ContentPanel contentpanel}
	 * the given {@link Ext.Component item} belongs.
	 * @param {Ext.Component} item The component for which the panel is requested
	 * @return {Zarafa.core.ui.ContentPanel} The content panel to which the item belongs, if the item
	 * didn't belong to a panel, then this returns 'undefined'
	 * @private
	 */
	getComponentDialog : function(item)
	{
		if (item instanceof Ext.tree.TreeNode) {
			item = item.getOwnerTree();
		}

		while (item && !item.dialog) {
			item = item.ownerCt;
		}

		if (item) {
			return item.dialog;
		}
	},

	/**
	 * Utility function which will search to which {@link Zarafa.core.ui.Toolbar toolbar}
	 * the given {@link Ext.Component item} belongs.
	 * @param {Ext.Component} item The component for which the toolbar is requested
	 * @return {Zarafa.core.ui.Toolbar} The toolbar to which the item belongs, if the item
	 * didn't belong to a toolbar, then this returns 'undefined'
	 * @private
	 */
	getComponentToolbar : function(item)
	{
		while (item && !item.isXType('toolbar')) {
			item = item.ownerCt;
		}

		if (item && item.isXType('toolbar')) {
			return item;
		}
	},

	/**
	 * Utility function which will search to which {@link Ext.menu.Menu menu}
	 * the given {@link Ext.menu.Item item} belongs.
	 * @param {Ext.menu.Item} item The item for which the rootmenu is requested
	 * @return {Ext.menu.Menu} The menu to which the item belongs, if the item
	 * didn't belong to a menu, then this returns 'undefined'
	 * @private
	 */
	getComponentRootMenu : function(item)
	{
		var menu = item.parentMenu;
		if (!menu && item.ownerCt instanceof Ext.menu.Menu) {
			menu = item.ownerCt;
		}

		while (menu && (Ext.isDefined(menu.parentMenu) || menu.ownerCt instanceof Ext.menu.Menu)) {
			menu = menu.parentMenu || menu.ownerCt;
		}

		return menu
	},

	/**
	 * Utility function which will search to which {@link Ext.tree.TreePanel tree}
	 * the given {@link Ext.tree.TreeNode node} belongs.
	 * @param {Ext.tree.TreeNode} node The node for which the roottree is requested
	 * @return {Ext.tree.TreePanel} The tree to which the node belongs, if the node
	 * didn't belong to a tree, then this returns 'undefined'
	 * @private
	 */
	getComponentTree : function(node)
	{
		return node.getOwnerTree();
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'statslogging',
		displayName : _('Statistics Logging'),
		pluginConstructor : Zarafa.plugins.statslogging.StatsLogging
	}));
});
