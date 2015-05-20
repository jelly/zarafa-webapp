Ext.namespace('Zarafa.widgets.shellgame');

/**
 * @class Zarafa.widgets.shellgame.ShellGameWidget
 * @extends Zarafa.core.ui.widget.Widget
 * 
 * This widget implements the Shell Game.
 */
Zarafa.widgets.shellgame.ShellGameWidget = Ext.extend(Zarafa.core.ui.widget.Widget, {

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, { 
			height : 350,
			items: [{
				xtype: 'zarafa.widget.shellgamepanel'
			}]
		});

		Zarafa.widgets.shellgame.ShellGameWidget.superclass.constructor.call(this, config);
	}
});

Zarafa.onReady(function() {
	container.registerWidget(new Zarafa.core.ui.widget.WidgetMetaData({
		name : 'shellgame',
		displayName : _('Shell Game'),
		iconPath : 'plugins/shellgame/resources/images/shellgame.png',
		widgetConstructor : Zarafa.widgets.shellgame.ShellGameWidget
	}));
});
