(function() {
	var orig_getValue = Ext.form.DateField.prototype.getValue;
	var orig_initComponent = Ext.form.DateField.prototype.initComponent;
	Ext.override(Ext.form.DateField, {

		/**
		 * overriden to set starting day of the week
		 * @override
		 */
		initComponent: function()
		{
			// if startDay is not specified through config then use one specified in settings
			if(!this.initialConfig.startDay) {
				this.startDay = container.getSettingsModel().get('zarafa/v1/main/week_start');
			}

			orig_initComponent.apply(this, arguments);

			// Check for invalid start day
			if(this.startDay < 0 || this.startDay >= Date.dayNames.length) {
				// by default make it sunday
				this.startDay = 0;
			}
		},

		/*
		 * Fix the getValue function for the DateField, normally Extjs would
		 * return an empty string ("") when no date was provided, but it more
		 * logically would be to return null.
		 */
		getValue : function()
		{
			var value = orig_getValue.apply(this, arguments);
			return Ext.isEmpty(value) ? null : value;
		},

		/**
		* This function prepares raw values for validation purpose only. Here when
		* field value is null than empty string will be returned because ExtJS by default uses
		* empty string to indicate that date is not present but there is no way in mapi to set
		* empty date. Here the validation function for date field doesn't expect null so we have
		* overriden processValue to give empty string if value is null.
		* @param {Mixed} value
		* @return {Mixed} value or empty string.
		*/
		processValue : function(value)
		{
			return Ext.isEmpty(value) ? "" : value;
		}
	});
})();
