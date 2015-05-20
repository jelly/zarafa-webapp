/**
 * @class String
 * #core
 */
Ext.apply(String.prototype, {
	/*
	 * Trims whitespace from either end of a string, leaving spaces within the string intact.
	 * This function in ExtJS was only trimming SP (\x20) but not NBSP (\xA0) so changed regular expression
	 * to trim SP and NBSP both.
	 * acording to ECMA-262 NBSP is a whitespace character so it should be handled by \s class in regular
	 * expressions but probably IE doesn't know that.
	 * Example:
	 * <pre><code>
	 var s = '  foo bar  ';
	 alert('-' + s + '-');         //alerts "- foo bar -"
	 alert('-' + s.trim() + '-');  //alerts "-foo bar-"
	 </code></pre>
	 * @return {String} The trimmed string
	 */
	trim : function()
	{
		var re = /^[\s\xA0]+|[\s\xA0]+$/g;
		return function() { return this.replace(re, ""); };
	}()
});

Ext.applyIf(String, {
	/**
	 * Pads the right side of a string with a specified character.  This is especially useful
	 * for normalizing number and date strings.  Example usage:
	 * <pre><code>
	 var s = String.rightPad('123', 5, '0');
	 // s now contains the string: '12300'
	 * </code></pre>
	 * @param {String} value The original string
	 * @param {Number} padSize The total length of the output string
	 * @param {String} padChar (optional) The character with which to pad the original string (defaults to empty string " ")
	 * @return {String} The padded string
	 * @static
	 */
	rightPad : function(value, padSize, padChar)
	{
		var result = String(value);
		if(!padChar) {
			padChar = ' ';
		}

		while (result.length < padSize) {
			result += padChar;
		}

		return result;
	}
});
