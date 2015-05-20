Ext.namespace('Zarafa.plugins.spreed.dialogs');

/**
 * @class Zarafa.plugins.spreed.dialogs.SpreedToolBar
 * @extends Zarafa.core.ui.ContentPanelToolbar
 * @xtype zarafa.spreedtoolbar
 */
Zarafa.plugins.spreed.dialogs.SpreedToolBar = Ext.extend(Zarafa.core.ui.ContentPanelToolbar, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			insertionPointBase: 'plugins.spreed.spreedcontentpanel',
			actionItems : this.createActionButtons()
		});

		Zarafa.plugins.spreed.dialogs.SpreedToolBar.superclass.constructor.call(this, config);
	},

	/**
	 * Create all buttons which should be added by default the the `Actions` {@link Ext.ButtonGroup ButtonGroup}.
	 * This will create {@link Ext.ButtonGroup ButtonGroup} element with Spreed setup button.
	 *
	 * @return {Array} The {@link Ext.ButtonGroup ButtonGroup} elements which should be added
	 * in the Actions section of the {@link Ext.Toolbar Toolbar}.
	 * @private
	 */
	createActionButtons : function()
	{
		return [{
				xtype   : 'button',
				text    : _('Setup Meeting'),
				tooltip : {
					title   : _('Setup Meeting'),
					text    : _('Setup meeting with provided details')
				},
				iconCls : 'icon_spreed_setup_button',
				handler : this.setUpMeeting,
				scope   : this
			}];
	},

	/**
	 * Call the saveRecord on the parent content panel.
	 * Close the panel when the Spreed Meeting is setup ( record is created ) successfully.
	 *
	 * @return void
	 */
	setUpMeeting    : function()
	{
		var currentDialogWindow = this.dialog;
		currentDialogWindow.saveRecord();
	}
});

Ext.reg('spreed.spreedtoolbar', Zarafa.plugins.spreed.dialogs.SpreedToolBar);
