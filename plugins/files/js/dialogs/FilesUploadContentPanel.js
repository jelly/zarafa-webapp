Ext.namespace('Zarafa.plugins.files.dialogs');

/**
 * @class Zarafa.plugins.files.dialogs.FilesUploadContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype zarafa.filesuploadcontentpanel
 */
Zarafa.plugins.files.dialogs.FilesUploadContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * Target folder for uploaded files
	 *
	 */
	targetFolder : undefined,
	
	/**
	 * @cfg {Object} task to check if file was selected
	 */
	updateTask : undefined,
	
	/**
 	 * @constructor
	 * @param {Object} config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};

		// Add in some standard configuration data.
		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'zarafa.filesuploadcontentpanel',
			// Override from Ext.Panel
			layout : 'fit',
			title : dgettext('plugin_files', 'Upload file'),
			items: [{
				xtype : 'form',
				ref : 'mainuploadform',
				layout: {
					type : 'vbox',
					align : 'stretch',
					pack : 'start'
				},
				fileUpload : true,
				padding : 5,				
				items : [
					this.createFolderSelector(),
					this.createUploadField()					
				],
				buttons : this.createActionButtons()
			}]
		});
		
		// Call parent constructor
		Zarafa.plugins.files.dialogs.FilesUploadContentPanel.superclass.constructor.call(this, config);
		
		// run a background task to check if a file was selected.
		// We have to do this because the onChange handler is only executed
		// if the textfield looses focus.
		// Start a simple clock task that updates a div once per second
		this.updateTask = {
			run: function() {
				this.onUploadFieldChanged(null, this.mainuploadfield.getValue(),null);
			},
			interval: 1000, //1 second
			scope: this
		}
		
		Ext.TaskMgr.start(this.updateTask);
	},

	/**
	 * Creates a panel that includes a inputfield of type file.
	 * Every current browser will render a button to choose files.
	 * @return {Array}
	 * @private
	 */
	createUploadField : function() {
		return {
			xtype : 'panel',
			title : dgettext('plugin_files', 'Select a file') + ' (' + dgettext('plugin_files', 'Maximum upload size') + ': ' + Zarafa.plugins.files.data.Helper.Format.fileSize(Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize()) + '):',
			layout : 'form',
			height : 55,
			items : [{
				xtype : 'textfield',
				inputType : 'file',
				style : {
					border: 'none!important'
				},
				autoCreate : {tag: 'input', type: 'text', size: '20', autocomplete: 'off', multiple: 'multiple' },
				name : 'attachments[]',
				hideLabel : true,
				anchor : '100%',
				ref : '../../mainuploadfield',
				disabled : true,
				listeners : {
					change : this.onUploadFieldChanged,
					scope : this
				}
			}]
		};
	},
	
	/**
	 * Creates a treepanel where users could select the destination dir.
	 * @return {Array}
	 * @private
	 */
	createFolderSelector : function() {
		return {
			xtype : 'treepanel',
			anchor : '0, 0',
			flex : 1,
			title : dgettext('plugin_files', 'Select upload folder') + ':',
			root : {
				nodeType : 'async',
				text : '/',
				id : '/',
				expanded : true
			},
			autoScroll : true,
			viewConfig : {
				style :	{ overflow: 'auto', overflowX: 'hidden' }
			},
			maskDisabled : true,
			listeners : {
				click : function(n) {
					this.targetFolder = n.attributes.id;
					this.mainuploadfield.enable();
				},
				scope : this
			},
			loader : new Zarafa.plugins.files.data.DirectoryLoader({loadfiles: false})
		};
	},
	
	/**
	 * Creates action button for uploading the file
	 * @return {Array}
	 * @private
	 */
	createActionButtons : function() {
		return[{
			xtype   : 'button',
			ref : '../../mainuploadbutton',
			disabled : true,
			text    : '&nbsp;&nbsp;' + dgettext('plugin_files', 'Upload'),
			tooltip : {
				title   : dgettext('plugin_files', 'Store selected file'),
				text    : dgettext('plugin_files', String.format('Upload file to the selected {0} folder', container.getSettingsModel().get('zarafa/v1/plugins/files/button_name')))
			},
			iconCls : 'icon_files',
			handler : this.uploadFile,
			scope   : this
		},
		{
			xtype   : 'button',
			text    : dgettext('plugin_files', 'Cancel'),
			tooltip : {
				title   : dgettext('plugin_files', 'Cancel'),
				text    : dgettext('plugin_files', 'Close this window')
			},
			handler : this.onClose,
			scope   : this
		}];
	},
	
	/**
	 * This function is called on the upload button click.
	 * It checks the files for duplicates.
	 * @private
	 */
	uploadFile : function () {
		var fileStore = Zarafa.plugins.files.data.ComponentBox.getStore();
		
		fileStore.mon('load', this.checkForDuplicate , this, {single: true});
		fileStore.loadPath(this.targetFolder);
	},
	
	/**
	 * This function is called after the {@Zarafa.plugins.files.data.FilesStore} has loaded the target folder.
	 * It will check if one of the selected files already exists in the store. If there is a duplicate file
	 * a warning will be shown.
	 *
	 * @param {Ext.data.Store} store
	 * @param {Ext.data.Record[]} records The Records that were loaded
	 * @param {Object} options The loading options that were specified (see {@link #load} for details)
	 */
	checkForDuplicate : function(store, records, options) {
		// check if the selected file already exists
		var files = this.mainuploadfield.getEl().dom.files;
		var duplicateFiles = [];
		
		Ext.each(files, function(file){
			var recId = store.findExact("id", store.getPath() + file.name);
			
			if(recId != -1) {
				duplicateFiles.push(store.getById(recId));
			}
		});
		
		if(duplicateFiles.length > 0) {
			// Store already contains file - warn user.
			Ext.MessageBox.confirm(
				dgettext('plugin_files', 'Confirm overwrite'), 
				dgettext('plugin_files', 'File already exists. Do you want to overwrite it?'),
				this.doFormSubmit,
				this
			);
		} else {
			this.doFormSubmit();
		}
	},
	
	/**
	 * This function finally submits the upload form and destroyes the upload dialog.
	 * @param {String} button
	 * @private
	 */
	doFormSubmit : function(button) {
		if(!Ext.isDefined(button) || button === "yes") {
			var form = this.mainuploadform.getForm();
			
			if (form.isValid() && Ext.isDefined(this.targetFolder)) {
				form.submit({
					waitMsg: dgettext('plugin_files', 'Uploading files') + '...',
					url: 'plugins/files/php/upload_file.php',
					params: {
						"parentID" : this.targetFolder
					},
					failure: function(file, action) {
						Zarafa.common.dialogs.MessageBox.show({
							title : dgettext('plugin_files', 'Error'),
							msg : action.result.message,
							icon : Zarafa.common.dialogs.MessageBox.ERROR,
							buttons : Zarafa.common.dialogs.MessageBox.OK
						});
					},
					success: function(file, action) {
						var ocontext = container.getContextByName('filescontext'); // dont use ComponentBox ... we need the files context
						Zarafa.plugins.files.data.Actions.clearCache(false);
						ocontext.model.store.loadPath(action.result.parent);
					},
					scope : this
				});
			} 

			form.mon('actioncomplete', this.onClose, this, { delay : 5 });
			form.mon('actionfailed', this.onClose, this, { delay : 5 });
		}
	},
	
	/**
	 * Function is called on change of the textfield.
	 * @param {Object} field The textfield
	 * @param {String} newValue
	 * @param {String} oldValue
	 */
	onUploadFieldChanged : function(field, newValue, oldValue) {
		if(!Ext.isEmpty(newValue)) {
			// check if the filesize is under the limit
			var files = this.mainuploadfield.getEl().dom.files;
			var filesTooLarge = false;
			Ext.each(files, function(file){
				if(file.size > Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize()) {
					// reset the upload field
					this.mainuploadfield.reset();
					
					// show a warning to the user
					Zarafa.common.dialogs.MessageBox.show({
						title : dgettext('plugin_files', 'Error'),
						msg : String.format(dgettext('plugin_files', 'File "{0}" is too large! Maximum allowed filesize: {1}.'), file.name, Zarafa.plugins.files.data.Helper.Format.fileSize(Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize())),
						icon : Zarafa.common.dialogs.MessageBox.ERROR,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
					
					// disable upload button
					this.mainuploadbutton.setDisabled(true);
					filesTooLarge = true;
					return false; // break loop
				} else {
					if(!filesTooLarge) {
						this.mainuploadbutton.setDisabled(false);
					}
				}
			}, this);
			
		} else {
			this.mainuploadbutton.setDisabled(true);
		}
	},
	
	/**
	 * Function is called on close of this dialog
	 */
	onClose : function() {
		Ext.TaskMgr.stop(this.updateTask);
		this.close();
	}
});

Ext.reg('zarafa.filesuploadcontentpanel', Zarafa.plugins.files.dialogs.FilesUploadContentPanel);
