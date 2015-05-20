Ext.namespace('Zarafa.plugins.files.ui');

/**
 * @class Zarafa.plugins.files.ui.FilesViewPanel
 * @extends Ext.Panel
 * @xtype zarafa.filesviewpanel
 * 
 * Panel that shows the contents of mail messages.
 */
Zarafa.plugins.files.ui.FilesViewPanel = Ext.extend(Ext.Panel, {
	/**
	 * @constructor
	 * @param {Object} config configuration object.
	 */
	constructor : function(config) {
		config = config || {};
		
		Ext.applyIf(config, {
			xtype: 'zarafa.filesviewpanel',
			border : false,
			cls: 'zarafa-filesviewpanel',
			layout: 'zarafa.collapsible',
			items : [{
				xtype: 'zarafa.filesfileinfo'
			}]
		});

		Zarafa.plugins.files.ui.FilesViewPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('zarafa.filesviewpanel', Zarafa.plugins.files.ui.FilesViewPanel);
