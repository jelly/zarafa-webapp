Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.data.FilesStore
 * @extends Zarafa.core.data.ListModuleStore
 * 
 * The FilesStore class provides a way to connect the 'fileslistmodule' in the server back-end to an 
 * Ext.grid.GridPanel object. It provides a means to retrieve files listings asynchronously.
 * The store has to be initialised with a store Id, which corresponds (somewhat confusingly) to
 * a MAPI store id. The FilesStore object, once instantiated, will be able to retrieve and list
 * filess from a single specific store only.
 * 
 * @constructor
 * @param {String} storeId a MAPI id that corresponds with a MAPI store on the server.
 */
Zarafa.plugins.files.data.FilesStore = Ext.extend(Zarafa.core.data.ListModuleStore, {

	/**
	 * The root path which is loaded
	 * @private
	 */
	rootID : undefined,
	
	/**
	 * @constructor
	 */
	constructor : function() {
		this.rootID = "/";
		
		Zarafa.plugins.files.data.FilesStore.superclass.constructor.call(this, {
			preferredMessageClass : 'IPM.Files',
			autoSave: true,
			actionType : Zarafa.core.Actions['list'],
			defaultSortInfo : {
				field : 'filename',
				direction : 'asc'
			},
			baseParams : {
				id : this.rootID
			}
		});
	},
	
	/**
	 * Triggers the loading of the specified path.
	 * @param {String} path to load
	 */
	loadPath : function(path) {
		this.rootID = path;
		var params = {
			id : this.rootID
		};
		this.load({params : params});
	},
	
	/**
	 * Returns the current root directory
	 * @return {String} the current root directory
	 */
	getPath : function() {
		return this.rootID;
	}
});
