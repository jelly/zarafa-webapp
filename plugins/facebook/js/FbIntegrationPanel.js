Ext.namespace('Zarafa.plugins.facebook');

/**
 * @class Zarafa.plugins.facebook.FbIntegrationPanel
 * @extends Ext.form.FormPanel
 */
Zarafa.plugins.facebook.FbIntegrationPanel = Ext.extend(Ext.form.FormPanel, {

	/**
	 * @constructor
	 * @param {object} config
	 */
	constructor : function(config)
	{
		config = config || {};
		var self = this;
		Ext.apply(config, {
			xtype     : 'facebook.fbintegrationpanel',
			layout    : {
				type  : 'form',
				align : 'stretch'
			},
			anchor      : '100%',
			bodyStyle : 'background-color: inherit;',
			defaults  : {
				border      : true,
				bodyStyle   : 'background-color: inherit; padding: 3px 0px 3px 0px; border-style: none none solid none;'
			},
			buttons: [
				this.createImportButton(),
				this.createAuthButton()
			]
		});

		FB.Event.subscribe('auth.authResponseChange', function(authCheck) {
			if (authCheck.status == 'connected') {
				self.fbAuthButton.setText(_('Logout from Facebook'));
				self.fbAuthButton.setHandler(self.fbLogout);
			} else {
				self.fbAuthButton.setText(_('Login to Facebook'));
				self.fbAuthButton.setHandler(self.fbLogin);
			}
		});

		Zarafa.plugins.facebook.FbIntegrationPanel.superclass.constructor.call(this, config);
	},

	/**
	 * creates a button for authorization, checks if we are authorized to facebook
	 * @private
	 */
	createAuthButton: function() {
		if (!FB.getAuthResponse()) {
			return this.createFbLoginButton();
		} else {
			return this.createFbLogoutButton();
		}
	},

	/**
	 * creates a button for login to facebook
	 * @private
	 */
	createFbLoginButton: function()
	{
		return  {
			xtype       : 'button',
			border      : false,
			text        : _('Login to Facebook'),
			handler     : this.fbLogin,
			scope       : this,
			ref         : '/fbAuthButton',
			name        : 'fbAuthButton'
		};
	},


	/**
	 * creates a button for logout
	 * @private
	 */
	createFbLogoutButton: function() {
		return {
			xtype       : 'button',
			border      : false,
			text        : _('Logout from Facebook'),
			handler     : this.fbLogout,
			scope       : this,
			ref         : '/fbAuthButton',
			name        : 'fbAuthButton'
		};
	},

	/**
	 * login to facebook
	 * @private
	 */
	fbLogin: function()
	{
		FB.login(function(){}, {
			scope: 'user_events, user_birthday'
		});
	},

	/**
	 * logout from facebook
	 * @private
	 */
	fbLogout: function()
	{
		FB.logout();
	},

	/**
	 * button for request to facebook for events
	 * @private
	 */
	createImportButton : function()
	{
		return {
			xtype       : 'button',
			width       : 250,
			border      : false,
			text        : _('List events for selected period from Facebook'),
			handler     : this.importAllEvents,
			scope       : this
		}
	},

	/**
	 * facebook event selection dialog creation
	 * @private
	 */
	importAllEvents: function()
	{
		var self = this;
		if (FB.getAuthResponse()) {
			Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.plugins.facebook.FbEventSelectionContentPanel);
		} else {
			FB.login(function(response){
				// if we are successfully logged in, then authResponse property would be not empty
				if (response.authResponse)  {
					Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.plugins.facebook.FbEventSelectionContentPanel);
				}
			}, {
				scope: 'user_events, user_birthday'
			});
		}
	}
});

Ext.reg('facebook.fbintegrationpanel', Zarafa.plugins.facebook.FbIntegrationPanel);
