Ext.namespace('Zarafa.plugins.spreed.dialogs');

/**
 * @class Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype spreed.spreedsetupcontentpanel
 *
 * Content panel with options for creating web meeting with spreed.
 */
Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel = Ext.extend(Zarafa.core.ui.RecordContentPanel, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		// Add in some standard configuration data.
		config = config || {};

		Ext.applyIf(config, {
			layout : 'fit',
			title : _('Spreed Meeting'),
			recordComponentPluginConfig : Ext.applyIf(config.recordComponentPluginConfig || {}, {
				allowWrite : true,
				useShadowStore : false,
				enableOpenLoadTask : false
			}),
			closeOnSave : true,
			width : 940,
			height : 480,
			//Add panel
			items : [{
				xtype : 'spreed.spreedsetuppanel',
				tbar : {
					xtype: 'spreed.spreedtoolbar'
				}
			}]
		});

		//Call parent constructor
		Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Called when the {@link #close} event is being fired.
	 * This will clean up the store, by removing current record from it.
	 * Calls parent method after this.
	 */
	doClose : function()
	{
		var store = this.record.getStore();
		store.remove(this.record);

		Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel.superclass.doClose.call(this);
	}

});

Ext.reg('spreed.spreedsetupcontentpanel', Zarafa.plugins.spreed.dialogs.SpreedSetupContentPanel);
