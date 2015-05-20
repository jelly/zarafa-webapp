Ext.namespace('Zarafa.plugins.facebook');

/**
 * @class Zarafa.plugins.facebook.FbIntegrationContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * contentpanel for logging in and out from facebook
 */
Zarafa.plugins.facebook.FbIntegrationContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			layout					: 'fit',
			title				: _('Facebook events integration'),
			recordComponentPluginConfig : Ext.applyIf(config.recordComponentPluginConfig || {}, {
				useShadowStore : false
			}),
			closeOnSave				: true,
			items					: [
				{
					xtype				: 'facebook.fbintegrationpanel'
				}
			]
		});

		Zarafa.plugins.facebook.FbIntegrationContentPanel.superclass.constructor.call(this, config);
	}

});

Ext.reg('facebook.fbintegrationcontentpanel', Zarafa.plugins.facebook.FbIntegrationContentPanel);
