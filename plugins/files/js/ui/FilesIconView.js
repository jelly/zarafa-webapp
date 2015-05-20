Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesIconView
 * @extends Zarafa.common.ui.DraggableDataView
 * @xtype zarafa.filesiconview
 */
Zarafa.plugins.files.ui.FilesIconView = Ext.extend(Zarafa.common.ui.DraggableDataView, {
	/**
	 * @cfg {Zarafa.plugins.files.context.FilesContext} context The context to which this panel belongs
	 */
	context : undefined,

	/**
	 * The {@link Zarafa.plugins.files.context.FilesContextModel} which is obtained from
	 * the {@link #context}.
	 *
	 * @property
	 * @type Zarafa.plugins.files.context.FilesContextModel
	 */
	model : undefined,
	
	/**
	 * The dropZone used by this grid if drop is enabled
	 * @property
	 */
	dropTarget : undefined,
	
	/**
	 * Keymap ({@link Ext.KeyMap})for handling keyboard events.
	 * @property
	 */
	keyMap : undefined,

	/**
	 * @constructor
	 * @param {object} configuration object
	 */
	constructor : function(config) {
		config = config || {};

		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context)) {
			config.model = config.context.getModel();
		}
		if (!Ext.isDefined(config.store) && Ext.isDefined(config.model)) {
			config.store = config.model.getStore();
		}

		config.store = Ext.StoreMgr.lookup(config.store);

		config.plugins = Ext.value(config.plugins, []);
		config.plugins.push('zarafa.icondragselectorplugin');

		Ext.applyIf(config, {
			xtype		:'zarafa.filesiconview',
			//id : 'files-iconview',
			cls : 'zarafa-files-iconview',
			loadingText : dgettext('plugin_files', 'Loading files') + '...',
			deferEmptyText: false,
			autoScroll: true,
			emptyText	: '<div class="emptytext">' + _('There are no items to show in this view') + '</div>',
			overClass	:'zarafa-files-iconview-over',
			tpl			: this.initTemplate(),
			multiSelect	: true,
			selectedClass:'zarafa-files-iconview-selected',
			itemSelector:'div.zarafa-files-iconview-thumb',
			enableDragDrop: true,
			ddGroup : 'dd.filesrecord'
		});

		Zarafa.plugins.files.ui.FilesIconView.superclass.constructor.call(this, config);

		this.initEvents();
	},

	/*
	 * Initialize html template by setting file type icon and file name
	 * @private
	 */
	initTemplate : function() {
		return new Ext.XTemplate(
			'<div style="height: 100%; width: 100%; overflow: auto;">',
				'<tpl for=".">',
					'<div class="zarafa-files-iconview-container {.:this.getHidden}">',
						'<div class="zarafa-files-iconview-thumb {.:this.getTheme} {.:this.getHidden}">',
							'{.:this.getImage}',
						'</div>',
						'<span class="zarafa-files-iconview-subject">{filename:htmlEncode}</span>',
					'</div>',
				'</tpl>',
			'</div>',
			{
				/**
				 * @param {Object} the record data
				 * @return {String}
				 */
				getHidden : function(record) {
					if(record.filename === "..") {
						return "files_type_hidden";
					}
					
					return "";
				},
				
				/**
				 * @param {Object} the record data
				 * @return {String}
				 */
				getTheme : function(record) {
					
					switch (record.type) {
						case Zarafa.plugins.files.data.FileTypes.FOLDER:
							return Zarafa.plugins.files.data.Helper.File.getIconClass("folder");
							break;
						case Zarafa.plugins.files.data.FileTypes.FILE:
							return Zarafa.plugins.files.data.Helper.File.getIconClass(record.filename);
							break;
						default:
							return 'files48icon_blank';
							break;
					}
				},
				
				/**
				 * @param {Object} the record data
				 * @return {String}
				 */
				getImage : function(record) {
					var extension = Zarafa.plugins.files.data.Helper.File.getExtension(record.filename).toLowerCase();
					var imageExtension = ["jpg", "gif", "png", "bmp"];
					
					var cls = "";
					var src = "";
					var img = "";
					if(Ext.isEmpty(extension) || imageExtension.indexOf(extension) === -1) {
						cls = "files_type_hidden ";
					} else {
						var store = Zarafa.plugins.files.data.ComponentBox.getStore();
						var rec = store.getById(record.id);
						if(Ext.isDefined(rec)) {
							src = rec.getThumbnailImageUrl(40, 50);
						}
					}
					
					switch (record.type) {
						case Zarafa.plugins.files.data.FileTypes.FOLDER:
							cls = "files_image files_type_hidden";
							break;
						case Zarafa.plugins.files.data.FileTypes.FILE:
							cls = cls + "files_image";
							break;
						default:
							cls = 'files_image_hidden';
							break;
					}
					
					if(!Ext.isEmpty(src)) {
						img = '<img class="' + cls + '" src="' + src + '" />';
					}
					
					return img;
				}
			}
		);
	},

	/**
	 * Returns {@link Zarafa.note.ui.NoteMainPanel NoteMainPanel} object which instantiated all the views
	 * @return {Zarafa.note.ui.NoteMainPanel} note main panel
	 */
	getMainPanel : function() {
		return this.ownerCt;
	},

	/**
	 * initialize events for the grid panel
	 * @private
	 */
	initEvents : function() {
		this.on({
			'contextmenu': this.onFilesIconContextMenu,
			'dblclick': this.onIconDblClick,
			'selectionchange': this.onSelectionChange,
			'afterrender': this.onAfterRender,
			scope : this
		});
	},
	
	/**
	 * Called after this component was rendered
	 *
	 * @private
	 */
	onAfterRender : function () {
		// init keyboard functions
		this.keyMap = new Ext.KeyMap(this.getEl(),{                
            key: Ext.EventObject.DELETE,
            fn: this.onKeyDelete.createDelegate(this)
		});
	
		// init drop targets
		this.initDropTarget();
	},
	
	/**
	 * Event handler which is triggered when the user uses the delete button on a particular item in the
	 * grid. This will update the store which 
	 * contains the selected item.
	 *
	 * @param {Number} key The key code
	 * @param {Ext.EventObject} e The event object
	 * @private
	 */
	onKeyDelete : function(key, event) {
		var selections = this.getSelectedRecords();
		var allowDelete = true;
		
		if (!Ext.isEmpty(selections)) {
			Ext.each(selections, function(record) {
				if(record.get('id') === (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") || record.get('filename') === ".." || record.getDisabled() === true)
					allowDelete = false;
			}, this);
			
			var askOnDelete = container.getSettingsModel().get('zarafa/v1/contexts/files/ask_before_delete');
			
			if(allowDelete) {
				if(askOnDelete) {
					Ext.MessageBox.confirm('Confirm deletion', 'Are you sure?', this.doDelete.createDelegate(this, [selections], true), this);
				} else {
					this.doDelete("yes", null, null, selections);
				}
			}
		}
	},
	
	/**
	 * Delete the selected files.
	 *
	 * @param {String} button The value of the button
	 * @param {String} text Unused
	 * @param {Object} options Unused
	 * @param {Array} records (@Zarafa.plugins.files.data.FilesRecord)
	 * @private
	 */
	doDelete : function (button, value, options, selections) {
		if(!Ext.isDefined(button) || button === 'yes') {
			Zarafa.common.Actions.deleteRecords(selections);
			
			// refresh
			Zarafa.plugins.files.data.Actions.clearCache();
		}
	},
	
	/**
	 * Initialize the {@link Ext.dd.DropTarget dropTarget}
	 *
	 * @private
	 */
	initDropTarget : function () {
		var iconViewDropTargetEl = this.getEl();
		
		// init browser drag & drop events
		iconViewDropTargetEl.dom.addEventListener("dragstart", function(e) {
			e.dataTransfer.effectAllowed="copy";
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		iconViewDropTargetEl.dom.addEventListener("dragenter", function(e) {
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		iconViewDropTargetEl.dom.addEventListener("dragover", function(e) {
			e.dataTransfer.dropEffect = "copy";
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		iconViewDropTargetEl.dom.addEventListener("dragleave", function(e) {
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		iconViewDropTargetEl.dom.addEventListener("drop", function(e) {
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.

			var dt = e.dataTransfer;
			var files = dt.files;

			Zarafa.plugins.files.data.Actions.uploadItem(files, Zarafa.plugins.files.data.ComponentBox.getStore());
			
			return false;
		}, false);
		
		// init internal drag & drop
		this.dropTarget = new Ext.dd.DropTarget(iconViewDropTargetEl, {
			ddGroup    : 'dd.filesrecord',
			copy       : false,
			fileStore  : this.getStore(),
			notifyDrop : function(ddSource, e, data){
				var dragData = ddSource.getDragData(e);
				
				if(Ext.isDefined(dragData)) {
					var cellindex = dragData.index;
					if(Ext.isDefined(cellindex) && this.fileStore.getAt(cellindex).get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER) {
						// Disable all selected records
						Ext.each(data.selections, function(record) {
							record.setDisabled(true);
						});
						
						return Zarafa.plugins.files.data.Actions.moveRecords(data.selections,this.fileStore.getAt(cellindex));
					}
				}
				
				return false;
			},
			notifyOver : function(ddSource, e, data){
				var dragData = ddSource.getDragData(e);
				
				if(Ext.isDefined(dragData)) {
					var cellindex = dragData.index;
					
					if(Ext.isDefined(cellindex)) {
						// check if we are over a folder - if so, allow drop
						if(this.fileStore.getAt(cellindex).get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER)
							 return this.dropAllowed;
					}
				}
				return this.dropNotAllowed;
			},
			notifyEnter : function(ddSource, e, data){
				var dragData = ddSource.getDragData(e);
				
				if(Ext.isDefined(dragData)) {
					var cellindex = dragData.index;
				
					if(Ext.isDefined(cellindex)) {
						// check if we are over a folder - if so, allow drop
						if(this.fileStore.getAt(cellindex).get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER)
							 return this.dropAllowed;
					}
				}
				return this.dropNotAllowed;
			}
		});
		
		this.dragZone.onBeforeDrag = function (data, e){
			return !this.view.getStore().getAt(data.index).getDisabled();
		}
	},

	/*
	 * Event handler which is triggered when user opens context menu
	 * @param {Ext.DataView} dataview dataview object
	 * @param {Number} rowIndex	index of row
	 * @param {node} target html node
	 * @param {Ext.event} eventObj eventObj object of the event
	 * @private
	 */
	onFilesIconContextMenu: function(dataview, index, node, eventObj) {
		// check row is already selected or not, if its not selected then select it first
		if (!dataview.isSelected(node)) {
			dataview.select(node);
		}
		
		var records = dataview.getSelectedRecords();
		
		var show = true;
		Ext.each(records, function (record) {
			if(record.getDisabled() === true) {
				show = false;
				return;
			}
		});

		if(show) {
			Zarafa.core.data.UIFactory.openDefaultContextMenu(records, { position : eventObj.getXY(), context : this.context });
		}
	},

	/**
	 * Display open dialog on mouse double click
	 * @param {object} dataview object
	 * @param {Number} integer index number of selected record
	 * @param {node} target html node
	 * @param {object} event object
	 * @private
	 */
	onIconDblClick:function(dataview,index,node,event) {
		var record = this.getStore().getAt(index);
		var navpanel = Zarafa.plugins.files.data.ComponentBox.getNavigatorTreePanel();
		
		if(record.get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER) {
			this.store.loadPath(record.get('id'));
			var navnode = navpanel.getNodeById(record.get('id'));
			
			if(Ext.isDefined(navnode) && !navnode.isLeaf()) {
				navnode.reload();
			}
		} else
			Zarafa.plugins.files.data.Actions.downloadItem([record]);
	},

	/**
	 * Event handler which is triggered when the {@link Zarafa.plugins.files.ui.FilesIconView FilesIconView}
	 * {@link Zarafa.plugins.files.data.FilesRecord record} selection is changed. This will inform
	 * the {@link Zarafa.plugins.files.context.FilesContextModel contextmodel} about the change.
	 *
	 * @param {Zarafa.plugins.files.ui.FilesIconView} dataView The view object.
	 * @param {HTMLElement[]} selection Array of selected nodes.
	 * @private
	 */
	onSelectionChange : function(dataView, selections) {
		this.model.setSelectedRecords(dataView.getSelectedRecords());
		
		var viewMode = this.context.getCurrentViewMode();
		
		var records = dataView.getSelectedRecords();
		var count = records.length;
		
		if(viewMode != Zarafa.plugins.files.data.ViewModes.NO_PREVIEW) {
			if (count != 1)
				this.model.setPreviewRecord(undefined);
			else if (count == 1) {
				if(records[0].get('id') !== (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") && records[0].get('filename') !== "..")
					this.model.setPreviewRecord(records[0]);
				else
					this.model.setPreviewRecord(undefined);
			}
		}
	}
});
//register xtype filesiconview
Ext.reg('zarafa.filesiconview', Zarafa.plugins.files.ui.FilesIconView);
