Ext.namespace('Zarafa.widgets.facebookwidget');

/**
 * @class Zarafa.widgets.facebookwidget.FBWidget
 * @extends Zarafa.core.ui.widget.Widget
 * 
 * Widget that displays a facebook users wall posts
 */
Zarafa.widgets.facebookwidget.FBWidget = Ext.extend(Zarafa.core.ui.widget.Widget, {

	/**
	 * The url of site from which to show the activity.
	 * This is default value and will be used until the
	 * user set his own value.
	 *
	 * @property
	 * @type String
	 * @private
	 */
	defaultFbActivitySite : 'http://zarafa.com',

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			height: 600,
			hasConfig : true
		});

		Zarafa.widgets.facebookwidget.FBWidget.superclass.constructor.call(this, config);
	},

	/**
	 * Initialize the widget Title
	 * @protected
	 */
	initWidget : function()
	{
		Zarafa.widgets.facebookwidget.FBWidget.superclass.initWidget.apply(this, arguments);

		var siteUrl = this.get('site_url');
		if( Ext.isEmpty( siteUrl ) ) {
			siteUrl = this.defaultFbActivitySite;
			this.set('site_url', siteUrl);
		}
		this.setTitle( _('Facebook') + ' - ' + siteUrl);
	},

	/**
	 * Called when a user clicks the config button on the widget panel.
	 * Shows the window with url field - where the user need to put
	 * new value for Facebook Activity Site.
	 */
	config : function()
	{
		var configWindow = new Ext.Window({
			title  : _('Configure widget'),
			layout : 'fit',
			width  : 350,
			height : 120,
			items : [{
				xtype : 'form',
				frame : true,
				ref : 'formPanel',
				labelWidth : 180,
				items : [{
					xtype: 'textfield',
					anchor: '100%',
					fieldLabel: _('Site name to track the activity'),
					allowBlank : false,
					vtype: 'url',
					ref : '../siteUrlField',
					name: 'site_url',
					value: this.get('site_url')
				}],
				buttons : [
					{
						text : _('Save'),
						scope : this,
						ref : '../../savebutton',
						handler : this.saveUserUrlToSettings
					},
					{
						text: _('Cancel'),
						scope : this,
						ref : '../../cancelbutton',
						handler : this.closeConfigWindow
					}
				]
			}]
		});
		configWindow.show(this);
	},


	/**
	 * Initialize the events for this component.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.widgets.facebookwidget.FBWidget.superclass.initEvents.apply(this, arguments);

		this.mon(this, 'bodyresize', this.reloadIframe, this);
	},

	/**
	 * This function check if the input value of url field is the correct url
	 * and after this in case of correctness save the value to the widget settings,
	 * updates the title of widget and close the config window.
	 *
	 * @param {Ext.Button} button The button which was clicked
	 * @private
	 */
	saveUserUrlToSettings : function(button) {
		var widget = this;
		var configWindow = button.refOwner;
		var siteUrl = configWindow.siteUrlField.getValue();
		if( configWindow.formPanel.getForm().isValid() ) {
			widget.set('site_url', siteUrl);
			widget.reloadIframe();
			widget.setTitle( _('Facebook') + ' - ' + siteUrl);
			configWindow.close();
		}
	},

	/**
	 * Close the config window
	 *
	 * @private
	 */
	closeConfigWindow : function(button) {
		var configWindow = button.refOwner;
		configWindow.close();
	},

	/**
	 * Reload the entire iframe using the dimensions of the {@link #body}.
	 * @private
	 */
	reloadIframe : function()
	{
		var width = this.body.getWidth();
		var height = this.body.getHeight();
		var site_url = this.get('site_url');
		var url = 'http://www.facebook.com/plugins/activity.php?site=' + site_url + '&amp;width=' + width + '&amp;height=' + height + '&amp;header=true&amp;colorscheme=light&amp;font=segoe+ui&amp;border_color&amp;recommendations=false';
		this.body.dom.innerHTML = '<iframe src="' + url + '" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:' + width + 'px; height:' + height + 'px;" allowTransparency="true"></iframe>';
	}
});

Zarafa.onReady(function() {
	container.registerWidget(new Zarafa.core.ui.widget.WidgetMetaData({
		name : 'fb',
		displayName : _('Facebook'),
		iconPath : 'plugins/facebookwidget/resources/images/facebook.png',
		widgetConstructor : Zarafa.widgets.facebookwidget.FBWidget
	}));
});
