Ext.ns('Zarafa.common.ui');

/**
 * @class Zarafa.common.ui.SearchField
 * @extends Ext.form.TwinTriggerField
 * @xtype zarafa.searchfield
 *
 * This class can be used to construct a search field with start and stop buttons and we can listen
 * for events to do search specific processing. this search can be local or remote so it is abstracted
 * away from this component.
 */
Zarafa.common.ui.SearchField = Ext.extend(Ext.form.TwinTriggerField, {

	/**
	 * @cfg {String} searchIndicatorClass The CSS class which must be applied to the {@link #el}
	 * during {@link #updateEditState} to indicate that the field is busy searching.
	 */
	searchIndicatorClass : 'zarafa-tbar-loading',

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		Ext.apply(config, {
			validationEvent : false,
			validateOnBlur : false,
			trigger1Class : 'x-form-clear-trigger',
			trigger2Class : 'x-form-search-trigger',
			hideTrigger1 : true
		});

		this.addEvents(
			/**
			 * @event beforestart
			 * Handler will be called when user has clicked on start trigger (trigger2),
			 * and function is about to begin its execution.
			 * event handler can return false to abort further execution.
			 * @param {Zarafa.common.ui.SearchField} SearchField object of search field component.
			 * @return {Boolean} false to prevent the search from starting
			 */
			'beforestart',
			/**
			 * @event start
			 * Handler will be called when user has clicked on start trigger (trigger2),
			 * and function has already been executed. This event can be used to actually
			 * start search operation on a {@link Zarafa.core.data.ListModuleStore ListModuleStore}.
			 * @param {Zarafa.common.ui.SearchField} SearchField object of search field component.
			 */
			'start',
			/**
			 * @event beforereset
			 * Handler will be called when user has clicked on stop trigger (trigger1),
			 * and function is about to begin its execution.
			 * event handler can return false to abort further execution.
			 * @param {Zarafa.common.ui.SearchField} SearchField object of search field component.
			 * @return {Boolean} false to prevent the search from stopping
			 */
			'beforestop',
			/**
			 * @event reset
			 * Handler will be called when user has clicked on stop trigger (trigger1),
			 * and function has already been executed. This event can be used to stop
			 * search process on {@link Zarafa.core.data.ListModuleStore ListModuleStore}
			 * and reload with normal data.
			 * @param {Zarafa.common.ui.SearchField} SearchField object of search field component.
			 */
			'stop'
		);

		Zarafa.common.ui.SearchField.superclass.constructor.call(this, config);
	},

	/**
	 * Initialises the component.
	 * This will listen to some special key events registered on the Trigger Field
	 * @protected
	 */
	initComponent : function()
	{
		Zarafa.common.ui.SearchField.superclass.initComponent.call(this);

		this.on('specialkey', this.onTriggerSpecialKey, this);
	},

	/**
	 * Event handler which is fired when the {@link Ext.EventObjectImp#ENTER} key was pressed,
	 * if the {@link #getValue value} is non-empty this will equal pressing the
	 * {@link #onTrigger1Click 'stop'} button, otherwise this will equal pressing the
	 * {@link #onTrigger2Click 'search'} button.
	 * @param {Ext.form.Field} field The field which fired the event
	 * @param {Ext.EventObject} e The event for this event
	 * @private
	 */
	onTriggerSpecialKey : function(field, e)
	{
		if (e.getKey() == e.ENTER) {
			var textValue = this.getValue();
			if (Ext.isEmpty(textValue)) {
				this.onTrigger1Click();
			} else {
				this.onTrigger2Click();
			}
		}
	},

	/**
	 * Trigger handler function that will be used to stop search process.
	 * it will fire {@link #stop} event, that can be used to stop actual search process.
	 * other component can also do pre-processing before stop search process using
	 * {@link #beforestop} event.
	 * @protected
	 */
	onTrigger1Click : function()
	{
		if (this.fireEvent('beforestop', this) !== false) {
			this.doStop();
			this.fireEvent('stop', this);
		}
	},

	/**
	 * Trigger handler function that will be used to start search process.
	 * it will fire {@link #start} event, that can be used to start actual search process.
	 * other component can also do validation before starting search process using
	 * {@link #beforestart} event.
	 * @protected
	 */
	onTrigger2Click : function()
	{
		if (this.fireEvent('beforestart', this) !== false) {
			this.doStart();
			this.fireEvent('start', this);
		}
	},

	/**
	 * Apply a new {@link #emptyText} onto this component
	 * @param {String} text The new emptyText which should be applied
	 */
	updateEmptyText : function(text)
	{
		if (Ext.isEmpty(this.getRawValue())) {
			this.setRawValue(text);
		}
		this.emptyText = text;
	},

	/**
	 * Update this component to display that this component is
	 * currently busy searching. This will show the first trigger
	 * which can be used for stopping the search.
	 */
	doStart : function()
	{
		this.el.addClass(['x-item-disabled', this.searchIndicatorClass]);
		this.getTrigger(0).show();
	},

	/**
	 * Update this component to display that this component is currently
	 * no longer searching.
	 * @param {Boolean} complete True if the search was completed rather then cancelled,
	 * this means that the first trigger must remain visible to allow the user to stop
	 * the search.
	 */
	doStop : function(complete)
	{
		this.el.removeClass(['x-item-disabled', this.searchIndicatorClass]);
		if (complete !== true) {
			this.getTrigger(0).hide();
		}
	}
});

Ext.reg('zarafa.searchfield', Zarafa.common.ui.SearchField);
