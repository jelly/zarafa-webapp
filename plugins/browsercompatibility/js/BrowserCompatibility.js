Ext.namespace('Zarafa.plugins.browsercompatibility');

/**
 * @class Zarafa.plugins.browsercompatibility.BrowserCompatibility
 * @extends Zarafa.core.Plugin
 *
 * Plugin is used to check current name and version of browser that is used by user and if it is
 * not supported then it will show a warning message to user to upgrade the browser or change the browser
 * for better experience.
 */
Zarafa.plugins.browsercompatibility.BrowserCompatibility = Ext.extend(Zarafa.core.Plugin, {
	/**
	 * Object that contains list of base supported browsers.
	 * Key will be browser name and value will indicate least supported version for that browser.
	 * @property
	 * @type Object
	 */
	baseSupportedBrowsers : { 'Firefox' : 5 , 'Safari' : 5.1 , 'Explorer' : 9 , 'ZDI' : 0, 'Chrome' : 28 },

	/**
	 * Add listener for load event of {@link Zarafa.hierarchy.data.HierarchyStore HierarchyStore}.
	 * @protected
	 */
	initPlugin : function()
	{
		Zarafa.plugins.browsercompatibility.BrowserCompatibility.superclass.initPlugin.apply(this, arguments);

		container.getHierarchyStore().on('load', this.checkBrowser, this, { single: true });
	},

	/**
	 * Identify the current browser by which user is accessing WebApp and find out that it is supported by webapp.
	 * if it is not supported by WebApp then a warning message will be shown to user.
	 */
	checkBrowser : function()
	{
		var browserDetect = Zarafa.plugins.browsercompatibility.BrowserDetect;
		var currentBrowser = browserDetect.getCurrentBrowserName();
		var currentOS = browserDetect.getCurrentOS();
		var messageToDisplay = '';

		// Check if we are supporting the browser name
		if(Ext.isDefined(this.baseSupportedBrowsers[currentBrowser])) {
			// if we support the browser then we need to check for browser version
			var currentVersion = browserDetect.getCurrentBrowserVersion();
			// check version should be higher then base supported version for browser
			if(this.baseSupportedBrowsers[currentBrowser] <= parseFloat(currentVersion)) {
				return;
			} else {
				/*
				 * check for browser compatibility mode is currently on for Internet Explorer
				 * IE9 | MSIE 10.0 | Trident/6.0
				 * IE9 | MSIE 9.0  | Trident/5.0
				 * IE8 | MSIE 8.0  | Trident/4.0
				 * IE7 | MSIE 7.0  | No Trident token
				 * IE6 | MSIE 6.0  | No Trident token
				 * Now, whenever detected browser is less than IE9 at that time we have to worry
				 * about browser compatibility mode detection.
				 * Second thing is how to detect compatibility mode?
				 * There are two cases
				 * 1) if detected browser is IE8 ( Trident/4.0 Available ) than actual browsers may be IE9, IE10
				 * 2) if detected browser is IE7 ( No Trident Token Available) than actual browsers may be IE8, IE9, IE10
				 */
				if(currentBrowser == 'Explorer') {
					var currentRenderingEngineVersion = browserDetect.getCurrentRenderingEngineVersion();
					if ( currentVersion == 8 && currentRenderingEngineVersion != 4 ) {
						messageToDisplay = _('Running Internet Explorer in compatibility mode is not supported.');
					} else if ( currentVersion == 7 && currentRenderingEngineVersion >= 4 ) {
						messageToDisplay = _('Running Internet Explorer in compatibility mode is not supported.');
					}
				}

				if (Ext.isEmpty(messageToDisplay)) {
					// version is lower then generate string to indicate user that he needs to upgrade browser
					/*
					 * # TRANSLATORS: {0} is browser name by which user is accessing WebApp,
					 * # {1} is version of browser by which user is accessing WebApp,
					 * # {2} is least supported version number.
					 */
					messageToDisplay = String.format(_('{0} version {1} is not supported by WebApp.<br/>Use version {2} or above.'), currentBrowser, currentVersion, this.baseSupportedBrowsers[currentBrowser]);
				}
			}
		} else {
			var suggestedBrowser = '';

			if(currentOS == 'Mac') {
				suggestedBrowser = 'Apple Safari or Google Chrome';
			} else {
				/*
				 * For linux default browser is firefox, so suggest to use it
				 * For windows default browser is IE but obviously we don't want to suggest it
				 * so suggest firefox here also
				 */
				suggestedBrowser = 'Mozilla Firefox or Google Chrome';
			}

			// generate string to show user recommended browser to use
			/*
			 * # TRANSLATORS: {0} is browser name by which user is accessing WebApp,
			 * # {1} is a suggested browser name to access WebApp,
			 * # {2} is name of user's operating system.
			 */
			messageToDisplay = String.format(_('{0} is not supported by WebApp.<br/>It is recommended to use latest version of {1} on {2}.'), currentBrowser, suggestedBrowser, currentOS);
		}

		container.getNotifier().notify('info.browsercompatibility', _('Unsupported Browser'), messageToDisplay, {
			persistent : true,
			listeners : {
				'click' : this.onNotifierClick,
				'scope': this
			}
		});
	},

	/**
	 * Event handler which is fired when the user clicked on the {@link Zarafa.core.ui.notifier.Notifier notification}.
	 * This will remove the notification.
	 * @param {Ext.Element} element The notification element
	 * @param {Ext.EventObject} event The event object
	 * @private
	 */
	onNotifierClick : function(element, event)
	{
		container.getNotifier().notify('info.browsercompatibility', null, null, {
			reference : element,
			destroy : true
		});
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'browsercompatibility',
		displayName : _('Browser Compatibility Plugin'),
		about : Zarafa.plugins.browsercompatibility.ABOUT,
		pluginConstructor : Zarafa.plugins.browsercompatibility.BrowserCompatibility
	}));
});
