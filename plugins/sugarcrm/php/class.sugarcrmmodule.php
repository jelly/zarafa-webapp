<?php
/**
 * SugarCRM module.
 *
 */

require_once(PATH_PLUGIN_DIR . "/sugarcrm/php/inc/class.defaultauthentication.php");
require_once(PATH_PLUGIN_DIR . "/sugarcrm/php/inc/class.sugarcrmauthentication.php");

class SugarcrmModule extends Module
{
	public function __construct($id, $data) {
		parent::Module($id, $data);
	}

	/**
	 * Process the incoming events that were fire by the client.
	 *
	 * @return boolean True if everything was processed correctly.
	 */
	public function execute()
	{
		$result = false;

		foreach($this->data as $actionType => $actionData)
		{
			if(isset($actionType)) {
				try {
					switch($actionType)
					{
						case "archive":
							$result = $this->archive($actionData);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}

				} catch (MAPIException $e) {
					$this->sendFeedback(false, $this->errorDetailsFromException($e));
				}

			}
		}
		return $result;
	}

	/**
	 * Opens the record with provided entryid, and archive it to SugarCRM.
	 *
	 * @param mixed $action The data that holds the entryid, parent_entryid and store_entryid.
	 **/
	public function archive($action) {

		$entryid = $action['entryid'];
		$parententryid = $action['parent_entryid'];
		$storeentryid = $action['store_entryid'];

		// build a connection manager from config
		$profile = array(
			"url" 		=> PLUGIN_SUGARCRM_SERVER_URL,
			"username" 	=> PLUGIN_SUGARCRM_USERNAME,
			"password" 	=> PLUGIN_SUGARCRM_PASSWORD,
			"authClass" => PLUGIN_SUGARCRM_AUTH_CLASS,
			"archiveUri" => PLUGIN_SUGARCRM_ARCHIVE_URI,
			"sessionTimeout" => 60 * 10
		);

		// use z-merge authentication libs
		$classname = $profile['authClass'];

		// cancel if it's not possible to read the RFC822 directly from PHP-MAPI or the connector class doesn't exist
		if (!function_exists("mapi_inetmapi_imtoinet") || !class_exists($classname)) {
			$response = array("status" => "failed");

			if (!class_exists($classname))
				$response["message"]= dgettext('plugin_zma', "Authentication class not found for SugarCRM");
			else
				$response["message"]= dgettext('plugin_zma', "This version of Zarafa doesn't support this functionality.");

			$response["attributes"] = array("type" => "archiveResponse");
			array_push($maillist->responseData["action"], $response);
			$GLOBALS["bus"]->addData($maillist->responseData);
			return true;
		}

		// get message and addressbook
		$store = $GLOBALS["mapisession"]->openMessageStore(hex2bin($storeentryid));

		$message = mapi_msgstore_openentry($store, hex2bin($entryid));
		$addrBook = mapi_openaddressbook($GLOBALS["mapisession"]->getSession());

		// open stream
		$stream = mapi_inetmapi_imtoinet($GLOBALS["mapisession"]->getSession(), $addrBook, $message, array());

		// try to load existing session information for this profile
		$saved_session = $this->getData('sugarcrm');
		if (!is_array($saved_session)) $saved_session = array();

		// instantiate the authentication class
		$authClass = new $classname($profile, $saved_session);

		// build data
		$moreData = array(
			"user" => $GLOBALS["mapisession"]->getUserName(),
			"archivefile" => $parententryid . "&" . $entryid
		);

		// upload file
		$response = $authClass->uploadData($profile['archiveUri'], $stream, "archivefile.txt", "message/rfc822", $moreData);

		// save existing session information for this profile
		if ($authClass->isSessionValid())
			$this->setData('sugarcrm', $authClass->getSessionData());

		if (isset($response['message'])) $response['message'] = dgettext('plugin_zma', $response['message']);

		$response["attributes"] = array("type" => "archiveResponse");
		$this->addActionData("item", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
}
?>
