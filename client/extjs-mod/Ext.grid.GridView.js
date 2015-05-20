(function() {
	var orig_onColConfigChange = Ext.grid.GridView.prototype.onColConfigChange;

	Ext.override(Ext.grid.GridView, {
		/*
		 * Override the Ext.grid.GridView to fix an issue where the columns are rendered
		 * partally behind the scrollbar in Google Chrome. This is due to the fact that
		 * ExtJs assumes the borders take up no space in Chrome, while in fact they do.
		 */
		getColumnWidth : function(column)
		{
			var columnWidth = this.cm.getColumnWidth(column);
			var borderWidth = this.borderWidth;

			if (Ext.isNumber(columnWidth)) {
				// Original if-statement: Ext.isBorderBox || (Ext.isWebKit && !Ext.isSafari2)
				if (Ext.isBorderBox) {
					return columnWidth + 'px';
				} else {
					return Math.max(columnWidth - borderWidth, 0) + 'px';
				}
			} else {
				return columnWidth;
			}
		},

		/**
		 * Event handler for the {@link #cm}#{@link Ext.grid.ColumnModel#configchange configchange} event.
		 * This will call {@link Ext.grid.GridPanel#initState initState} on the {@link #grid}.
	 	 * @private
	 	 */
		onColConfigChange : function()
		{
			// Call initState on the gridpanel at this exact time, the superclass will
			// perform a layout on the applied configuration and needs the updated information.
			var grid = this.grid;

			if(grid.stateful !== false) {
				grid.initState();
			}

			orig_onColConfigChange.apply(this, arguments);
		}
	});
})();
