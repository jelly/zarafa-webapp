Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesFileGridColumnModel
 * @extends Zarafa.common.ui.grid.ColumnModel
 *
 * The {@link Zarafa.plugins.files.ui.FilesFileGridColumnModel FilesFileGridColumnModel}
 * is the default {@link Ext.grid.ColumnModel ColumnModel} containing two
 * different sets of {@link Ext.grid.Column columns}. The first set contains
 * all {@link Ext.grid.Column columns} which should be available in the
 * {@link Zarafa.plugins.files.ui.FilesFileGrid FilesFileGrid} (either hidden by default,
 * or directly visible). For a more compact view, a more compact set is
 * provided. Switching between the two sets can be done using
 * {@link Zarafa.plugins.files.ui.FilesFileGridColumnModel.useCompactView useCompactView}
 * during configuration, or {@link Zarafa.plugins.files.ui.FilesFileGridColumnModel.setCompactView setCompactView}
 * when the {@link Zarafa.plugins.files.ui.FilesFileGridColumnModel FilesFileGridColumnModel} is already active.
 */
Zarafa.plugins.files.ui.FilesFileGridColumnModel = Ext.extend(Zarafa.common.ui.grid.ColumnModel, {
	/**
	 * @cfg {Boolean} useCompactView If true the compact column model will be
	 * used by default. Otherwise the default column model will be used which
	 * contains all possible columns.
	 */
	useCompactView : false,
	
	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};

		this.defaultColumns = this.createDefaultColumns();
		this.compactColumns = this.createCompactColumns();

		Ext.applyIf(config, {
			columns: this.defaultColumns,
			defaults: {
				sortable: true
			}
		});

		// Switch to compact view if needed
		if (config.useCompactView === true)
			config.columns = this.compactColumns;

		Ext.apply(this, config);

		Zarafa.plugins.files.ui.FilesFileGridColumnModel.superclass.constructor.call(this, config);
	},

	/**
	 * Create an array of {@link Ext.grid.Column columns} which must be visible within
	 * the default view of this {@link Ext.grid.ColumnModel ColumnModel}.
	 *
	 * @return {Ext.grid.Column[]} The array of columns
	 * @private
	 */
	createDefaultColumns : function() {
		return [{
			id : 'type',
			dataIndex : 'type',
			header : '<p class="icon_index">&nbsp;</p>',
			renderer : Zarafa.plugins.files.data.Helper.Renderer.typeRenderer,
			width: 24,
			fixed : true,
			tooltip : dgettext('plugin_files', 'Sort by: Type')
		},
		{
			header : 'ID',
			dataIndex : 'id',
			width: 50,
			hidden: true,
			tooltip : dgettext('plugin_files', 'Sort by: ID')
		},
		{
			header : 'Path',
			dataIndex : 'path',
			width: 100,
			hidden: true,
			tooltip : dgettext('plugin_files', 'Sort by: Path')
		},
		{
			header : dgettext('plugin_files', 'Filename'),
			dataIndex : 'filename',
			width : 160,
			tooltip : dgettext('plugin_files', 'Sort by: Filename')
		},
		{
			header : dgettext('plugin_files', 'Last modified'),
			dataIndex : 'lastmodified',
			width : 160,
			renderer : Zarafa.plugins.files.data.Helper.Renderer.datetimeRenderer,
			tooltip : dgettext('plugin_files', 'Sort by: Last modified')
		},
		{
			header : dgettext('plugin_files', 'Size'),
			dataIndex : 'message_size',
			css: 'text-align:right;', // only align column content to the right
			width : 80,
			renderer : Zarafa.plugins.files.data.Helper.Format.fileSizeList,
			tooltip : dgettext('plugin_files', 'Sort by: Size')
		}];
	},	

	/**
	 * Create an array of {@link Ext.grid.Column columns} which must be visible within
	 * the compact view of this {@link Ext.grid.ColumnModel ColumnModel}.
	 *
	 * @return {Ext.grid.Column[]} The array of columns
	 * @private
	 */
	createCompactColumns : function() {
		return [{
			id : 'column_type',
			dataIndex : 'type',
			header : '<p class="icon_index">&nbsp;</p>',
			renderer : Zarafa.plugins.files.data.Helper.Renderer.typeRenderer,
			width: 24,
			fixed : true,
			tooltip : dgettext('plugin_files', 'Sort by: Type')
		},
		{
			header : dgettext('plugin_files', 'Filename'),
			dataIndex : 'filename',
			width : 160,
			tooltip : dgettext('plugin_files', 'Sort by: Filename')
		},
		{
			header : dgettext('plugin_files', 'Last modified'),
			dataIndex : 'lastmodified',
			width : 100,
			renderer : Zarafa.plugins.files.data.Helper.Renderer.datetimeRenderer,
			tooltip : dgettext('plugin_files', 'Sort by: Last modified')
		},
		{
			header : dgettext('plugin_files', 'Size'),
			dataIndex : 'message_size',
			css: 'text-align:right;', // only align column content to the right
			width : 80,
			hidden: true,
			renderer : Zarafa.plugins.files.data.Helper.Format.fileSizeList,
			tooltip : dgettext('plugin_files', 'Sort by: Size')
		}];
	},

	/**
	 * This will switch the {@link Zarafa.plugins.files.ui.FilesFileGridColumnModel columnmodel}
	 * configuration to either the compact or extended configuration.
	 *
	 * @param {Boolean} compact True to enable the compact view
	 */
	setCompactView : function(compact) {
		if (this.useCompactView !== compact) {
			this.useCompactView = compact;

			if (compact) {
				this.name = 'compact';
				// Extjs will store the this.columns into this.config after it has constructed
				// all the columns. At that point this.columns consists of the configuration objects,
				// while this.columns consists of all the allocated columns.
				this.defaultColumns = this.config;
				this.columns = this.compactColumns;
			} else {
				this.name = 'default';
				this.compactColumns = this.config;
				this.columns = this.defaultColumns;
			}

			this.setConfig(this.columns, false);
		}
	}
});
