Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.Version
 * @extends Object
 *
 * Global Version Manager
 */
Zarafa.plugins.files.data.Version = Ext.extend(Object, {
	/**
	 * The owncloud version string or undefined if no owncloud is used.
	 * @property
	 * @type String
	 */
	ocversion : undefined,
	
	/**
	 * The plugin version string.
	 * @property
	 * @type String
	 */
	plversion : undefined,
	
	/**
	 * Flag to indicate that owncloud is used as file backend. False if no owncloud is used.
	 * @property
	 * @type Boolean
	 */
	isoc : false,
	
	/**
	 * Triggers a call to the backend to load version information.
	 */
	init : function() {
		var responseHandler = new Zarafa.plugins.files.data.ResponseHandler({
			successCallback: this.gotVersion.createDelegate(this)
		});
		
		container.getRequest().singleRequest(
			'filesmodule',
			'getversion',
			{
				plugin : "files"
			},
			responseHandler
		);
	},
	
	/**
	 * This function is called on a successful response from the backend.
	 * @param {Object} response
	 */
	gotVersion : function(response) {
		this.ocversion = response.ocversion;
		this.plversion = response.version;
		
		if(this.ocversion)
			this.isoc = true;
		else
			this.isoc = false;
	},
	
	/**
	 * Returns true if file backend is owncloud.
	 * @return {Boolean}
	 */
	isOwncloud : function() {
		return this.isoc;
	},
	
	/**
	 * Returns the plugin version string.
	 * @return {String}
	 */
	getPluginVersion : function() {
		return this.plversion;
	},
	
	/**
	 * Returns the files backend version string or unknown if no version
	 * information is found.
	 * @return {String}
	 */
	getFilesVersion : function() {
		if(this.ocversion) {
			this.isoc = true;
			return this.ocversion;
		} else {
			this.isoc = false;
			return dgettext('plugin_files', 'Unknown');
		}
	}
});

// Make it a singleton
Zarafa.plugins.files.data.Version = new Zarafa.plugins.files.data.Version();
