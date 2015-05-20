Ext.namespace('Zarafa.widgets.quickitems');

/**
 * @class Zarafa.widgets.quickitems.QuickTaskWidget
 * @extends Zarafa.widgets.quickitems.AbstractQuickItemWidget
 *
 * Widget for creating a task quickly with a minimum set of
 * input fields
 */
Zarafa.widgets.quickitems.QuickTaskWidget = Ext.extend(Zarafa.widgets.quickitems.AbstractQuickItemWidget, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			wrapCfg : {
				recordComponentPluginConfig : Ext.applyIf(config.recordComponentPluginConfig || {}, {
					allowWrite : true
				}),
				layout : 'fit',
				items : [{
					xtype : 'form',
					ref : 'formPanel',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					border : false,
					bodyStyle: 'background-color: inherit; padding: 5px;',
					defaults: {
						border: false,
						labelLength: 100,
						style: 'padding-bottom: 2px'
					},
					items : [{
						xtype: 'zarafa.compositefield',
						hideLabel: true,
						anchor: '100%',
						items: [{
							xtype: 'label',
							width: 100,
							text: _('Subject') + ':'
						},{
							xtype: 'textfield',
							flex: 1,
							name: 'subject',
							value: undefined,
							listeners: {
								change : this.onChange,
								scope : this
							}
						}]
					},{
						xtype: 'zarafa.compositefield',
						hideLabel: true,
						anchor: '100%',
						items: [{
							xtype: 'label',
							width: 100,
							text: _('End date') + ':'
						},{
							xtype: 'datefield',
							ref: '../../dueDateField',
							emptyText : _('None'),
							flex: 1,
							name: 'commonend',
							utcname : 'duedate',
							// # TRANSLATORS: See http://docs.sencha.com/ext-js/3-4/#!/api/Date for the meaning of these formatting instructions
							format : _('d/m/Y'),
							minValue : new Date(),
							listeners: {
								change : this.onDueDateChange,
								scope : this
							}
						}]
					},{
						xtype: 'zarafa.editorfield',
						ref: '../editorField',
						htmlName : 'html_body',
						plaintextName : 'body',
						hideLabel: true,
						flex: 1,
						useHtml : false,
						defaultValue: '',
						listeners: {
							change : this.onBodyChange,
							scope : this
						}
					}]
				}]
			},
			buttons : [{
				text : _('Save'),
				handler : this.onSave,
				scope : this
			},{
				text : _('Discard'),
				handler : this.onDiscard,
				scope : this
			}]
		});

		Zarafa.widgets.quickitems.QuickTaskWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Event handler which is triggered when one of the Input fields
	 * has been changed by the user. It will validate the new value,
	 * and if correct, will apply it to the {@link Zarafa.core.data.IPMRecord record}.
	 * @param {Object} field The field updated field
	 * @param {Object} value The value of the field updated
	 * @private
	 */
	onChange : function(field, value)
	{
		this.wrap.record.set(field.name, value);
	},

	/**
	 * Event handler which is triggered when one of the Input fields
	 * has been changed by the user. It will validate the new value,
	 * and if correct, will apply it to the {@link Zarafa.core.data.IPMRecord record}.
	 * @param {Ext.form.Field} field The {@link Ext.form.Field field} which was changed.
	 * @param {Mixed} newValue The new value
	 * @param {Mixed} oldValue The old value
	 * @private
	 */
	onDueDateChange : function(field, newValue, oldValue)
	{
		if (Ext.isDate(newValue)) {
			this.wrap.record.set(field.name, newValue.clone());
			this.wrap.record.set(field.utcname, newValue.toUTC());
		} else {
			this.wrap.record.set(field.name, null);
			this.wrap.record.set(field.utcname, null);
		}
	},

	/**
	 * Event handler which is triggered when one of the Input fields
	 * has been changed by the user. It will validate the new value,
	 * and if correct, will apply it to the {@link Zarafa.core.data.IPMRecord record}.
	 * @param {Ext.form.Field} field The {@link Ext.form.Field field} which was changed.
	 * @param {Mixed} newValue The new value
	 * @param {Mixed} oldValue The old value
	 * @private
	 */
	onBodyChange : function(field, newValue, oldValue)
	{
		this.wrap.record.beginEdit();
		if (field instanceof Ext.form.HtmlEditor) {
			this.wrap.record.set('isHTML', true);
		} else {
			this.wrap.record.set('isHTML', false);
		}
		this.wrap.record.set(field.name, newValue);
		this.wrap.record.endEdit();
	},

	/**
	 * Create a new record which must be edited by this widget.
	 * @return {Ext.data.Record} record The record to load into the {@link #wrap}
	 * @protected
	 */
	createRecord : function()
	{
		var folder = container.getHierarchyStore().getDefaultFolder('task');
		var context = container.getContextByName('task');
		var model = context.getModel();

		return model.createRecord(folder);
	},

	/**
	 * Updates the widget by loading data from the record into the {@link #wrap}.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record update the panel with.
	 * @param {Boolean} contentReset force the component to perform a full update of the data.
	 * @protected
	 */
	update : function(record, contentReset)
	{
		this.wrap.formPanel.getForm().loadRecord(record);
	},

	/**
	 * Updates the widget by loading data from the record into the {@link #wrap}.
	 *
	 * @param {Zarafa.core.data.IPMRecord} record The record to update
	 * @protected
	 */
	updateRecord : function(record)
	{
		record.beginEdit();
		this.wrap.formPanel.getForm().updateRecord(record);
		this.onDueDateChange(this.wrap.dueDateField, this.wrap.dueDateField.getValue());
		this.onBodyChange(this.wrap.editorField, this.wrap.editorField.getValue());
		record.endEdit();
	},

	/**
	 * Event handler which is fired when the user pressed the 'Save' button.
	 * This will call {@link Zarafa.core.ui.MessageContentPanel#saveRecord} to start
	 * sending the mail.
	 * @private
	 */
	onSave : function()
	{
		this.wrap.saveRecord();
	},

	/**
	 * Event handler which is fired when the user pressed the 'Disacrd' button.
	 * This will call {@link #reset} to clear the contents.
	 * @private
	 */
	onDiscard : function()
	{
		this.reset();
	}
});

Zarafa.onReady(function() {
	container.registerWidget(new Zarafa.core.ui.widget.WidgetMetaData({
		name : 'quicktask',
		displayName : _('Quick Task'),
		iconPath : 'plugins/quickitems/resources/images/quicktask.png',
		widgetConstructor : Zarafa.widgets.quickitems.QuickTaskWidget
	}));
});
