<?php
/**
 * Dropbox Plugin
 *
 * Integrates Dropbox into the Zarafa environment
 *
 */
class Plugindropboxattachment extends Plugin {

	/**
	 * Constructor
	 */
	function Plugindropboxattachment() {}

	/**
	 * Function initializes the Plugin and registers all hooks
	 *
	 * @return void
	 */
	function init() {
			$this->registerHook('server.core.settings.init.before');
			$this->registerHook('server.index.load.custom');
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
			case 'server.index.load.custom':
				if ($data['name']=='dropboxattachment') {
					$this->authorise($data);
				}
				break;
		}
	}

	/**
	 * gets access token for requests
	 * for the dropbox api and closes the additioonal window
	 * on frontend that was created for authorisation
	 * @param {Array} &$data Received data from the request
	 * @private
	 */
	private function authorise(&$data) {
		spl_autoload_register(function($class){
			$class = str_replace('\\', '/', $class);
			require_once($class . '.php');
		});
		$key      = PLUGIN_DROPBOXATTCHMENT_KEY;
		$secret   = PLUGIN_DROPBOXATTCHMENT_SECRET_KEY;

		// Check whether to use HTTPS and set the callback URL
		$protocol = (!empty($_SERVER['HTTPS'])) ? 'https' : 'http';
		$script = substr($_SERVER['PHP_SELF'], 0, strrpos($_SERVER['PHP_SELF'], 'zarafa')).'/index.php';
		$callback = $protocol . '://' . $_SERVER['HTTP_HOST'] . $script.'?subsystem='. $_GET['subsystem'].'&load=custom&name=dropboxattachment&action=authorise';

		$encrypter = new \Dropbox\OAuth\Storage\Encrypter('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
		$storage = new \Dropbox\OAuth\Storage\Session($encrypter);
		$OAuth = new \Dropbox\OAuth\Consumer\Curl($key, $secret, $storage, $callback);
		$this->dropbox = new \Dropbox\API($OAuth, 'dropbox');
		$data = $_GET;
		$GLOBALS['PluginManager']->loadSessionData('dropboxattachment');
		$_SESSION[$OAuth->storage->getNamespace()] = $this->sessionData;
		if(isset($data['uid'], $data['oauth_token'])) {
			$this->dropbox->getOAuth()->getAccessToken();
			echo '<script>window.close()</script>';
			die();
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default
	 * settings. Registers the sysadmin defaults for the DROPBOX plugin.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'dropbox' => Array(
							'enable'            => PLUGIN_DROPBOXATTACHMENT_USER_DEFAULT_ENABLE,
						)

					)
				)
			)
		));
	}

	/**
	 * Retrieves data from session for the dropbox api
	 * @return {Object} Object in SESSION in namespace of dropbox api
	 */
	function getSessionData() {
		return $_SESSION['dropbox_api'];
	}
}

?>
