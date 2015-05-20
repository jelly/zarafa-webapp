Ext.namespace('Zarafa.core.ui');
/**
 * @class Zarafa.core.ui.ContextNavigationPanel
 * @extends Ext.Panel
 * @xtype zarafa.contextnavigation
 * 
 * ContextNavigationPanel provides custom navigation options to context through {@link Zarafa.hierarchy.ui.HierarchyTreePanel}.
 */
Zarafa.core.ui.ContextNavigationPanel = Ext.extend(Ext.Panel, {
	/**
	 * For this Context this panel will be visible in the {@link Zarafa.core.ui.NavigationPanel NavigationPanel}.
	 * @cfg {Zarafa.core.Context} Related Context
	 */
	context: null,

	/**
	 * @constructor
	 * @param {Object} config configuration object
	 */
	constructor : function (config) {
		config = config || {};

		// Config options for component itself.
		Ext.applyIf(config, {
			border : false,
			autoScroll : true,
			layout : {
				type : 'table',
				columns : 1,
				tableAttrs: {
					style: {
						width: '100%'
					}
				}
			},
			defaults : {
				border : false,
				autoScroll : false,
				headerCfg : { cls : 'zarafa-hierarchy-header x-panel-header' },
				defaults : { cls : 'zarafa-context-navigation-item-body' }
			}
		});

		Zarafa.core.ui.ContextNavigationPanel.superclass.constructor.call(this, config);
	},

	/**
	 * @return {Zarafa.core.Context}
	 */
	getContext : function() {
		return this.context || false;
	}
});

Ext.reg('zarafa.contextnavigation', Zarafa.core.ui.ContextNavigationPanel);
