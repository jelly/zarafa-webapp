<?php
/**
 * Facebook Plugin
 *
 * Integrates Facebook events in to the Zarafa calendar
 *
 */
class Pluginfacebook extends Plugin {

	/**
	 * Constructor
	 */
	function Pluginfacebook() {}

	/**
	 * Function initializes the Plugin and registers all hooks
	 *
	 * @return void
	 */
	function init() {
		$this->registerHook('server.core.settings.init.before');
		$this->registerHook('server.main.include.jsfiles');
	}

	/**
	 * Function is executed when a hook is triggered by the PluginManager
	 *
	 * @param string $eventID the id of the triggered hook
	 * @param mixed $data object(s) related to the hook
	 * @return void
	 */
	function execute($eventID, &$data) {
		switch($eventID) {
			case 'server.core.settings.init.before' :
				$this->injectPluginSettings($data);
				break;
			case 'server.main.include.jsfiles' :
				$this->addFbJsFile($data);
				break;
		}
	}

	/**
	 * Add FB js files
	 * @param Array $data Data for including js files
	 */
	function addFbJsFile($data) {
		// make sure to load remote files only when plugin is enabled
		if( $GLOBALS['settings']->get('zarafa/v1/plugins/facebook/enable') == true ) {
			$data['files'][] = 'https://connect.facebook.net/en_US/all.js';
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default
	 * settings. Registers the sysadmin defaults for the Facebook plugin.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'facebook' => Array(
							'enable'            => PLUGIN_FACEBOOK_USER_DEFAULT_ENABLE,
							'appId'				=> PLUGIN_FACEBOOK_APPID,
							'home_domain'		=> PLUGIN_FACEBOOK_HOME_DOMAIN
						)

					)
				)
			)
		));
	}
}
?>
