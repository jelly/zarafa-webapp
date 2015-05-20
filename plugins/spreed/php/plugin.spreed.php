<?php
/**
 * Spreed Plugin
 *
 * Integrates Spreed in to the Zarafa environment
 *
 * Author: Siem Kok <s.kok@zarafa.com>
 *
 */
class Pluginspreed extends Plugin {

	/**
	 * Constructor
	 */
	function Pluginspreed() {}

	/**
	 * Function initializes the Plugin and registers all hooks
	 *
	 * @return void
	 */
	function init() {
		$this->registerHook('server.core.settings.init.before');
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
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default
	 * settings. Registers the sysadmin defaults for the SPREED plugin.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'spreed' => Array(
							'enable'            => PLUGIN_SPREED_USER_DEFAULT_ENABLE,
							'max_participants'  => PLUGIN_SPREED_MAX_PARTICIPANTS,
							'default_timezone'  => date_default_timezone_get(),
						)

					)
				)
			)
		));
	}
}
?>
