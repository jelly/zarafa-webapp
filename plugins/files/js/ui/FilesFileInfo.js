Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesFileInfo
 * @extends Ext.Panel
 * @xtype zarafa.filesfileinfo
 */
Zarafa.plugins.files.ui.FilesFileInfo = Ext.extend(Ext.form.FormPanel, {

	/**
	 * The default preview image url
	 */
	defaultPreviewImage : 'plugins/files/resources/images/no-preview.jpg',
	
	/**
	 * The record that will be shown
	 * only used in the dialog
	 */
	record : undefined,
	
	/**
	 * @constructor
	 * @param {Object} config configuration object.
	 */
	constructor : function(config) {
		config = config || {};
		var context = Zarafa.plugins.files.data.ComponentBox.getContext();
		var viewMode = context.getCurrentViewMode();		
		
		var layout = {
			type : 'vbox',
			align : 'stretch',
			pack : 'start'
		};
		switch(viewMode) {
			case Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW:
				break;
			case Zarafa.plugins.files.data.ViewModes.BOTTOM_PREVIEW:
				layout = {
					type : 'hbox',
					align : 'stretch',
					pack : 'start'
				};
				break;
			default:
				break;
		}

		config = Ext.applyIf(config, {
			xtype : 'zarafa.filesfileinfo',
			ref : '../fileinfo',
			autoDestroy : true,
			layout : layout,
			border : false,
			items: [
				this.fieldSetFileInfo(),
				this.fieldSetFilePreview()
			]
		});
		
		if(Ext.isDefined(config.record)) {
			this.record = config.record;
			config = Ext.applyIf(config, {
				listeners : {
					afterlayout : function (cmp) {
						this.update(this.record);
					}
				}
			});
		}

		Zarafa.plugins.files.ui.FilesFileInfo.superclass.constructor.call(this, config);
	},
	
	/**
	 * clear the whole ui and redraw it
	 * 
	 */
	refresh : function() {
		this.removeAll();
		this.add(this.fieldSetFileInfo());
		this.add(this.fieldSetFilePreview());
	},
	
	/**
	 * The fieldset for the file infos
	 * @return {Object}
	 */
	fieldSetFileInfo: function() {
		return {
			xtype : 'fieldset',
			title : dgettext('plugin_files', 'File information'),
			height : 150,
			width : 300,
			defaults: {
				anchor: '-3' // leave a litte space
			},
			items : [{
				xtype : 'textfield',
				fieldLabel : dgettext('plugin_files', 'Filename'),
				ref : '../filename',
				value : "unknown",
				readOnly: true
			},
			{
				xtype : 'textfield',
				fieldLabel : dgettext('plugin_files', 'Filesize'),
				ref : '../filesize',
				value : "unknown",
				readOnly: true
			},
			{
				xtype : 'textfield',
				fieldLabel : dgettext('plugin_files', 'Last modified'),
				ref : '../lastmodified',
				value : "unknown",
				readOnly : true
			},
			{
				xtype : 'textfield',
				fieldLabel : dgettext('plugin_files', 'Type'),
				ref : '../type',
				value : "unknown",
				readOnly : true
			}]
		};
	},
	
	/**
	 * The fieldset for the file preview
	 * @return {Object}
	 */
	fieldSetFilePreview : function() {
		var context = Zarafa.plugins.files.data.ComponentBox.getContext();
		var viewMode = context.getCurrentViewMode();
		
		var css = "width: 100%;";
		switch(viewMode) {
			case Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW:
				css = "width: 100%;";
				break;
			case Zarafa.plugins.files.data.ViewModes.BOTTOM_PREVIEW:
				css = "height: 100%;";
				break;
			default:
				break;
		}
		
		return {
			xtype : 'fieldset',
			title : dgettext('plugin_files', 'File preview'),
			ref : 'filepreview',
			flex : 1,
			//defaults : {anchor: '0, 0'},
			defaultType : 'textfield',
			items : [{
				xtype : 'component',
				id : 'previewimage',
				autoEl : { tag: 'img', src: this.defaultPreviewImage, style: css}
			}]
		};
	},
	
	/**
	 * Initialises the file preview panel with the given record
	 * @param {Zarafa.plugins.files.data.FilesRecord} record
	 * @param {String} extension File extension.
	 */
	setPreviewPanel : function (record, extension) {
		var context = Zarafa.plugins.files.data.ComponentBox.getContext();
		var viewMode = context.getCurrentViewMode();
		var mediaEnabled = Ext.ComponentMgr.isRegistered('mediapanel');
		
		var css = "width: 100%;";
		switch(viewMode) {
			case Zarafa.plugins.files.data.ViewModes.RIGHT_PREVIEW:
				css = "width: 100%;";
				break;
			case Zarafa.plugins.files.data.ViewModes.BOTTOM_PREVIEW:
				css = "height: 100%;";
				break;
			default:
				break;
		}
		
		var component = {};
		
		// check extension and decide which preview to show
		if(!Ext.isEmpty(extension) && (/\.(gif|jpg|jpeg|tiff|png)$/i).test(extension)) {
			component = {
				xtype : 'component',
				autoEl : { tag: 'img', src: Zarafa.plugins.files.data.Actions.getDownloadLink(record), style: css}
			}
		} else if (mediaEnabled && !Ext.isEmpty(extension) && (/\.(pdf)$/i).test(extension)) {
			component = {
				xtype : 'mediapanel',
				anchor: '0, 0',
				mediaCfg : {
					mediaType : 'PDF',
					url : Zarafa.plugins.files.data.Actions.getDownloadLink(record),
					unsupportedText : dgettext('plugin_files', 'Sorry - no preview for this PDF file!')
				}
			}
		} else if (!Ext.isEmpty(extension) && (/\.(txt|html|php|js|c|cpp|h|java|sh|bat|log|cfg|conf|tex|py|pl)$/i).test(extension)) {
			component = {
				xtype: 'textarea',
				hideLabel : true,
				readOnly : true,
				anchor: '0, 0',
				listeners : {
					'afterrender' : function () {
						Ext.Ajax.request({
							method : 'GET',
							url : Zarafa.plugins.files.data.Actions.getDownloadLink(record),
							success: function( result, request ){
								var responsetext = result.responseText;
								
								this.setRawValue(responsetext);
							},
							scope : this
						});
					}
				}
			}
		} else if (mediaEnabled && !Ext.isEmpty(extension) && (/\.(mp3|aac|ogg)$/i).test(extension)) {
			component = {
				xtype : 'mediapanel', // could be replaced by Ext.FlashComponent
				anchor: '0, 0',
				mediaCfg : {
					mediaType : 'JWP',
					url : 'plugins/files/resources/flash/player.swf',
					width : '100%',
					height: 100,
					start : false,
					loop : false,
					unsupportedText : dgettext('plugin_files', 'JW FLV Player is not installed/available.'),
					params : {
						wmode : 'transparent',
						allowscriptaccess : 'always',
						allowfullscreen : 'false', // fullscreen wont work in flash
						flashVars : {
							width      : '@width',
							height     : '@height',
							autostart  : '@start',
							file       : Zarafa.plugins.files.data.Actions.getDownloadLink(record,false),
							skin       : 'plugins/files/resources/flash/jwskin/lightrv5/lightrv5.xml',
							type	   : 'sound',
							showdigits : true,
							volume     : 15,
							repeat     : '@loop'
						}
					}
				}
			}
		} else if (mediaEnabled && !Ext.isEmpty(extension) && (/\.(mp4|flv|mov|webm)$/i).test(extension)) {
			component = {
				xtype : 'mediapanel', // could be replaced by Ext.FlashComponent
				anchor: '0, 0',
				mediaCfg : {
					mediaType : 'JWP',
					url : 'plugins/files/resources/flash/player.swf',
					width : '100%',
					start : false,
					loop : false,
					unsupportedText : dgettext('plugin_files', 'JW FLV Player is not installed/available.'),
					params : {
						wmode : 'transparent',
						allowscriptaccess : 'always',
						allowfullscreen : 'false', // fullscreen wont work in flash
						flashVars : {
							width      : '@width',
							height     : '@height',
							autostart  : '@start',
							file       : Zarafa.plugins.files.data.Actions.getDownloadLink(record,false),
							skin       : 'plugins/files/resources/flash/jwskin/lightrv5/lightrv5.xml',
							type	   : 'video',
							showdigits : true,
							volume     : 15,
							repeat     : '@loop'
						}
					}
				}
			}
		} else {
			component = {
				xtype : 'component',
				autoEl : { tag: 'img', src: this.defaultPreviewImage, style: css}
			}
		}
		
		this.filepreview.removeAll(true);
		this.filepreview.add(component);
		this.filepreview.doLayout();    
	},
	
	/**
	 * Updates the container by loading data from the record data into the {@link #template}
	 * 	
	 * @param {Zarafa.core.data.IPMRecord} record The record to update the header panel with
	*/	
	update : function(record) {	
		//TODO: change layout of parent container!		
		var extension = this.getExtension(record.get('filename'));
		
		this.filename.setValue(record.get('filename'));
		if(record.get('type') == Zarafa.plugins.files.data.FileTypes.FILE) {
			this.filesize.show();
			this.filesize.setValue(Zarafa.plugins.files.data.Helper.Format.fileSize(record.get('message_size')));
		} else {
			this.filesize.hide();
		}
		this.lastmodified.setValue(Ext.util.Format.date(new Date(record.get('lastmodified')), dgettext('plugin_files', 'd.m.Y G:i')));
		this.type.setValue(record.get('type') == Zarafa.plugins.files.data.FileTypes.FILE ? String.format(dgettext('plugin_files', 'File ({0})'), extension) : dgettext('plugin_files', 'Folder'));
		
		this.setPreviewPanel(record, extension);
	},

	/**
	 * Called when this component is being rendered into a container.
	 * This will create a {@link #wrap} element around the iframe for
	 * better organize the scrolling.
	 *
	 * @param {Ext.Container} ct The container into which this component is being rendered
	 * @param {Number} position The position inside the container where this component is being rendered
	 * @private
	 */
	onRender : function(ct, position) {
		Zarafa.plugins.files.ui.FilesFileInfo.superclass.onRender.call(this, ct, position);
		this.wrap = this.el.wrap({cls: 'preview-body'});
		this.resizeEl = this.positionEl = this.wrap;
	},
	
	/**
	 * Get the extension from the filename
	 *
	 * @param {String} Filename
	 * @return {String} Extension string
	 */
	getExtension : function(filename) {
		var i = filename.lastIndexOf('.');
		return (i < 0) ? '' : filename.substr(i);
	}
});

Ext.reg('zarafa.filesfileinfo', Zarafa.plugins.files.ui.FilesFileInfo);
