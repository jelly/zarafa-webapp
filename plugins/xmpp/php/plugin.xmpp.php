<?php

/**
* Handles the required server-side information for the XMPP plugin.
*/
class Pluginxmpp extends Plugin {
	// Constructor
	function Pluginxmpp(){}

	/**
	 * Called to initialize the plugin and register for hooks.
	 */
	function init(){
		$this->registerHook('server.core.settings.init.before');
	}

	/**
	 * 
	 * @param String $eventID Identifier of the hook
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function execute($eventID, &$data){
		switch($eventID){
			case 'server.core.settings.init.before':
				$this->onBeforeSettingsInit($data);
				break;
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default 
	 * settings. Registers the sysadmin defaults for the XMPP plugin.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function onBeforeSettingsInit(&$data){
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'xmpp' => Array(
							'enable' => PLUGIN_XMPP_USER_DEFAULT_ENABLE,
							'domain' => PLUGIN_XMPP_CONNECT_DOMAIN,
							'httpbase' => PLUGIN_XMPP_CONNECT_HTTPBASE,
							'resource' => PLUGIN_XMPP_CONNECT_RESOURCE,
							'port' => PLUGIN_XMPP_CONNECT_PORT,
							'ssl' => PLUGIN_XMPP_CONNECT_SSL
						)
					)
				)
			)
		));
	}
}
?>
