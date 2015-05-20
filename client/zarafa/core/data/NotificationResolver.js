Ext.namespace('Zarafa.core.data');

/**
 * @class Zarafa.core.data.NotificationResolver
 * @extends Ext.util.Observable
 *
 * The NotificationResolver is used when the {@link Zarafa.core.ResponseRouter ResponseRouter}
 * finds Responses which were not a reponse to a direct Request. This is usually the case,
 * when the PHP-side generated a Notification to update particular UI components based on
 * a server-side change.
 *
 * This resolver will read the response to determine which
 * {@link Zarafa.core.data.AbstractNotificationResponseHandler ResponseHandler} will
 * be needed to handle the response correctly.
 */
Zarafa.core.data.NotificationResolver = Ext.extend(Ext.util.Observable, {
	/**
	 * @constructor
	 * @param {Object} config Configuration object.
	 */
	constructor: function(config)
	{
		config = config || {};

		Ext.apply(this, config);

		Zarafa.core.data.NotificationResolver.superclass.constructor.call(this, config);
	},

	/**
	 * Obtain the {@link Zarafa.core.data.AbstractNotificationResponseHandler ResponseHandler}
	 * which can be used for handling the given response in a correct way. This will look into
	 * the response data to determine what kind of Notifications are in there, and will look
	 * up the most suitable {@link Zarafa.core.data.AbstractNotificationResponseHandler ResponseHandler}.
	 *
	 * @param {String} moduleName The Module which generated the notification.
	 * @param {Object} response The Json response data for which the responseHandler is needed
	 * @return {Zarafa.core.data.AbstractResponseHandler} The response handler
	 * which is suitable for handling the given response object.
	 */
	getHandlerForResponse : function(moduleName, response)
	{
		var handlers;

		if (!Ext.isObject(response)) {
			return null;
		}

		if (moduleName == 'hierarchynotifier' || moduleName == 'newmailnotifier') {
			handlers = this.getHandlersForIPFResponse(response);
		} else {
			handlers = this.getHandlersForIPMResponse(response);
		}

		if (Ext.isArray(handlers)) {
			if (handlers.length > 1) {
				return new Zarafa.core.data.CompositeResponseHandler({
					handlers: handlers
				});
			} else {
				return handlers[0];
			}
		} else {
			return handlers;
		}
	},

	/**
	 * Helper function for {@link #getHandlerForResponse}, this will construct
	 * the {@link Zarafa.hierarchy.data.HierarchyNotificationResponseHandler Response Handlers}
	 * for the {@link Zarafa.core.data.IPFStore IPFStores}.
	 *
	 * @param {Object} response The Json response data for which the responseHandler is needed
	 * @return {Zarafa.core.data.AbstractResponseHandler[]} The response handlers
	 * which are suitable for handling the given response object.
	 */
	getHandlersForIPFResponse : function(response)
	{
		var folderParents = [];
		var folderStores = [];

		// get handlers for folder's notifications.
		if(response['folders'] || response['newmail']) {
			var folders = response['folders'];
			if (Ext.isDefined(folders) && !Ext.isEmpty(folders['item'])) {
				folderParents = folderParents.concat(Ext.pluck(folders['item'], 'store_entryid'));
			}

			folderStores = Zarafa.core.data.IPFStoreMgr.getStoresForStores(folderParents);

			var newMail = response['newmail'];
			if (Ext.isDefined(newMail)) {
				folderStores.push(container.getHierarchyStore());
			}

			if (Ext.isArray(folderStores)) {
				var responseHandlers = [];
				for (var i = 0, len = folderStores.length; i < len; i++) {
					responseHandlers.push(new Zarafa.hierarchy.data.HierarchyNotificationResponseHandler({
						store : folderStores[i],
						reader : folderStores[i].reader,
						notifyObject : folderStores[i]
					}));
				}

				return responseHandlers;
			} else {
				return new Zarafa.hierarchy.data.HierarchyNotificationResponseHandler({
					store : folderStores,
					reader : folderStores.reader,
					notifyObject : folderStores
				});
			}
		} else if (response['stores']) {
			// get handlers for stores's notifications.
			var hierarchyStore = container.getHierarchyStore();
			return new Zarafa.hierarchy.data.HierarchyNotificationResponseHandler({
				store : hierarchyStore,
				reader : hierarchyStore.reader,
				notifyObject : hierarchyStore
			});
		}
	},

	/**
	 * Helper function for {@link #getHandlerForResponse}, this will construct
	 * the {@link Zarafa.core.data.IPMNotificationResponseHandler Response Handlers}
	 * for the {@link Zarafa.core.data.IPMStore IPMStores}.
	 *
	 * @param {Object} response The Json response data for which the responseHandler is needed
	 * @return {Zarafa.core.data.AbstractResponseHandler[]} The response handlers
	 * which are suitable for handling the given response object.
	 */
	getHandlersForIPMResponse : function(response)
	{
		var messageParents = [];
		var messageStores;

		var creates = response['newobject'];
		if (Ext.isDefined(creates) && Ext.isArray(creates.item)) {
			messageParents = messageParents.concat(Ext.pluck(creates.item, 'entryid'));
		}

		var updates = response['update'];
		if (Ext.isDefined(updates) && Ext.isArray(updates.item)) {
			messageParents = messageParents.concat(Ext.pluck(updates.item, 'parent_entryid'));
		}

		var deletes = response['delete'];
		if (Ext.isDefined(deletes) && Ext.isArray(deletes.item)) {
			messageParents = messageParents.concat(Ext.pluck(deletes.item, 'parent_entryid'));
		}

		messageStores = Zarafa.core.data.IPMStoreMgr.getStoresForFolders(messageParents);

		if (Ext.isArray(messageStores)) {
			var responseHandlers = [];
			for (var i = 0, len = messageStores.length; i < len; i++) {
				responseHandlers.push(new Zarafa.core.data.IPMNotificationResponseHandler({
					store : messageStores[i],
					reader : messageStores[i].reader,
					notifyObject : messageStores[i]
				}));
			}

			return responseHandlers;
		} else {
			return new Zarafa.core.data.IPMNotificationResponseHandler({
				store : messageStores,
				reader : messageStores.reader,
				notifyObject : messageStores
			});
		}
	}
});
