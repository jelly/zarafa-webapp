<?php
/**
 * Salesforce Plugin
 *
 * Integrates Salesforce into the Zarafa environment
 *
 */
class Pluginsalesforce extends Plugin {

	/**
	 * Constructor
	 */
	function Pluginsalesforce() {}

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
			case 'server.index.load.custom' :
				if($data['name'] == 'salesforce') {
					$this->createCaseFromEmail($data);
				}
				break;
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default
	 * settings. Registers the sysadmin defaults for the Salesforce plugin.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'salesforce' => Array(
							'enable'            => PLUGIN_SALESFORCE_USER_DEFAULT_ENABLE,
						)

					)
				)
			)
		));
	}


	function createCaseFromEmail() {
		error_reporting(E_ALL);
		require 'SalesForceAPI.php';

		if(isset($_GET['entryid'])) {
			$_SESSION['entryid'] 		= $_GET['entryid'];
			$_SESSION['parent_entryid'] = $_GET['parent_entryid'];
			$_SESSION['store_entryid'] 	= $_GET['store_entryid'];
		}

		$entryid 		= $_SESSION['entryid'];
		$parent_entryid = $_SESSION['parent_entryid'];
		$store_entryid 	= $_SESSION['store_entryid'];


		try {
			$api = new SalesForceAPI();

			$messageInfo = $this->getMessageInfo($entryid, $parent_entryid, $store_entryid);

			$contactsArray = $api->findContactsByEmail($messageInfo['contactEmail']);

			$contactId = $contactsArray[0]->Id;

			$data = array(
				'ContactId' => $contactId,
				'Subject'   => $messageInfo['messageSubject'],
				'Description'   => $messageInfo['messageBody']
			);
			$uri  =  $api->createCase($data);
			header('Location: ' . $uri);

		} catch(Exception $e) {
			print_r($e);
		}

	}

	function getMessageInfo($entryid, $parent_entryid, $store_entryid) {
		include("server/core/class.operations.php");
		$GLOBALS["operations"] = new Operations();
		$messageInfo = array(
			'contactEmail' 		=> '',
			'messageSubject' 	=> '',
			'messageBody' 		=> ''
		);
		//Open record and get the sender email, email subject and description
		$store = $GLOBALS["mapisession"]->openMessageStore(hex2bin($store_entryid));

		if(is_resource($store)) {
			$mapiMessage = mapi_msgstore_openentry($store, hex2bin($entryid));

			if($mapiMessage) {
				$senderStructure	=	$GLOBALS["operations"]->getSenderAddress($mapiMessage);

				$messageInfo['contactEmail'] = $senderStructure['props']['smtp_address'];

				$messageProps  = mapi_getprops($mapiMessage, array( PR_SUBJECT, PR_BODY));
				$messageInfo['messageSubject'] = isset($messageProps[PR_SUBJECT])? $messageProps[PR_SUBJECT] : '';
				$messageInfo['messageBody'] = isset($messageProps[PR_BODY])? $messageProps[PR_BODY] : '';
			}
		}
		return $messageInfo;

	}
}

?>
