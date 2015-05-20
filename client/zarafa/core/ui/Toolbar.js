Ext.namespace('Zarafa.core.ui');

/**
 * @class Zarafa.core.ui.Toolbar
 * @extends Ext.Toolbar
 * @xtype zarafa.toolbar
 */
Zarafa.core.ui.Toolbar = Ext.extend(Ext.Toolbar, {
	// Private
	// Used to keep track of whether the toolbar buttongroups have been corrected in size yet.
	initialSizeCorrectionDone: false,

	/**
	 * @constructor
	 * @param config
	 */
	constructor : function(config)
	{
		Ext.apply(this, config, {
			// Override from Ext.Component
			xtype: 'zarafa.toolbar',
			// Override from Ext.Toolbar
			enableOverflow: true
		});

		Zarafa.core.ui.Toolbar.superclass.constructor.call(this, config);

		this.on('afterlayout', this.onAfterLayout, this);
	},

	/**
	 * Add a new {@link Ext.ButtonGroup} to the {@link Ext.Toolbar} using an insertionpoint to support
	 * the addition of extra {@link Ext.Button} elements to the {@link Ext.ButtonGroup}. If the insertion
	 * point contains a {@link Ext.ButtonGroup} it will be added outside the given {@link Ext.ButtonGroup}
	 * to prevent nesting.
	 *
	 * @param {Object/String} group The {@link Ext.ButtonGroup} to which individual {@link Ext.Button} elements must be added.
	 * If this argument is a {@link String} it will be used as title for the {@link Ext.ButtonGroup}.
	 * @param {String} insertion (optional) The name of the insertion point used to add additional {@link Ext.Button} and
	 * {@link Ext.ButtonGroup} elements.
	 * @protected
	 */
	addItems : function(buttons, insertion)
	{
		var items = [];

		if (Ext.isDefined(buttons)) {
			if (!Ext.isEmpty(buttons)) {
				items = items.concat(buttons);
			}
		}

		if (Ext.isString(insertion)) {
			var insert = container.populateInsertionPoint(insertion);
			if (!Ext.isEmpty(insert)) {
				items = items.concat(insert);
			}
		}

		// Make sure we get a single array containing all buttons
		items = Ext.flatten(items);

		this.add(items);
	},

	/**
	 * When the toolbar is layed out the sizes for the different buttongroups may differ. When the
	 * afterlayout event is fired the heights are corrected to have all the buttongroups match in
	 * height. This is only done the first time the toolbar is shown.
	 * @private
	 */
	onAfterLayout: function()
	{
		// Only do it the first time the toolbar is shown.
		if(!this.initialSizeCorrectionDone && this.el.getHeight() > 0){

			var elements = [];
			var maxHeight = 0;
			this.items.each(function(item){
				if (item.isXType('buttongroup')) {
					var elem = item.body;
					maxHeight = Math.max(maxHeight, elem.getHeight());
					elements.push(elem);
				}
			});

			if(maxHeight > 0){
				Ext.each(elements, function(elem){
					elem.setHeight(maxHeight);
				}, this);
				this.initialSizeCorrectionDone = true;
			}
		}
	}
});

Ext.reg('zarafa.toolbar', Zarafa.core.ui.Toolbar);
