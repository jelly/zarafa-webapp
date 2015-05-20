Ext.namespace('Zarafa.plugins.dropboxattachment.dialogs');

/**
 * @class Zarafa.plugins.dropboxattachment.dialogs.AttachmentContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 *
 * The content panel which shows the hierarchy tree of DropBox account files.
 * @xtype dropboxcontentpanel
 */
Zarafa.plugins.dropboxattachment.dialogs.AttachmentContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * @cfg {Zarafa.core.data.IPMRecord} record The record to which
	 * we need to add attachment.
	 */
	record : null,

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			layout					: 'fit',
			title					: _('DropBox Attachment'),
			closeOnSave				: true,
			width					: 340,
			height					: 200,
			//Add panel
			items					: [
				{
					xtype			: 'dropboxattachment.treepanel',
					ref				: 'treePanel'
				}
			]
		});

		Zarafa.plugins.dropboxattachment.dialogs.AttachmentContentPanel.superclass.constructor.call(this, config);
	}

});

Ext.reg('dropboxcontentpanel' ,Zarafa.plugins.dropboxattachment.dialogs.AttachmentContentPanel);
