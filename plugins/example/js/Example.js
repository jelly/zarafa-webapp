Ext.namespace('Zarafa.plugins.example');

/**
 *
 * @class Zarafa.plugins.example.Example
 * @extends Zarafa.core.Plugin
 * 
 */
Zarafa.plugins.example.Example = Ext.extend(Zarafa.core.Plugin, {
	/**
	 * Constructor
	 * @protected
	 */
	constructor : function(config) {
		config = config || {};
		
		Zarafa.plugins.example.Example.superclass.constructor.call(this, config);
	},

	initPlugin : function()
	{
		Zarafa.plugins.example.Example.superclass.initPlugin.apply(this, arguments);
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'example',
		displayName : _('Example Plugin'),
		pluginConstructor : Zarafa.plugins.example.Example
	}));
});
