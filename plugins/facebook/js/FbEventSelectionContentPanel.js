Ext.namespace('Zarafa.plugins.facebook');

/**
 * @class Zarafa.plugins.facebook.FbEventSelectionContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * A contentpanel with grid for selection events from facebook
 */
Zarafa.plugins.facebook.FbEventSelectionContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {


	/**
	 * @cfg {Zarafa.plugins.facebook.FbEventStore} store - for facebook events
	 */
	store: undefined,

	/**
	 * @constructor
	 * @param {object} config
	 */
	constructor: function (config) {

		config = config || {};

		this.store = config.store || new Zarafa.plugins.facebook.data.FbEventStore();

		Ext.apply(this, {
			recordComponentPluginConfig : Ext.applyIf(config.recordComponentPluginConfig || {}, {
				useShadowStore : false
			}),
			closeOnSave             : true,
			items                   : [
				{
					xtype               : 'facebook.fbeventselectiongrid',
					store               : this.store,
					ref					: 'selectionGrid',
					viewConfig: {
						style	:	{ overflow: 'auto', overflowX: 'hidden' }
					}
				}
		]
		});

		Zarafa.plugins.facebook.FbEventSelectionContentPanel.superclass.constructor.call(this, config);

	}
});

Ext.reg('facebook.eventsselectioncontentpanel', Zarafa.plugins.facebook.FbEventSelectionContentPanel);
