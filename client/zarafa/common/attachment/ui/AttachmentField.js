Ext.namespace('Zarafa.common.attachment.ui');

/**
 * @class Zarafa.common.attachment.ui.AttachmentField
 * @extends Zarafa.common.ui.BoxField
 * @xtype zarafa.attachmentfield
 *
 * Extension to the default {@link Zarafa.common.ui.BoxField} which
 * handles attachments as for rendering. It uses a
 * {@link Zarafa.core.data.IPMAttachmentStore IPMAttachmentStore} for storing
 * and resolving {@link Zarafa.core.data.IPMAttachmentRecord Attachments}.
 *
 * If the {@link Zarafa.core.plugins.RecordComponentUpdaterPlugin} is installed
 * in the {@link #plugins} array of this component, this component will automatically
 * load the {@link Zarafa.core.data.IPMAttachmentStore AttachmentStore} into the component.
 * Otherwise the user of this component needs to call {@link #setAttachmentStore}.
 */
Zarafa.common.attachment.ui.AttachmentField = Ext.extend(Zarafa.common.ui.BoxField, {
	/**
	 * @constructor
	 * @param config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			boxType : 'zarafa.attachmentbox',
			enableComboBox: false,
			height: 30
		});

		Zarafa.common.attachment.ui.AttachmentField.superclass.constructor.call(this, config);

		this.on('boxdblclick', this.onBoxDblClick, this);
		this.on('boxcontextmenu', this.onBoxContextMenu, this);
	},

	/**
	 * Called during rendering of the component
	 * @param {Ext.Container} ct The container in which the component is placed
	 * @param {Number} position The position of the component in the container
	 * @private
	 */
	onRender : function(ct, position)
	{
		Zarafa.common.attachment.ui.AttachmentField.superclass.onRender.apply(this, arguments);

		// Hide the input element, editing of attachment
		// is not possible through the input field.
		this.el.addClass('x-hidden');

		// Initialize Drag & Drop events from desktop
		this.wrap.on('dragover', this.onBrowserDragOver, this);
		this.wrap.on('dragleave', this.onBrowserDragLeave, this);
		this.wrap.on('drop', this.onBrowserDrop, this);
	},

	/**
	 * Event handler for the 'dragover' event which happens if the user drags a file
	 * from the desktop to over the {@link #wrap} element.
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onBrowserDragOver : function(event)
	{
		if(!this.editable) {
			// if field is non editable then we should block drag & drop also
			return;
		}

		event.stopPropagation();
		event.preventDefault();

		this.wrap.addClass(this.wrapFocusClass);
	},

	/**
	 * Event handler for the 'dragleave' event which happens if the user drags a file
	 * from the desktop out of the {@link #wrap} element.
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onBrowserDragLeave : function(event)
	{
		if(!this.editable) {
			// if field is non editable then we should block drag & drop also
			return;
		}

		event.stopPropagation();
		event.preventDefault();

		this.wrap.removeClass(this.wrapFocusClass);
	},

	/**
	 * Event handler for the 'drop' event which happens if the user drops a file
	 * from the desktop to the {@link #wrap} element.
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onBrowserDrop : function(event)
	{
		if(!this.editable) {
			// if field is non editable then we should block drag & drop also
			return;
		}

		event.stopPropagation();
		event.preventDefault();

		this.wrap.removeClass(this.wrapFocusClass);

		var files = event.browserEvent.target.files || event.browserEvent.dataTransfer.files;

		// Test if the files can be uploaded, upload them if possible
		if (this.boxStore.canUploadFiles(files, { container : this.recordComponentUpdaterPlugin.rootContainer.getEl() })) {
			this.boxStore.uploadFiles(files);
		}
	},

	/**
	 * Set the store on this field. See {@link #setBoxStore}.
	 * @param {Zarafa.core.data.IPMAttachmentStore} store The store to set on this field
	 */
	setAttachmentStore: function(store)
	{
		return this.setBoxStore.apply(this, arguments);
	},

	/**
	 * Get the store attached to this field. See {@link #getBoxStore}.
	 * @return {Zarafa.core.data.IPMAttachmentStore} store
	 */
	getAttachmentStore: function()
	{
		return this.getBoxStore();
	},

	/**
	 * Update the components with the given record.
	 *
	 * @param {Zarafa.core.data.MAPIRecord} record The record to update in this component
	 * @param {Boolean} contentReset force the component to perform a full update of the data.
	 */
	update : function(record, contentReset)
	{
		if (record && record instanceof Zarafa.core.data.MAPIRecord) {
			// In case the recordcomponentupdaterplugin is installed
			// we have a special action to update the component.
			if (contentReset && record.isOpened()) {
				this.setAttachmentStore(record.getAttachmentStore());
			}
		} else {
			// The recordcomponentupdaterplugin is not installed and the
			// caller really wants to perform the update() function. Probably
			// a bad move, but lets not disappoint the caller.
			Zarafa.common.attachment.ui.AttachmentField.superclass.update.apply(this, arguments);
		}
	},

	/**
	 * Called by {@link #filterRecords} to check if the given record
	 * must be visible in the field or not. For the attachmentfield,
	 * all records are filtered by their 'hidden' property.
	 * @param {Ext.data.Record} record The record to filter
	 * @return {Boolean} True if the record should be visible, false otherwise
	 * @protected
	 */
	filterRecord : function(record)
	{
		return record.get('hidden') !== true;
	},

	/**
	 * Event handler when a Box has been double-clicked.
	 * @param {Zarafa.common.attachment.ui.AttachmentField} field This field to which the box belongs
	 * @param {Zarafa.common.attachment.ui.AttachmentBox} box The box for which was double-clicked
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record The record which is attached to the box
	 * @private
	 */
	onBoxDblClick: function(field, box, record)
	{
		Zarafa.common.Actions.openAttachmentRecord(record);
	},

	/**
	 * Event handler when the contextmenu is requested for a Box.
	 * @param {Zarafa.common.attachment.ui.AttachmentField} field This field to which the box belongs
	 * @param {Zarafa.common.attachment.ui.AttachmentBox} box The box for which the contextmenu is requested
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record The record which is attached to the box
	 * @private
	 */
	onBoxContextMenu : function(field, box, record)
	{
		Zarafa.core.data.UIFactory.openDefaultContextMenu(record, {
			position : box.getEl().getXY()
		});
	}
});

Ext.reg('zarafa.attachmentfield', Zarafa.common.attachment.ui.AttachmentField);