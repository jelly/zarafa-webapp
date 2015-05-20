Ext.namespace('Zarafa.mail.data');

/**
 * @class Zarafa.mail.data.ViewModes
 * @extends Zarafa.core.Enum
 *
 * Enum containing the different viewing modes of the mail context.
 * 
 * @singleton
 */
Zarafa.mail.data.ViewModes = Zarafa.core.Enum.create({
	/**
	 * Don't show the preview panel
	 * @property
	 * @type Number
	 */
	NO_PREVIEW : 0,

	/**
	 * Show the preview panel to the right
	 * @property
	 * @type Number
	 */
	RIGHT_PREVIEW : 1,

	/**
	 * Show the preview panel in the bottom
	 * @property
	 * @type Number
	 */
	BOTTOM_PREVIEW : 2,

	/**
	 * Show the search results
	 * @property
	 * @type Number
	 */
	SEARCH : 3
});
