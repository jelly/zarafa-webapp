/* The Jira issue collector magic.  This is copied directly from the Jira
instructions at
https://jira.zarafa.com/secure/ViewCollector!default.jspa?projectKey=FDB&collectorId=d6b19906
*/
window.ATL_JQ_PAGE_PROPS = function() {
	var callback;

	return {
		"triggerFunction": function(showCollectorDialog) {
			callback = showCollectorDialog;
		},

		/* We need to invoke showCollectorDialog function to display the JIRA
		 * issue collector, and that particular function is available as an
		 * argument of triggerFunction, Here we got that function in a variable
		 * named callback. Now, All we need to do is just invoke
		 * it from the {@link Zarafa.plugins.feedback.FeedbackPlugin#clickFeedback}.
		 */
		returnCallback : function()
		{
			return callback;
		},

		/* Overridden function to insert some of our own environment
		 * information in here.  Right now, we add WebApp and server
		 * versions to the environment field.  They are automatically
		 * added and formatted by the Jira JS code.
		 * 
		 * This code is run during initialization, so we need to be careful
		 * about using globals.  Also, in app.js, the global 'version' is
		 * deleted, so we cannot rely on that either.  See WA-4296 for
		 * details.
		 */
		environment: function() {
			var env_info = {};
			
			var versionInfo;
			if (window.version) {
				// The container object hasn't been constructed yet,
				// so we can construct our own Version instance.
				versionInfo = new Zarafa.core.data.Version(window.version);
			} else {
				// The container object has been created, so the
				// global window.version is no longer present.
				versionInfo = container.getVersion();
			}

			if (versionInfo.getSVN()) {
				env_info['WebApp version'] = versionInfo.getWebApp() + "; revision " + versionInfo.getSVN();
			} else {
				env_info['WebApp version'] = versionInfo.getWebApp();
			}
			env_info['PHP-MAPI version'] = versionInfo.getZCP();
			if (versionInfo.getServer()) {
				env_info['Server version'] = versionInfo.getServer();
			}

			return env_info;
		}
	}
}();

/* Now the actual plugin code. */
Ext.namespace('Zarafa.plugins.feedback');

/**
 * @class Zarafa.plugins.feedback.FeedbackPlugin
 * @extends Zarafa.core.Plugin
 *
 * Plugin to add a little 'Feedback' link next to the 'Logout" button at
 * the right end of the top bar.  When you click it, we trigger the jQuery
 * magic that is provided by Jira via the initialization code above.
 *
 * See https://confluence.atlassian.com/display/JIRA/Advanced+Use+of+the+JIRA+Issue+Collector
 * for more information on Jira issue collectors and how to initialize them.
 */
Zarafa.plugins.feedback.FeedbackPlugin = Ext.extend(Zarafa.core.Plugin, {

	/**
	 * Initialize the plugin by registering to the insertion point
	 * to add something to the right end of the main tab bar.
	 * @protected
	 */
	initPlugin: function() {
		Zarafa.plugins.feedback.FeedbackPlugin.superclass.initPlugin.apply(this, arguments);
		this.registerInsertionPoint('main.maintabbar.right', this.putTabbarButton, this);
	},

	/**
	 * Create the button to add to the insertion point as called
	 * by init().
	 * @return A struct with the necessary configuration for the button.
	 * @private
	 */
	putTabbarButton: function() {
		return {
			text: _("Feedback?"),
			handler: this.clickFeedback
		};
	},

	/**
	 * Trigger function called when the user clicks the button in the
	 * main tab bar.  This is where the magic happens, we trigger the
	 * 'click' event on the element that we created.  The Jira
	 * Javascript functions will to the rest: display a dialog and
	 * handle user input.
	 * @private
	 */
	clickFeedback: function() {
		var callback = window.ATL_JQ_PAGE_PROPS.returnCallback();
		callback();
	}
});

Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name: 'feedback',
		displayName : _('Feedback Plugin'),
		about : Zarafa.plugins.feedback.ABOUT,
		pluginConstructor : Zarafa.plugins.feedback.FeedbackPlugin
	}));
});