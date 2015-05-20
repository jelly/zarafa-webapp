Ext.namespace('Zarafa.plugins.files.context');

/**
 * @class Zarafa.plugins.files.context.FilesContextModel
 * @extends Zarafa.core.ContextModel
 * class will instantiate {@link Zarafa.plugins.files.FilesStore FilesStore} object
 */
Zarafa.plugins.files.context.FilesContextModel = Ext.extend(Zarafa.core.ContextModel, {
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};
		
		if(!Ext.isDefined(config.store))
			config.store = new Zarafa.plugins.files.data.FilesStore();
		
		Zarafa.plugins.files.context.FilesContextModel.superclass.constructor.call(this, config);
	},
	
	/**
	 * Create a new {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 * @param {String} parentid id of the parent folder
	 * @return {Zarafa.core.data.IPMRecord} The new {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 */
	createRecord : function(parentid) {
		parentid = parentid || "root";
		
		var record = Zarafa.core.data.RecordFactory.createRecordObjectByMessageClass('IPM.Files', {
			store_entryid: "files",
			parent_entryid: parentid
		});
		
		return record;
	},
	
	/**
	 * Update the current preview {@link Zarafa.core.data.IPMRecord}
	 * This will fire the event {@link #previewrecordchange}.
	 *
	 * @param {mixed} record The record which is set as preview or false to refresh the old record
	 * @param {Boolean} refresh (optinal) true to just refresh the old record
	 * in the {@link #lastPreviewedRecord}.
	 */
	setPreviewRecord : function(record, refresh) {
		if(container.getCurrentContext().getName() === "filescontext") { // otherwhise getContentPanel() will return the wrong panel the first time...
			var previewPanel = Zarafa.plugins.files.data.ComponentBox.getPreviewPanel();
			var panelConstructor;
			
			if(refresh && this.previewRecord) {
				// Just do a complete refresh, clearing all UI components
				// which might be active inside the panel.
				panelConstructor = container.getSharedComponent(Zarafa.core.data.SharedComponentType['common.preview'], this.previewRecord);
				
				previewPanel.removeAll();
				if (Ext.isDefined(panelConstructor)) {
					previewPanel.add(new panelConstructor());
					previewPanel.doLayout();
					previewPanel.fileinfo.update(this.previewRecord);
				}
				
			} else if (this.previewRecord !== record) {
				this.previewRecord = record;
				
				if (Ext.isDefined(record)) {
					panelConstructor = container.getSharedComponent(Zarafa.core.data.SharedComponentType['common.preview'], record);
					
					if (Ext.isDefined(panelConstructor) && previewPanel.fileinfo instanceof panelConstructor) {
						previewPanel.fileinfo.update(record); // panel exists... just update
					} else {
						// Do a complete refresh, clearing all UI components
						// which might be active inside the panel.
						previewPanel.removeAll();
						if (panelConstructor) {
							previewPanel.add(new panelConstructor());
							previewPanel.doLayout();
							previewPanel.fileinfo.update(record);
						}
					}
				}
			}
		}
	},
	
	/**
	 * Returns the default {@link Zarafa.hierarchy.data.MAPIFolderRecord folder} which is
	 * used within the current selection of folders. If this {@link Zarafa.core.ContextModel ContextModel} is not enabled
	 * then this function will return default folder of this context, and if not enabled then it will return
	 * currently selected folder in the ContextModel.
	 * @return {Zarafa.hierarchy.data.MAPIFolderRecord} The default folder
	 */
	getDefaultFolder : function() {
		var pseudoFolder;
		var icon_id = container.getSettingsModel().get('zarafa/v1/contexts/files/iconid');
		var name = container.getSettingsModel().get('zarafa/v1/plugins/files/button_name');
		
		// this is a workaround to get the initial name and icon loading of the context tab working
		// FIXME: this should really be improved!
		pseudoFolder = {
			get : function(item) {
				if(item == "icon_index") {
					return icon_id;
				} 
				return undefined;
			},
			
			getDisplayName : function () {
				return name + " - " + dgettext('plugin_files', 'Files');
			},
			
			getFullyQualifiedDisplayName : function () {
				return name + " - " + dgettext('plugin_files', 'Files');
			},
			
			getParentFolder : function () {
				return undefined;
			},
			
			set : function (item, value) {
			}
		};
		
		// ContextModel is not enabled so return default folder
		return pseudoFolder;
	}
});
