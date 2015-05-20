Ext.namespace('Zarafa.plugins.spreed.dialogs');

/**
* @class Zarafa.plugins.spreed.dialogs.SpreedParticipantContextMenu
* @extends Zarafa.common.recipientfield.ui.RecipientContextMenu
* @xtype spreed.spreedrecipientcontextmenu
*/
Zarafa.plugins.spreed.dialogs.SpreedParticipantContextMenu = Ext.extend(Zarafa.common.recipientfield.ui.RecipientContextMenu, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			items: [{
				xtype   : 'zarafa.conditionalitem',
				text    : _('Edit Participant'),
				handler : this.editRecipient,
				scope   : this
			},{
				xtype   : 'zarafa.conditionalitem',
				text    : _('Email Message'),
				handler : this.emailRecipient,
				scope   : this
			},{
				xtype   : 'menuseparator'
			}
			]
		});
		Zarafa.plugins.spreed.dialogs.SpreedParticipantContextMenu.superclass.constructor.call(this, config);
   }
});

Ext.reg('spreed.spreedparticipantcontextmenu', Zarafa.plugins.spreed.dialogs.SpreedParticipantContextMenu);
