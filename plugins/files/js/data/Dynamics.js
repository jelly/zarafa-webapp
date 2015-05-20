Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.Dynamics
 * @extends Object
 *
 * Global dynamic value manager
 */
Zarafa.plugins.files.data.Dynamics = Ext.extend(Object, {
	/**
	 * This object stores the JSON response from the backend.
	 * @property
	 * @type Object
	 */
	dynData : undefined,
	
	/**
	 * Triggers a call to the backend to load version information.
	 */
	init : function() {
		var responseHandler = new Zarafa.plugins.files.data.ResponseHandler({
			successCallback: this.gotDynamics.createDelegate(this)
		});
		
		container.getRequest().singleRequest(
			'filesmodule',
			'getdynamics',
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
	gotDynamics : function(response) {
		this.dynData = response;
	},
	
	/**
	 * Returns the upload size limit in bytes.
	 * @return {Number} Will return undefined on error.
	 */
	getMaxUploadFilesize : function() {
		if(!Ext.isEmpty(this.dynData) && this.dynData.uploadLimit) {
			return this.dynData.uploadLimit;
		}
		
		return undefined;
	},
	
	/**
	 * Returns the current store size.
	 * @return {Number} Will return -1 on error.
	 */
	getCurrentStoreSize : function() {
		if(!Ext.isEmpty(this.dynData) && this.dynData.quotaSupport === true) {
			return parseFloat(this.dynData.quotaUsed);
		}
		
		return -1;
	},
	
	/**
	 * Returns the available store size.
	 * @return {Number} Will return -1 on error.
	 */
	getAvailableStoreSize : function() {
		if(!Ext.isEmpty(this.dynData) && this.dynData.quotaSupport === true) {
			return parseFloat(this.dynData.quotaAvailable);
		}
		
		return -1;
	}
});

// Make it a singleton
Zarafa.plugins.files.data.Dynamics = new Zarafa.plugins.files.data.Dynamics();
