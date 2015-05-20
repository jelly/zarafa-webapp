(function() {
	var checkPerc = /^(100?|\d?\d)?%?$/;
	var checkNaturalInteger = /^[1-9]\d*$/i;

	/**
	 * @class Ext.form.VTypes
	 * This will apply the custom vtype which is used to check
	 * given percentage must be between 0 to 100.
	 * @singleton
	 */
	Ext.apply(Ext.form.VTypes, {
		/**
		 * Used to validate the given percentage value must be between 0 to 100.
		 * and also check that value is not float.
		 * @param {Number} perc the perc is represent percentage value from field.
		 * @return {Boolean} return true if given percentage value matches
		 * with regular expression else return false.
		 */
		percentage : function(perc) {
			return checkPerc.test(perc);
		},

		//The error text to display when the validation function returns false
		percentageText: _('Value must be between 0% to 100%'),

		/**
		 * Used to validate the given value must be a whole number of one or higher
		 * @param {Number} value the value of the spinner field
		 * @return {Boolean} return true if the value is one or higher,
		 * else return false.
		 */
		naturalInteger: function(value)
		{
			return checkNaturalInteger.test(value);
		},

		// The error text to display when the validation function returns false
		naturalIntegerText: _('Number must be higher than zero')
	});
})();