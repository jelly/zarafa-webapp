<?php
/**
 * Files Plugin
 *
 * Integrates Files into the Zarafa environment.
 */
class Pluginfiles extends Plugin {

	/**
	 * Constructor
	 */
	function Pluginfiles() {}

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
	 *
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
	 * settings. Registers the sysadmin defaults for the FILES plugin.
	 *
	 * @param array $data Reference to the data of the triggered hook
	 *
	 * @return void
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'main' => Array(
						'notifier' => Array(
							'info' => Array(
								'files' => Array(
									'value' => "dropdown"		// static notifier
								)
							)
						)
					),
					'contexts' => Array(
						'files' => Array(
							'server'				=> PLUGIN_FILESATTCHMENT_SERVER,
							'files_path'   		=> PLUGIN_FILESATTCHMENT_PATH,
							'use_ssl'				=> PLUGIN_FILESATTCHMENT_USE_SSL,
							'session_auth'			=> PLUGIN_FILESATTCHMENT_USE_SESSION_AUTH,
							'username'				=> PLUGIN_FILESATTCHMENT_USER,
							'password'				=> PLUGIN_FILESATTCHMENT_PASS,
							'port'					=> PLUGIN_FILESATTCHMENT_PORT,
							'port_ssl'				=> PLUGIN_FILESATTCHMENT_PORTSSL,
							'ask_before_delete'		=> PLUGIN_FILESATTCHMENT_ASK_BEFORE_DELETE,
							'backend'				=> PLUGIN_FILESATTCHMENT_BACKEND,
							'webapp_tmp'			=> TMP_PATH,
							'enable_caching'		=> PLUGIN_FILESBROWSER_ENABLE_CACHE
						)
					),
					'plugins' => Array(
						'files' => Array(
							'enable'	=> PLUGIN_FILES_USER_DEFAULT_ENABLE,
							'button_name' => PLUGIN_FILESBROWSER_BUTTONNAME
						),
						'filescontext' => Array(
							'enable' => PLUGIN_FILESBROWSER_USER_DEFAULT_ENABLE
						),
						'attachfromfiles' => Array(
							'enable' => PLUGIN_FILESATTACHMENT_USER_DEFAULT_ENABLE
						),
						'savetofiles' => Array(
							'enable' => PLUGIN_FILESRCVATTACHMENT_USER_DEFAULT_ENABLE
						)
					)
				)
			)
		));
	}
}

?>
