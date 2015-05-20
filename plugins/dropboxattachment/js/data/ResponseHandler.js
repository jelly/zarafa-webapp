Ext.namespace('Zarafa.plugins.dropboxattachment.data');

/**
 * @class Zarafa.plugins.dropboxattachment.data.ResponseHandler
 * @extends Zarafa.core.data.AbstractResponseHandler
 *
 * DropboxAttachments specific response handler.
 */
Zarafa.plugins.dropboxattachment.data.ResponseHandler = Ext.extend(Zarafa.core.data.AbstractResponseHandler, {

	/**
	 * @cgf {String} The id of the opened node in fuile tree recieved from the Dropbox
	 */
	nodeId: undefined,

	/**
	 * @cfg {Function} successCallback The function which
	 * will be called after success request.
	 */
	successCallback : null,

	/**
	 * Call the successCallback callback function.
	 * @param {Object} response Object contained the response data.
	 */
	doLoadnode : function(response)
	{
		this.successCallback(response.items, response);
	},

	/**
	 * Call the successCallback callback function.
	 * @param {Object} response Object contained the response data.
	 */
	doDownloadtotmp : function(response)
	{
		this.successCallback(response.items, response);
	},

	/**
	 * In case exception happened on server, server will return
	 * exception response with the code of exception.
	 * When exception code is 401 or 403 we need to authorize the user
	 * by opening the window with returned from server url.
	 * @param {Object} response Object contained the response data.
	 */
	doError: function(response)
	{
		if (response.error.info.code == 403 || response.error.info.code == 401)
		{
			var authDialog = window.open(response.error.info.url, 'Dropbox Authorisation', 'width=800, height=600');
			var self = this;
			this.intervalId = setInterval(
				self.intervalFunction.createDelegate(self, [authDialog, response]),
				4000
			);
			setTimeout(
				self.timeoutFunction.createDelegate(self, [authDialog]),
				50*1000
			);
		}
	},

	/**
	 * function that clears the code that checks
	 * if the window with the Dropbox authorization is open;
	 * also this function calls the failureCallback after the window
	 * is already closed.
	 * @param {Object} authDialog
	 * @param {Object} response
	 * @param {Number} intervalId
	 */
	intervalFunction: function(authDialog, response)
	{
		if(authDialog.closed)
		{
			clearInterval(this.intervalId);
			var error = {code: response.error.info.code}
			this.failureFunction(error);
		}
	},

	/**
	 * function that checks if the window is open too long,
	 * and, if it is, closes it and loads an error message into the dialog
	 * @param {Object} authDialog
	 * @param {Number} intervalId
	 */
	timeoutFunction: function(authDialog)
	{
		if(!authDialog.closed)
		{
			authDialog.close();
		}
		clearInterval(this.intervalId);
		var error = {
			code: 'timeout',
			text: '<span class="error_dropbox"> Failed to load data because of external error. Please, close dialog and try again</span>',
			icon:''
		}
		this.failureFunction(error);
	},

	/**
	 * Exception handler - depends on code or timeout
	 * if code of type "restricted" - 403/401 - then me just repeat out request
	 * else we just write the error message
	 * @param error
	 */
	failureFunction: function (error)
	{
		//In case the server sent "unauthorized" exception we need to repeat request after authorization
		if(error.code == 403 || error.code == 401)
		{
			if (error.url)
			{
				container.getRequest().singleRequest(
					'dropboxmodule',
					'loadnode',
					{id : this.nodeId},
					this
				);
			}
		}
		else if(error.code == 'timeout')
		{
			var fakeResponse =
			{
				items : [{text: error.text, leaf: true}],
				status : true
			}
			this.successCallback(fakeResponse.items, fakeResponse);
		}
	}
});

Ext.reg('dropboxattachment.responsehandler', Zarafa.plugins.dropboxattachment.data.ResponseHandler);