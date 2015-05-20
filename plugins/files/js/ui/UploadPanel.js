Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.UploadPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype zarafa.plugins.files.uploadpanel
 */
Zarafa.plugins.files.ui.UploadPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
	/**
	 * @cfg {Function} callback The callback function which must be called when the
	 * {@link Ext.ux.form.FileUploadField File Input field} has been changed. It will
	 * receive the {@link Ext.form.BasicForm BasicForm} in which the input field is located
	 * as argument.
	 */
	callback : Ext.emptyFn,

	/**
	 * @cfg {Object} scope The scope for the {@link #callback} function
	 */
	scope : undefined,
	
	/**
	 * @cfg {String} parentID
	 */
	parentID : "/",
	
	/**
	 * @cfg {Object} task to check if file was selected
	 */
	updateTask : undefined,
	
	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config) {
		config = config || {};

		Ext.applyIf(config, {
			title : dgettext('plugin_files', 'Select file'),
			layout : 'fit',
			width : 500,
			height : 75,
			items : [{
				xtype : 'form',
				layout: 'fit',
				fileUpload : true,
				ref : 'filesUploadform',
				buttonAlign: 'left',
				padding : 5,
				items : [{
					xtype : 'textfield',
					inputType : 'file',
					ref : 'uploadField',
					style : {
						border: 'none!important'
					},
					autoCreate : {tag: 'input', type: 'text', size: '20', autocomplete: 'off', multiple: 'multiple' },
					name : 'attachments[]',
					listeners : {
						change : this.onUploadFieldChanged,
						scope : this
					}
				}],
				buttons : [{
					xtype : 'displayfield',
					value : dgettext('plugin_files', 'Maximum upload size') + " : "+ Zarafa.plugins.files.data.Helper.Format.fileSize(Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize()),
					htmlEncode : true
				},
				{
					xtype: 'tbfill'
				},
				{
					text : dgettext('plugin_files', 'Upload'),
					ref : '../uploadButton',
					iconCls : 'icon_files',
					handler : this.onUpload,
					disabled: true,
					scope : this
				},
				{
					text : dgettext('plugin_files', 'Cancel'),
					handler : this.onClose,
					scope : this
				}]
			}]
		});

		Zarafa.plugins.files.ui.UploadPanel.superclass.constructor.call(this, config);
		
		// run a background task to check if a file was selected.
		// We have to do this because the onChange handler is only executed
		// if the textfield looses focus.
		// Start a simple clock task that updates a div once per second
		this.updateTask = {
			run: function() {
				this.onUploadFieldChanged(null, this.filesUploadform.uploadField.getValue(),null);
			},
			interval: 1000, //1 second
			scope: this
		}
		
		Ext.TaskMgr.start(this.updateTask);
	},

	/**
	 * Event which is fired when the {@link Ext.ux.form.FileUploadField#fileselected fileselected} was fired.
	 * @private
	 */
	onUpload : function() {		
		// check if the selected file already exists
		var files = this.filesUploadform.uploadField.getEl().dom.files;
		var store = Zarafa.plugins.files.data.ComponentBox.getStore();
		var duplicateFiles = [];
		
		// Immediately hide the dialog, we will close
		// it (destroying the HTML elements) once the
		// upload has completed.
		this.hide();
		
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
				function(button) {
					if(button === "yes") {
						this.doFormSubmit();
					} else {
						this.onClose();
					}
				},
				this
			);
		} else {
			this.doFormSubmit();
		}
	},
	
	/**
	 * This function finally submits the upload form and destroyes the upload dialog.
	 * @private
	 */
	doFormSubmit : function() {
		var form = this.filesUploadform.getForm();
		
		if (form.isValid()) {
			form.submit({
				waitMsg: dgettext('plugin_files', 'Uploading files') + '...',
				url: 'plugins/files/php/upload_file.php',
				params: {
					"parentID" : this.parentID
				},
				failure: this.uploadDone.createDelegate(this, [false], true),
				success: this.uploadDone.createDelegate(this, [true], true),
				scope : this
			});
		}

		form.on('actioncomplete', this.onClose, this, { delay : 5 });
		form.on('actionfailed', this.onClose, this, { delay : 5 });
	},
	
	/**
	 * Called after form submit is complete.
	 *
	 * @param {Ext.form.BasicForm} form
	 * @param {Ext.form.Action} action
	 * @param {Boolean} success
	 * @private
	 */
	uploadDone : function (form, action, success) {
		if(!success) {
			Zarafa.common.dialogs.MessageBox.show({
				title : dgettext('plugin_files', 'Error'),
				msg : action.result.message,
				icon : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		} else {
			Zarafa.plugins.files.data.Actions.clearCache();
			Zarafa.plugins.files.data.ComponentBox.getStore().loadPath(action.result.parent);
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
			var files = this.filesUploadform.uploadField.getEl().dom.files;
			var filesTooLarge = false;
			Ext.each(files, function(file){
				if(file.size > Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize()) {
					// reset the upload field
					this.filesUploadform.uploadField.reset();
					
					// show a warning to the user
					Zarafa.common.dialogs.MessageBox.show({
						title : dgettext('plugin_files', 'Error'),
						msg : String.format(dgettext('plugin_files', 'File "{0}" is too large! Maximum allowed filesize: {1}.'), file.name, Zarafa.plugins.files.data.Helper.Format.fileSize(Zarafa.plugins.files.data.Dynamics.getMaxUploadFilesize())),
						icon : Zarafa.common.dialogs.MessageBox.ERROR,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
					
					// disable upload button
					this.filesUploadform.uploadButton.setDisabled(true);
					filesTooLarge = true;
					return false; // break loop
				} else {
					if(!filesTooLarge) {
						this.filesUploadform.uploadButton.setDisabled(false);
					}
				}
			}, this);
		} else {
			this.filesUploadform.uploadButton.setDisabled(true);
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

Ext.reg('zarafa.plugins.files.uploadpanel', Zarafa.plugins.files.ui.UploadPanel);
