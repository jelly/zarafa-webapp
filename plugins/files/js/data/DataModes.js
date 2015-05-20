Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.DataModes
 * @extends Zarafa.core.Enum
 *
 * Enum containing the different data modes of the files context. 
 * 
 * @singleton
 */
Zarafa.plugins.files.data.DataModes = Zarafa.core.Enum.create({
	/**
	 * View all files items from the selected folder(s).
	 *
	 * @property
	 * @type Number
	 */
	ALL : 0
});
