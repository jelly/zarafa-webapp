Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.DirectoryLoader
 * @extends Ext.tree.TreeLoader
 *
 * Files Directory loader. Extends Ext treeloader to use Zarafa
 * specific requests.
 */
Zarafa.plugins.files.data.DirectoryLoader = Ext.extend(Ext.tree.TreeLoader, {

	/**
	 * also load files
	 */
	files : false,
	
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};
		
		if(Ext.isDefined(config.loadfiles))
			this.files = config.loadfiles;

		Ext.applyIf(config, {
			preloadChildren: true,
			directFn : this.loadFolder.createDelegate(this),
			listeners: {
				loadexception: function(tl, node, response) {
					Zarafa.common.dialogs.MessageBox.show({
						title : dgettext('plugin_files', 'Loading failed'),
						msg : response.error,
						icon : Zarafa.common.dialogs.MessageBox.ERROR,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
				}
			}
		});

		Zarafa.plugins.files.data.DirectoryLoader.superclass.constructor.call(this, config);
	},

	/**
	 * Will do single request to files module with provided nodeId and
	 * in case of success will load the content of this node.
	 *
	 * @param {Number} nodeId The id of node which content need to be loaded
	 * @param {Function} callback The function which need to be called after response received
	 */
	loadFolder : function(nodeId, callback) {
		var self = this;
		var responseHandler = new Zarafa.plugins.files.data.ResponseHandler({
			successCallback: function(items, response) {
				// reanable upload button Zarafa.plugins.files.ui.UploadButton
				var toolBar = Zarafa.plugins.files.data.ComponentBox.getViewPanelToolbar();
				if(toolBar) {
					var button = toolBar.uploadbutton;
					if(button)
						button.enable();
				}
				
				callback(items, response); // run callback
			},
			failureCallback: function(response) {
				
				var toolBar = Zarafa.plugins.files.data.ComponentBox.getViewPanelToolbar();
				var tabBarItems = Zarafa.plugins.files.data.ComponentBox.getTabPanelItems();
				var openedWindow = Ext.WindowMgr.getActive();
				
				// close the opened dialog
				if(openedWindow)
					openedWindow.close();
				
				// close all opened upload tabs
				var FilesUploadContentPanel = container.getSharedComponent(Zarafa.core.data.SharedComponentType['common.create']);
				Ext.each(tabBarItems, function (item) {
					if(Ext.isDefined(item.xtype) && item.xtype === "zarafa.filesuploadcontentpanel") {
						item.close();
					}
				});
				
				// try to disable Zarafa.plugins.files.ui.UploadButton
				if(toolBar) {
					var button = toolBar.uploadbutton;
					if(button)
						button.disable();
				}
				
				Zarafa.common.dialogs.MessageBox.show({
					title : dgettext('plugin_files', 'Error'),
					msg : response.error,
					icon : Zarafa.common.dialogs.MessageBox.ERROR,
					buttons : Zarafa.common.dialogs.MessageBox.OK
				});
				
				callback(undefined, {status : true, items : undefined}); // run callback
			},
			nodeId: nodeId
		});
		
		container.getRequest().singleRequest(
			'filesbrowsermodule',
			'loaddirectory',
			{
				id : nodeId,
				loadfiles : this.files
			},
			responseHandler
		);
	}
});
