Ext.namespace('Zarafa.common.attachment.ui');

/**
 * @class Zarafa.common.attachment.ui.AttachmentContextMenu
 * @extends Zarafa.core.ui.menu.ConditionalMenu
 * @xtype zarafa.attachmentcontextmenu
 */
Zarafa.common.attachment.ui.AttachmentContextMenu = Ext.extend(Zarafa.core.ui.menu.ConditionalMenu, {
	// Insertion points for this class
	/**
	 * @insert common.contextmenu.attachment.actions
	 * Insertion point for adding actions menu items into the context menu
	 * @param {Zarafa.common.attachment.ui.AttachmentContextMenu} contextmenu This contextmenu
	 */
	/**
	 * @insert common.contextmenu.attachment.options
	 * Insertion point for adding options menu items into the context menu
	 * @param {Zarafa.common.attachment.ui.AttachmentContextMenu} contextmenu This contextmenu
	 */

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		if (!Ext.isDefined(config.model) && Ext.isDefined(config.context)) {
			config.model = config.context.getModel();
		}
		Ext.applyIf(config, {
			items : [
				this.createContextActionItems(config.records),
				container.populateInsertionPoint('common.contextmenu.attachment.actions', this),
				{ xtype : 'menuseparator' },
				container.populateInsertionPoint('common.contextmenu.attachment.options', this)
			],
			defaults : {
				xtype: 'zarafa.conditionalitem',
				hideOnDisabled : false
			}
		});
		Zarafa.common.attachment.ui.AttachmentContextMenu.superclass.constructor.call(this, config);
	},
	
	/**
	 * Create the Action context menu items
	 * @param {Zarafa.core.data.IPMAttachmentRecord} Attachment record. Based on record type preview will be enabled or disabled.
	 * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Action context menu items
	 * @private
	 */
	createContextActionItems : function(records)
	{
		return [{
			text : _('Preview'),
			iconCls : 'icon_attachment_preview',
			scope : this,
			handler : this.onPreviewItem,
			beforeShow : this.onPreviewBeforeShow
		}, {
			text : _('Download'),
			iconCls : 'icon_attachment_download',
			scope : this,
			handler : this.onDownloadItem,
			beforeShow : this.onDownloadBeforeShow
		}];
	},

	/**
	 * Function will be called before {@link Zarafa.common.attachment.ui.AttachmentContextMenu AttachmentContextMenu} is shown
	 * so we can decide which item should be disabled.
	 * @param {Zarafa.core.ui.menu.ConditionalItem} item context menu item
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record attachment record on which context menu is shown
	 */
	onPreviewBeforeShow : function(item, record)
	{
		// get component that can preview the selected record
		var comp = container.getSharedComponent(Zarafa.core.data.SharedComponentType['common.view'], record);

		// component should be lightbox to make attachment previewable
		var disabled = !comp || comp instanceof Zarafa.common.CommonContext;
		// embedded messages can not be previewed
		disabled = disabled || record.isEmbeddedMessage();

		item.setDisabled(disabled);
	},

	/**
	 * Function will be called before {@link Zarafa.common.attachment.ui.AttachmentContextMenu AttachmentContextMenu} is shown
	 * so we can decide which item should be disabled.
	 * @param {Zarafa.core.ui.menu.ConditionalItem} item context menu item
	 * @param {Zarafa.core.data.IPMAttachmentRecord} record attachment record on which context menu is shown
	 */
	onDownloadBeforeShow : function(item, record)
	{
		// embedded messages can not be downloaded
		item.setDisabled(record.isEmbeddedMessage());
	},

	/**
	 * Event handler which is called when the user selects the 'Preview'
	 * item in the context menu. This will open the item in a new dialog.
	 * @private
	 */
	onPreviewItem : function()
	{
		//should already have a component that has won the bid
		//invoke that component to open the preview
		Zarafa.core.data.UIFactory.openViewRecord(this.records);
	}, 

	/**
	 * Event handler which is called when the user selects the 'Download'
	 * item in the context menu. This will open the print dialog.
	 * @private
	 */
	onDownloadItem : function()
	{
		Zarafa.common.Actions.downloadAttachment(this.records);
	}
});

Ext.reg('zarafa.attachmentcontextmenu', Zarafa.common.attachment.ui.AttachmentContextMenu);
