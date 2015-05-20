Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesFileTable
 * @extends Ext.grid.GridPanel
 * @xtype zarafa.filesfilegrid
 * The main gridpanel for our data
 */
Zarafa.plugins.files.ui.FilesFileGrid = Ext.extend(Zarafa.common.ui.grid.GridPanel, {
	/**
	 * @cfg {Zarafa.plugins.files.context.FilesContext} context The context to which this panel belongs
	 */
	context : undefined,
	
	/**
	 * The {@link Zarafa.plugins.files.context.FilesContextModel} which is obtained from the {@link #context}.
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
	 * @constructor
	 * @param {Object} config
	 */
	constructor : function(config) {
		config = config || {};
		
		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context))
			config.model = config.context.getModel();

		if (!Ext.isDefined(config.store) && Ext.isDefined(config.model))
			config.store = config.model.getStore();
			
		config.store = Ext.StoreMgr.lookup(config.store);
		
		Ext.applyIf(config, {
			xtype : 'zarafa.filesfilegrid',
			ddGroup : 'dd.filesrecord',
			id : 'files-gridview',
			enableDragDrop: true,
			border : false,
			stateful : true,
			statefulRelativeDimensions : false,
			loadMask : this.initLoadMask(),
			viewConfig : this.initViewConfig(),
			sm : this.initSelectionModel(),
			cm : this.initColumnModel(),
			keys : {
				key : Ext.EventObject.DELETE,
				handler : this.onKeyDelete,
				scope : this
			}
		});
		Zarafa.plugins.files.ui.FilesFileGrid.superclass.constructor.call(this, config);
		
	},
	
	/**
	 * Initialize event handlers
	 * @private
	 */
	initEvents : function() {
		Zarafa.mail.ui.MailGrid.superclass.initEvents.call(this);

		this.mon(this, 'cellcontextmenu', this.onCellContextMenu, this);
		this.mon(this, 'rowbodycontextmenu', this.onRowBodyContextMenu, this);
		this.mon(this, 'rowdblclick', this.onRowDblClick, this);
		this.mon(this, 'afterrender', this.initDropTarget, this);
		
		// Add a buffer to the following 2 event handlers. These are influenced by Extjs when a record
		// is removed from the store. However removing of records isn't performed in batches. This means
		// that wee need to offload the event handlers attached to removing of records in case that
		// a large batch of records is being removed.
		this.mon(this.getSelectionModel(), 'beforerowselect', this.onBeforeRowSelect, this, { buffer : 1 });
		this.mon(this.getSelectionModel(), 'rowselect', this.onRowSelect, this, { buffer : 1 });
		this.mon(this.getSelectionModel(), 'selectionchange', this.onSelectionChange, this, { buffer : 1 });

		this.mon(this.context, 'viewmodechange', this.onContextViewModeChange, this);
		this.onContextViewModeChange(this.context, this.context.getCurrentViewMode());
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.loadMask} field
	 *
	 * @return {Ext.LoadMask} The configuration object for {@link Ext.LoadMask}
	 * @private
	 */
	initLoadMask : function() {
		return {
			msg : dgettext('plugin_files', 'Loading files') + '...'
		};
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel#viewConfig} field
	 *
	 * @return {Ext.grid.GridView} The configuration object for {@link Ext.grid.GridView}
	 * @private
	 */
	initViewConfig : function() {
		return {
			// enableRowBody is used for enabling the rendering of
			// the second row in the compact view model. The actual
			// rendering is done in the function getRowClass.
			//
			// NOTE: Even though we default to the extended view,
			// enableRowBody must be enabled here. We disable it
			// later in onContextViewModeChange(). If we set false
			// here, and enable it later then the row body will never
			// be rendered. So disabling after initializing the data
			// with the rowBody works, but the opposite will not.
			enableRowBody : false,
			
			// We need a rowselector depth of 15 because of the nested
			// table in the rowBody.
			rowSelectorDepth : 15
		};
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.sm SelectionModel} field
	 *
	 * @return {Ext.grid.RowSelectionModel} The subclass of {@link Ext.grid.AbstractSelectionModel}
	 * @private
	 */
	initSelectionModel : function() {
		return new Ext.grid.RowSelectionModel();
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.cm ColumnModel} field.
	 *
	 * @return {Ext.grid.ColumnModel} The {@link Ext.grid.ColumnModel} for this grid
	 * @private
	 */
	initColumnModel : function() {
		return new Zarafa.plugins.files.ui.FilesFileGridColumnModel();
	},
	
	/**
	 * Initialize the {@link Ext.dd.DropTarget dropTarget}
	 *
	 * @return {Ext.grid.ColumnModel} The {@link Ext.dd.DropTarget dropTarget} for this grid
	 * @private
	 */
	initDropTarget : function () {
		var gridDropTargetEl = this.getView().el.dom.childNodes[0].childNodes[1];
		
		// init browser drag & drop events
		gridDropTargetEl.addEventListener("dragstart", function(e) {
			e.dataTransfer.effectAllowed="copy";
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		gridDropTargetEl.addEventListener("dragenter", function(e) {
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		gridDropTargetEl.addEventListener("dragover", function(e) {
			e.dataTransfer.dropEffect = "copy";
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		gridDropTargetEl.addEventListener("dragleave", function(e) {
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.
		}, false);
		
		gridDropTargetEl.addEventListener("drop", function(e) {
			e.preventDefault(); // Necessary. Allows us to drop.
			e.stopPropagation(); // stops the browser from redirecting.

			var dt = e.dataTransfer;
			var files = dt.files;

			Zarafa.plugins.files.data.Actions.uploadItem(files, Zarafa.plugins.files.data.ComponentBox.getStore());
			
			return false;
		}, false);
		
		// init internal drag & drop
		this.dropTarget = new Ext.dd.DropTarget(gridDropTargetEl, {
			ddGroup    : 'dd.filesrecord',
			copy       : false,
			gridStore  : this.getStore(),
			gridSM     : this.getSelectionModel(),
			notifyDrop : function(ddSource, e, data){
				var cellindex = ddSource.getDragData(e).rowIndex;
				
				if(Ext.isDefined(cellindex) && this.gridStore.getAt(cellindex).get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER) {
					// Disable all selected records
					Ext.each(data.selections, function(record) {
						record.setDisabled(true);
					});
					
					return Zarafa.plugins.files.data.Actions.moveRecords(data.selections,this.gridStore.getAt(cellindex));
				} else 
					return false;
			},
			notifyOver : function(ddSource, e, data){
				var cellindex = ddSource.getDragData(e).rowIndex;
				
				if(Ext.isDefined(cellindex)) {
					// check if we are over a folder - if so, allow drop
					if(this.gridStore.getAt(cellindex).get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER)
						 return this.dropAllowed;
				}
				return this.dropNotAllowed;
			},
			notifyEnter : function(ddSource, e, data){
				var cellindex = ddSource.getDragData(e).rowIndex;
				
				if(Ext.isDefined(cellindex)) {
					// check if we are over a folder - if so, allow drop
					if(this.gridStore.getAt(cellindex).get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER)
						 return this.dropAllowed;
				}
				return this.dropNotAllowed;
			}
		});
		
		this.getView().dragZone.onBeforeDrag = function (data, e){
			return !data.grid.getStore().getAt(data.rowIndex).getDisabled();
		}
	},
	
	/**
	 * Event handler which is fired when the {@link Zarafa.core.Context} fires the
	 * {@link Zarafa.core.Context#viewmodechange viewmodechange} event. This will check
	 * where the preview panel is located, and if needed change the
	 * {@link Ext.grid.Column columns} inside the {@link Ext.grid.ColumnModel ColumnModel}
	 * of the {@link Zarafa.plugins.files.ui.FilesFileGrid FilesFileGrid}. Either use the extended (and more flexible)
	 * set or the more compact set.
	 *
	 * @param {Zarafa.core.Context} context The context which fired the event
	 * @param {Zarafa.plugins.files.data.ViewModes} newViewMode The new active mode
	 * @param {Zarafa.plugins.files.data.ViewModes} oldViewMode The previous mode
	 * @private
	 */
	onContextViewModeChange : function(context, newViewMode, oldViewMode) {
		var compact = newViewMode === Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW;

		this.getColumnModel().setCompactView(compact);
	},
	
	/**
	 * Event handler which is triggered when the user opens the context menu.
	 *
	 * There are some selection rules regarding the context menu. If no rows where
	 * selected, the row on which the context menu was requested will be marked
	 * as selected. If there have been rows selected, but the context menu was
	 * requested on a different row, then the old selection is lost, and the new
	 * row will be selected. If the row on which the context menu was selected is
	 * part of the previously selected rows, then the context menu will be applied
	 * to all selected rows.
	 *
	 * @param {Zarafa.plugins.files.ui.FilesFile} grid The grid which was right clicked
	 * @param {Number} rowIndex The index number of the row which was right clicked
	 * @param {Number} cellIndex The index number of the column which was right clicked
	 * @param {Ext.EventObject} event The event structure
	 * @private
	 */
	onCellContextMenu : function(grid, rowIndex, cellIndex, event) {
		var sm = this.getSelectionModel();
		var cm = this.getColumnModel();

		if (sm.hasSelection()) {
			// Some records were selected...
			if (!sm.isSelected(rowIndex)) {
				// But none of them was the record on which the
				// context menu was invoked. Reset selection.
				sm.clearSelections();
				sm.selectRow(rowIndex);
			}
		} else {
			// No records were selected,
			// select row on which context menu was invoked
			sm.selectRow(rowIndex);
		}

		var column = {};
		// Take into account that the function onRowBodyContextMenu passes -1 as the column index.
		if(cellIndex >= 0)
			column = cm.getColumnById(cm.getColumnId(cellIndex));
			
		var records = sm.getSelections();
		
		var show = true;
		Ext.each(records, function (record) {
			if(record.getDisabled() === true) {
				show = false;
				return;
			}
		});

		if(show) {
			Zarafa.core.data.UIFactory.openDefaultContextMenu(records, { position : event.getXY(), context : this.context, grid : this });
		}
	},

	/**
	 * Event handler which is triggered when the user opems the context menu.
	 *
	 * This will call {@link onCellContextMenu} and pass -1 for the column index to prevent it 
	 * showing a special context menu if one would be set for specific columns.

	 *
	 * @param {Zarafa.plugins.files.ui.FilesFileGrid} grid The grid which was right clicked
	 * @param {Number} rowIndex The index number of the row which was right clicked
	 * @param {Ext.EventObject} event The event structure
	 * @private
	 */
	onRowBodyContextMenu : function(grid, rowIndex, event) {
		this.onCellContextMenu(grid, rowIndex, -1, event);
	},
	
	/**
	 * Event handler which is triggered when the user double-clicks on a particular item in the
	 * grid. This will update the store which 
	 * contains the selected item.
	 *
	 * @param {Grid} grid The Grid on which the user double-clicked
	 * @param {Number} rowIndex The Row number on which was double-clicked.
	 * @param {Ext.EventObject} e The event object
	 * @private
	 */
	onRowDblClick : function(grid, rowIndex, e) {
		var record = grid.store.getAt(rowIndex);
		var navpanel = Zarafa.plugins.files.data.ComponentBox.getNavigatorTreePanel();
		
		if(record.get('type') === Zarafa.plugins.files.data.FileTypes.FOLDER) {
			this.store.loadPath(record.get('id'));
			var node = navpanel.getNodeById(record.get('id'));
			
			if(Ext.isDefined(node) && !node.isLeaf()) {
				node.reload();
			}
		} else
			Zarafa.plugins.files.data.Actions.downloadItem([record]);
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
		var selections = this.getSelectionModel().getSelections();
		var allowDelete = true;
		
		if (!Ext.isEmpty(selections)) {
			Ext.each(selections, function(record) {
				if(record.get('id') === (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") || record.get('filename') === ".." || record.getDisabled() === true)
					allowDelete = false;
			}, this);
			
			var askOnDelete = container.getSettingsModel().get('zarafa/v1/contexts/files/ask_before_delete');
			
			if(allowDelete) {
				if(askOnDelete) {
					Ext.MessageBox.confirm('Confirm deletion', 'Are you sure?',  this.doDelete.createDelegate(this, [selections], true), this);
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
			Zarafa.plugins.files.data.Actions.refreshNavigatorTree();
		}
	},
	
	/**
	 * Event handler which is trigggerd before the user selects a row from the {@link Ext.grid.GridPanel}.
	 * This will updates the {@link Zarafa.files.FilesContextModel FilesContextModel} with the record which 
	 * was selected in the grid for preview
	 *
	 * @param {Ext.grid.RowSelectionModel} selectionModel The selection model used by the grid.
	 * @param {Integer} rowNumber The row number which is selected in the selection model
	 * @param {Boolean} False if other selections will be cleared
	 * @param {Ext.data.Record} record The record which is selected for preview.
	 * @private
	 */
	onBeforeRowSelect: function (sm, rowIndex, keepExisting, record) {
		return !record.getDisabled();
	},
	
	/**
	 * Event handler which is trigggerd when the user selects a row from the {@link Ext.grid.GridPanel}.
	 * This will updates the {@link Zarafa.files.FilesContextModel FilesContextModel} with the record which 
	 * was selected in the grid for preview
	 *
	 * @param {Ext.grid.RowSelectionModel} selectionModel The selection model used by the grid.
	 * @param {Integer} rowNumber The row number which is selected in the selection model
	 * @param {Ext.data.Record} record The record which is selected for preview.
	 * @private
	 */
	onRowSelect : function(selectionModel, rowNumber, record) {
		var viewMode = this.context.getCurrentViewMode();
		
		var count = selectionModel.getCount();

		if(viewMode != Zarafa.plugins.files.data.ViewModes.NO_PREVIEW) {
			if (count == 0)
				this.model.setPreviewRecord(undefined);
			else if (count == 1 && selectionModel.getSelected() === record) {
				if(record.get('id') !== (container.getSettingsModel().get('zarafa/v1/contexts/files/files_path') + "/") && record.get('filename') !== "..")
					this.model.setPreviewRecord(record);
				else
					this.model.setPreviewRecord(undefined);
			}
		}
	},
	
	/**
	 * Event handler which is triggered when the {@link Ext.grid.GridPanel grid}
	 * {@link Zarafa.core.data.IPMRecord record} selection is changed. This will inform
	 * the {@link Zarafa.files.FilesContextModel contextmodel} about the change.
	 *
	 * @param {Ext.grid.RowSelectionModel} selectionModel The selection model used by the grid.
	 * @private
	 */
	onSelectionChange : function(selectionModel) {
		var selections = selectionModel.getSelections();
		var viewMode = this.context.getCurrentViewMode();

		this.model.setSelectedRecords(selections);
		if(viewMode !== Zarafa.plugins.files.data.ViewModes.NO_PREVIEW) {
			if (Ext.isEmpty(selections))
				this.model.setPreviewRecord(undefined);
		}
	}
	
	// TODO: more eventhandlers...
});

Ext.reg('zarafa.filesfilegrid',Zarafa.plugins.files.ui.FilesFileGrid);
