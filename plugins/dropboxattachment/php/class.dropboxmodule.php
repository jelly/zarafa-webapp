<?php

/**
 * This module integrates Dropbox into attachment part of emails
 * @class DropboxModule
 * @extends Module
 */
class DropboxModule extends Module {


	/**
	 * @constructor
	 * @param $id
	 * @param $data
	 */
	public function __construct($id, $data)
	{
			parent::Module($id, $data);
			$this->bootstrap();
	}

	/**
	 * Initialize PHP API of Dropbox
	 * Autoload classes needed to work with API
	 */
	private function bootstrap() {
		// Register a simple autoload function
		spl_autoload_register(function($class){
			$class = str_replace('\\', '/', $class);
			require_once($class . '.php');
		});

		// Set your consumer key, secret and callback URL
		$key      = PLUGIN_DROPBOXATTCHMENT_KEY;
		$secret   = PLUGIN_DROPBOXATTCHMENT_SECRET_KEY;

		// Check whether to use HTTPS and set the callback URL
		$protocol = (!empty($_SERVER['HTTPS'])) ? 'https' : 'http';
		//here we recieve the path to WEBAPP_PATH/index.php for addressing
		//from the callback after dropbox authorisation
		$script = substr($_SERVER['PHP_SELF'], 0, strrpos($_SERVER['PHP_SELF'], 'zarafa')).'/index.php';
		$callback = $protocol . '://' . $_SERVER['HTTP_HOST'] . $script.'?subsystem='. $_GET['subsystem'].'&load=custom&name=dropboxattachment&action=authorise';

		// Instantiate the required Dropbox objects
		$encrypter = new \Dropbox\OAuth\Storage\Encrypter('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
		$storage = new \Dropbox\OAuth\Storage\Session($encrypter);
		$OAuth = new \Dropbox\OAuth\Consumer\Curl($key, $secret, $storage, $callback);
		$this->dropbox = new \Dropbox\API($OAuth, 'dropbox');
	}



	/**
	 * Executes all the actions in the $data variable.
	 * Exception part is used for authentication errors also
	 * @return boolean true on success or false on failure.
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
						case "loadnode":
							$result = $this->loadNode($actionData);
							break;
						case "download-to-tmp":
							$result = $this->downloadSelectedDropboxFilesToTmp($actionData);
							break;
						case "authorise":
							$result = $this->authorise($actionData);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}

				} catch (MAPIException $e) {
					$this->sendFeedback(false, $this->errorDetailsFromException($e));
				} catch (\Dropbox\Exception $e) {
					if ($e->getCode() == 401 || $e->getCode() == 403) {
						//if we are unauthorised or the token has reached his lifetime,
						//throw an exception for re-authorizing
						$this->getUrlForAuthorisationRedirect($e);
					}
					$this->sendFeedback(false, $this->errorDetailsFromException($e));
				}

			}
		}
		return $result;
	}

	/**
	 * Recieve an url, which we set in exception;
	 * This url is for redirecting user to authorisation dialog
	 * on dropbox side
	 * @param Exception $e
	 * @private
	 */
	private function getUrlForAuthorisationRedirect($e) {
			$token = $this->dropbox->getOAuth()->getToken();
			if (!$token->oauth_token) {
				//obtain a request token
				$this->dropbox->getOAuth()->getRequestToken();
			}
			//obtain an url for suggestion for user to authenticate our application on dropbox
			$url = $this->dropbox->getOAuth()->getAuthoriseUrl();
			$e->url = $url;
			$GLOBALS['PluginManager']->saveSessionData('dropboxattachment');
	}

	/**
	 * loads content of current folder - list of folders and files from Dropbox
	 * @param {Array} $actionData
	 */
	public function loadNode($actionData)
	{
		$state = $GLOBALS['state'];
		$folderStruct = $state->read('dropboxFolderStructure');
		$nodeId = $actionData['id'];
		if($nodeId == 'root') {
			$nodes = $this->getFolderContent('/');
			$response["items"] = $nodes;
		} else {
			$nodes = $this->getFolderContent($folderStruct, $nodeId);
			$response["items"] = $nodes;
		}
		$response['status']	=	true;
		$this->addActionData("loadnode", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}

	/**
	 * form the structure needed for frontend
	 * for the list of folders and files
	 * @param {string} $path
	 * @return {Array} nodes for current path folder
	 * @private
	 */
	private function getFolderContent($folderStruct, $nodeId = 'root') {
		$state = $GLOBALS['state'];
		$nodes = array();
		if ($folderStruct=='/') {
			$path = '/';
			$resultStructure = array();
		} else {
			$path = $folderStruct[$nodeId]['path'];
			$resultStructure = $folderStruct;
		}
		$metaData = $this->dropbox->metaData($path);
		foreach( $metaData['body']->contents as $node) {
			$filename =  mb_basename($node->path);
			if ($node->is_dir) {
				$nodes[$node->rev] = array(
					'id'	=>	$node->rev,
					'path'	=>	$node->path,
					'text'	=>	$filename,
					'filename'=>$filename
				);
			} else {
				$nodes[$node->rev] = array(
					'id'	=>	$node->rev,
					'path'	=>	$node->path,
					'text'	=>	$filename.'('.$node->size.')',
					'filename'=>$filename,
					'leaf'	=>	true,
					'checked'=>	false
				);
			}
		};
		$resultStructure = array_merge($resultStructure, $nodes);
		$state->write('dropboxFolderStructure', $resultStructure);
		return array_values($nodes);
	}

	/**
	 * Downloads file from the Dropbox service and saves it in tmp
	 * folder with unique name
	 * @param {Array} $actionData
	 * @private
	 */
	private function downloadSelectedDropboxFilesToTmp($actionData) {
		$state = $GLOBALS['state'];
		$ids = $actionData['ids'];
		$dialogAttachmentId = $actionData['dialog_attachments'];
		$response = array();
		$struct = $state->read('dropboxFolderStructure');
		$attachment_state = new AttachmentState();
		$attachment_state->open();
		foreach ($ids as $id) {
			$node = $struct[$id];
			$filename = mb_basename(stripslashes($node['filename']));
			$tmpname = $attachment_state->getAttachmentTmpPath($filename);
			$path = $node['path'];
			$mime = $this->dropbox->getFile($path, $tmpname);
			$response['items'][] = array(
				'name' => $filename,
				'size' => filesize($tmpname),
				'tmpname'=> mb_basename($tmpname)
			);

			$attachment_state->addAttachmentFile($dialogAttachmentId, mb_basename($tmpname), Array(
				"name"       => $filename,
				"size"       => filesize($tmpname),
				"type"       => $mime['mime'],
				"sourcetype" => 'default',
			));
		}
		$attachment_state->close();
		$response['status'] = true;
		$this->addActionData("downloadtotmp", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}

	/**
	 * Sets access token for Dropbox's API
	 * @param {Array} $data
	 * @private
	 * dies.
	 */
	private function authorise($data) {
		$state = $GLOBALS['state'];
		if(isset($data['uid'], $data['oauth_token'])) {
			$token = $this->dropbox->getOAuth()->getAccessToken();
			$state->write('DropboxToken', $token);
			echo '<script>window.close()</script>';
			die();
		}
	}

	/**
	 * Function will retrieve error details from exception object based on exception type.
	 * it should also send type of exception with the data. so client can know which type
	 * of exception is generated.
	 * @param Object $exception the exception object which is generated.
	 * @return Array error data
	 * @overwrite
	 */
		function errorDetailsFromException($exception) {
			if($exception instanceof \Dropbox\Exception) {
				$exception->setHandled();
				return array(
					"error" => array(
						"type" => ERROR_ZARAFA,
						"info" => array(
							"file" => $exception->getFileLine(),
							"display_message" => $exception->getDisplayMessage(),
							"original_message" => $exception->getMessage(),
							"code"	=>$exception->getCode(),
							"url"	=>$exception->getUrl()
						)
					)
				);
			} else {
				parent::errorDetailsFromException($exception);
			}
		}
};

?>
