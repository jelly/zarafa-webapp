Ext.namespace('Zarafa.plugins.facebook');

/**
 * @class Zarafa.plugins.facebook.facebookEventsPlugin
 * @extends Zarafa.core.Plugin
 *
 * This class integrates facebook events into the Zarafa calendar.
 */
Zarafa.plugins.facebook.FacebookEventsPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * adds the cross-server script and registers insertion point.
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.facebook.FacebookEventsPlugin.superclass.initPlugin.apply(this, arguments);

		// Init the SDK
		FB.init({
			appId      : container.getSettingsModel().get(this.getSettingsBase() + '/appId'), // App ID
			channelUrl : 'https://'+container.getSettingsModel().get(this.getSettingsBase() + '/home_domain')+'/channel', // Path to your Channel File
			status     : true, // check login status
			cookie     : true, // enable cookies to allow the server to access the session
			xfbml      : true  // parse XFBML
		});
		this.registerInsertionPoint('navigation.south', this.createFacebookButton, this);
		Zarafa.core.data.SharedComponentType.addProperty('plugins.facebook.dialogs.importevents');
	},

	/**
	 * Creates the button by clicking on which the Facebook
	 * will be imported to the Zarafa calendar.
	 *
	 * @return {Object} Configuration object for a {@link Ext.Button button}
	 * @private
	 */
	createFacebookButton:function()
	{
		var button=
		{
			xtype				: 'button',
			text				: _('Import Facebook events'),
			iconCls				: 'icon_facebook_button',
			navigationContext	: container.getContextByName('calendar'),
			handler				: this.onImportFacebookEvents,
			scope				: this
		}
		return  button;
	},

	/**
	 * create a dialog for import facebook events
	 * @private
	 */
	onImportFacebookEvents: function()
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.facebook.dialogs.importevents'], undefined, {
			manager : Ext.WindowMgr
		});
	},

	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * This will bid on calendar.dialogs.importevents
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, record)
	{
		var bid = -1;
		
		switch(type)
		{
			case Zarafa.core.data.SharedComponentType['plugins.facebook.dialogs.importevents']:
				bid = 2;
				break;
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent : function(type, record)
	{
		var component;

		switch(type)
		{
			case Zarafa.core.data.SharedComponentType['plugins.facebook.dialogs.importevents']:
				component = Zarafa.plugins.facebook.FbIntegrationContentPanel;
				break;
		}

		return component;
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'facebook',
		displayName : _('Facebook Events'),
		pluginConstructor : Zarafa.plugins.facebook.FacebookEventsPlugin
	}));
});
