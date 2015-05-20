Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.UploadButton
 * @extends Ext.SplitButton
 * @xtype zarafa.filesuploadbutton
 *
 * Special button which can be used for attaching items to a {@link Zarafa.core.data.IPMRecord IPMRecord}.
 * This utilizes the {@link #main.attachment.method} insertion point to allow plugins to register
 * alternative methods for attaching items to the record. These options will be shown inside the dropdown
 * list, while the default button action will be opening the Browsers File Selection dialog
 *
 * If the {@link Zarafa.core.plugins.RecordComponentUpdaterPlugin} is installed
 * in the {@link #plugins} array of this component, this component will automatically
 * load the {@link Zarafa.core.data.MAPIRecord record} into the component.
 * Otherwise the user of this component needs to call {@link #bindRecord}.
 */
Zarafa.plugins.files.ui.UploadButton = Ext.extend(Ext.SplitButton, {
	/**
	 * @insert main.attachment.method
	 * Provide a new method for attaching files to a {@link Zarafa.core.data.IPMRecord IPMRecord}.
	 * This can be used by 3rd party plugins to insert a new MenuItem into the dropdown
	 * box for the {@link Zarafa.common.attachment.ui.AttachmentButton AttachmentButton}.
	 * This insertion point should return a {@link Ext.menu.Item item} instance of configuration
	 * @param {Zarafa.plugins.files.ui.UploadButton} button This button
	 */
	 
	/**
	 * The {@link Zarafa.plugins.files.FilesContextModel} which is obtained from the {@link #context}.
	 * @property
	 * @type Zarafa.mail.MailContextModel
	 */
	model : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};
		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context))
			config.model = config.context.getModel();

		Ext.applyIf(config, {
			menu : {
				items : [{
					text : dgettext('plugin_files', 'Upload file'),
					iconCls : 'icon_files_category',
					handler : function() { 
						Zarafa.plugins.files.data.Actions.createUploadDialog(this.model);
					},
					scope: this
				},
				{
					text: dgettext('plugin_files', 'Create folder'),
					iconCls : 'icon_createFolder',
					action:'folder', 
					handler: function() { 
						Zarafa.plugins.files.data.Actions.createFolder(this.model); 
					}, 
					scope : this
				}]
			},
			handler : function() {
					this.showMenu();
			},
			scope : this
		});
		Zarafa.plugins.files.ui.UploadButton.superclass.constructor.call(this, config);
	},

	/**
	 * Event handler for opening the Browser's file selection dialog.
	 * See {@link #onFileInputChange} for the handling of the selected files.
	 * @private
	 */
	onFileUpload : function(field, event) {
		Zarafa.plugins.files.data.Actions.createUploadDialog({
			parentID : "myroot",
			scope : this
		});
	}	
});

Ext.reg('zarafa.filesuploadbutton', Zarafa.plugins.files.ui.UploadButton);
