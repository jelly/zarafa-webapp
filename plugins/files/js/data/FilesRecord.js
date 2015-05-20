Ext.namespace('Zarafa.plugins.files.data');

/**
 * @class Zarafa.plugins.files.FilesRecordFields
 * Array of {@link Ext.data.Field field} configurations for the
 * {@link Zarafa.core.data.IPMRecord IPMRecord} object.
 * These fields will be available in all 'IPM.Files' type messages.
 */
Zarafa.plugins.files.data.FilesRecordFields = [
	{name: 'id'},
	{name: 'path'},
	{name: 'type', type: 'int', defaultValue: Zarafa.plugins.files.data.FileTypes.FOLDER},
	{name: 'filename'},
	{name: 'lastmodified', type: 'int', defaultValue: null},
	{name: 'message_size', type: 'int', defaultValue: 0}
];

/**
 * @class Zarafa.core.data.IPMAttachmentRecord
 * @extends Ext.data.Record
 */
Zarafa.plugins.files.data.FilesRecord = Ext.extend(Zarafa.core.data.IPMRecord, {
	/**
	 * Sets the current record to disabled state
	 */
	disabled : false,
	
	/**
	 * Applies all data from an {@link Zarafa.plugins.files.data.FilesRecord FilesRecord}
	 * to this instance. This will update all data.
	 * 
	 * @param {Zarafa.plugins.files.data.FilesRecord} record The record to apply to this
	 * @return {Zarafa.plugins.files.data.FilesRecord} this
	 */
	applyData : function(record) {
		this.beginEdit();

		Ext.apply(this.data, record.data);
		Ext.apply(this.modified, record.modified);
		
		this.dirty = record.dirty;

		this.endEdit(false);

		return this;
	},

	/**
	 * Builds and returns inline image URL to download inline images,
	 * it uses {@link Zarafa.core.data.IPMRecord IPMRecord} to get store and message entryids.
	 * @return {String} URL for downloading inline images.
	 */
	getInlineImageUrl : function() {
		var link = "";
		
		link += "plugins/files/php/proxy.php?" + Ext.urlEncode({id: this.get('id'), inline: true});

		return link;
	},

	/**
	 * Builds and returns attachment URL to download attachment,
	 * it uses {@link Zarafa.core.data.IPMRecord IPMRecord} to get store and message entryids.
	 * @return {String} URL for downloading attachment.
	 */
	getAttachmentUrl : function() {
		var link = "";
		
		var url = document.URL;
		link = url.substring(0, url.lastIndexOf('/') + 1); // we need the absolute url for jwplayer...
		
		link += "plugins/files/php/proxy.php?" + Ext.urlEncode({id: this.get('id'), inline: false});

		return link;
	},
	
	/**
	 * Builds and returns inline thumbnail image URL to download show images,
	 * it uses {@link Zarafa.core.data.IPMRecord IPMRecord} to get store and message entryids.
	 * @param {Integer} width Width of the thumbnail
	 * @param {Integer} height Height of the thumbnail
	 * @return {String} URL for downloading inline images.
	 */
	getThumbnailImageUrl : function(width, height) {
		var link = "";
		
		link += "plugins/files/php/proxy.php?" + Ext.urlEncode({id: this.get('id'), inline: false, thumb: true, width: width, height: height});

		return link;
	},
	
	/**
	 * Set the disabled flag
	 * @param {Boolean} state
	 */
	setDisabled : function (state) {
		this.disabled = state;
	},
	
	/**
	 * Get the disabled flag
	 * @return {Boolean}
	 */
	getDisabled : function () {
		return this.disabled;
	}
});

Zarafa.core.data.RecordCustomObjectType.addProperty('ZARAFA_FILES');

Zarafa.core.data.RecordFactory.addFieldToMessageClass('IPM.Files', Zarafa.plugins.files.data.FilesRecordFields);
Zarafa.core.data.RecordFactory.setBaseClassToMessageClass('IPM.Files', Zarafa.plugins.files.data.FilesRecord);

Zarafa.core.data.RecordFactory.addFieldToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_FILES, Zarafa.plugins.files.data.FilesRecordFields);
Zarafa.core.data.RecordFactory.setBaseClassToCustomType(Zarafa.core.data.RecordCustomObjectType.ZARAFA_FILES, Zarafa.plugins.files.data.FilesRecord);
