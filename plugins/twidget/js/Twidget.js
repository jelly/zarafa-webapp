Ext.namespace('Zarafa.widgets.twidget');

/**
 * @class Zarafa.widgets.twidget.SenderInfoWidget
 * @extends Zarafa.core.ui.widget.Widget
 */
Zarafa.widgets.twidget.SenderInfoWidget = Ext.extend(Zarafa.core.ui.widget.Widget, {

	/**
	 * The store in which the Twitter messages will be shown
	 * @property
	 * @type Ext.data.ArrayStore
	 */
	store : undefined,

	/**
	 * The record which currently selected by the context model.
	 * @property
	 * @type Zarafa.core.data.MAPIRecord
	 */
	record : undefined,

	/**
	 * The row selection model that is used to propagate click events
	 * on rows in the grid.
	 * @property
	 * @type Ext.grid.RowSelectionModel
	 */
	rowSelectionModel : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

 		this.store = new Ext.data.ArrayStore({
			// store configs
			autoDestroy: true,
			storeId: 'twidget',
			idIndex: 0,  
			fields: [
				'id',
				'image',
				'sender',
				'user',
				'text'
			],
			data: [ ]
		});

		this.rowSelectionModel = new Ext.grid.RowSelectionModel({
			singleSelect: true
		});

		Ext.applyIf(config, { 
			about : Zarafa.widgets.twidget.ABOUT,
			height : 260,
			layout : 'fit',
			hasConfig : true,
			items : [{
				xtype: 'grid',
				disableSelection : true,
				store: this.store,
				border: true,
				sm: this.rowSelectionModel,
				viewConfig: {
					deferEmptyText: false,
					emptyText: '<div class="emptytext">' + _('No sender info found.') + '</div>',
					forceFit: true,
					enableRowBody: true,
					getRowClass: function(record, rowIndex, rp, ds){
						rp.body = record.get('text');
						return 'x-grid3-row-expanded';
					}
				},
				colModel : new Ext.grid.ColumnModel({
					columns: [{
						header: '',
						dataIndex: 'image',
						editable: false,
						menuDisabled: true,
						renderer: function(value) {
							return '<img style="width: 16px; height: 16px" src="' + value + '">';
						},
						width: 50
					},{
						header: _('Username'),
						dataIndex: 'user',
						editable: false,
						menuDisabled: true,
						renderer: function(value) {
							return '<b>@' + value + '</b>';
						},
						width: 200
					},{
						header: _('Sender'),
						dataIndex: 'sender',
						editable: false,
						menuDisabled: true,
						width: 200
					}]
				})
			}]
		});

		Zarafa.widgets.twidget.SenderInfoWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Register the {@link Zarafa.core.ContextModel#previewrecordchange Preview Record Change} event handler
	 * @protected
	 */
	initEvents : function()
	{
		Zarafa.widgets.twidget.SenderInfoWidget.superclass.initEvents.apply(this, arguments);

		this.mon(this.rowSelectionModel, 'rowselect',
			this.onRowSelect, this);
		var context = container.getContextByName('mail');
		if (context) {
			this.mon(context.getModel(), 'previewrecordchange', this.onPreviewRecordChange, this);
		}
	},

	/**
	 * Event handler which is fired when the {@link Zarafa.core.ContextModel Context Model} fires the
	 * {@link Zarafa.core.ContextModel#previewrecordchange} event. This will clear the {@link #store}
	 * and ensure that the new associated twitter messages are loaded.
	 * @param {Zarafa.core.ContextModel} contextModel The model which fired the event
	 * @param {Ext.data.Record} record The record which was selected
	 * @private
	 */
	onPreviewRecordChange : function(contextModel, record)
	{
		// In case we already had a previewed record, unhook the events
		if (this.record) {
			var store = this.record.getStore();
			if (store) {
				this.mun(store, 'open', this.onOpen, this);
			}
		}

		// Remove all associated twitter messages
		this.store.removeAll();

		// Update the current record
		this.record = record;
		if (!this.record) {
			return;
		}

		if (!record.isOpened()) {
			this.mon(record.getStore(), 'open', this.onOpen, this);
			record.open();
		} else {
			this.loadRecord(record);
		}
	},

	/**
	 * When a row is selected (e.g. by clicking), open that tweet in a
	 * new browser window.
	 * @param {Ext.grid.RowSelectionModel} selectionModel the selection
	 * model that this event is triggered by
	 * @param {Integer} rowIndex the index of the selected row in the
	 * model
	 * @param {Ext.data.Record} record the record belonging to the row
	 * that is selected
	 * @private
	 */
	onRowSelect: function(selectionModel, rowIndex, record) {
		window.open('https://twitter.com/' + record.get('user') + 
			'/statuses/' + record.get('id'));
	},

	/**
	 * Event handler which is fired when the {@link #record} has been opened
	 * by the store. This will call {@link #loadRecord}.
	 * @param {Ext.data.Store} store The store which fired the event
	 * @param {Ext.data.Record} record The opened record
	 * @private
	 */
	onOpen : function(store, record)
	{
		if (this.record && this.record.equals(record)) {
			this.mun(store, 'open', this.onOpen, this);
			this.loadRecord(record);
		}
	},

	/**
	 * Load the associated twitter messages for the given record.
	 * This will send a request using JSONP to twitter to search for
	 * all associated messages
	 * @param {Ext.data.Record} record The record to load
	 * @private
	 */
	loadRecord : function(record)
	{
		var body = record.getBody(false);
		var re = new RegExp("twitter.com/(\\w+)");
		var twitter = undefined;

		var match = re.exec(body);
		if (Ext.isEmpty(match)) {
			re = new RegExp("^(.*?\\W)?@(\\w{1,15})\\b");
			match = re.exec(body);
			if (!Ext.isEmpty(match)) {
				twitter = match[2];
			}
		} else {
			twitter = match[1];
		}
		
		if (twitter !== undefined) {
			var count = this.get('max_count');
			if (!Ext.isDefined(count)) {
				count = 10;
			}
			var rts = this.get('include_rts');
			if (!Ext.isDefined(rts)) {
				rts = true;
			}

			Ext.ux.JSONP.request({
				url : 'https://api.twitter.com/1/statuses/user_timeline.json',
				params: {
					screen_name: twitter,
					count: String(count),
					include_rts: String(rts)
				},
				success : this.onTwitterUpdate,
				callbackKey : 'callback',
				scope : this
			});
		}
	},

	/**
	 * Callback function from JSONP as provided by {@link #loadRecord},
	 * this will handle the result from Twitter to initialize the {@link #store}
	 * to show the new messages.
	 * @param {Object} data The data as received from twitter
	 * @private
	 */
	onTwitterUpdate : function(data)
	{
		Ext.each(data, function(result, i) {
			var status = result;
			if (status.retweeted_status != undefined) {
				status = status.retweeted_status;
			}
			var r = new this.store.recordType({
				id: status.id_str,
				user: status.user.screen_name,
				sender: status.user.name,
				text: status.text,
				image: Ext.isSecure ? status.user.profile_image_url_https : status.user.profile_image_url
			}, i);
			this.store.add([r]);
		}, this);
	},

	/**
	 * Configure the widget.
	 * We allow the configuration of the maximum number of results,
	 * and if retweets should be included.
	 * @private
	 */
	config : function()
	{
		var win = new Ext.Window({
			title: _('Configure widget'),
			layout: 'fit',
			width: 320,
			height: 200,

			items: [{
				xtype: 'form',
				labelWidth: 120,
				frame: true,

				items : [{
					xtype: 'zarafa.spinnerfield',
					fieldLabel: _('Maximum results'),
					name: 'max_count',
					minValue: 5,
					maxValue: 100,
					incrementValue: 1,
					defaultValue: this.get('max_count') || 10,
					listeners: { 'change': this.onFieldChange, scope: this },
					plugins: ['zarafa.numberspinner']
				},{
					xtype : 'checkbox',
					fieldLabel : _('Include retweets'),
					name : 'include_rts',
					checked : Ext.isDefined(this.get('include_rts')) ? this.get('include_rts') : true,
					listeners: { 'check': this.onFieldChange, scope: this }
				}],
				buttons: [{
					text: _('Close'),
					scope: this,
					handler: function() {
						win.close();
					}
				}]
			}]
		});

		win.show(this);
	},

	/**
	 * Event handler which is fired when one of the fields in the Configuration dialog
	 * has been changed. This will update the corresponding option in the settings.
	 * @param {Ext.form.Field} field The field whcih fired the event
	 * @param {Mixed} newValue The new value which was applied
	 * @param {Mixed} oldValue The old value which was applied
	 * @private
	 */
	onFieldChange : function(field, newValue, oldValue)
	{
		this.set(field.getName(), newValue);
	}
});

Zarafa.onReady(function() {
	container.registerWidget(new Zarafa.core.ui.widget.WidgetMetaData({
		name : 'twidget',
		displayName : _('Twidget'),
		iconPath : 'plugins/twidget/resources/images/twidget.png',
		widgetConstructor : Zarafa.widgets.twidget.SenderInfoWidget
	}));
});
