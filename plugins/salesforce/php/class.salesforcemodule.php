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
		$key      = 'uhbryjmyuqcw8sj';
		$secret   = 'c1zdzobqzkpdv6v';

		// Check whether to use HTTPS and set the callback URL
		$protocol = (!empty($_SERVER['HTTPS'])) ? 'https' : 'http';

		$urlChunks = parse_url($_SERVER['REQUEST_URI']);
		$callback = $protocol . '://' . $_SERVER['HTTP_HOST'] . str_replace('zarafa.php', 'index.php', $urlChunks['path']) .'?subsystem=1'. $_GET['subsystem'].'&load=module&module=dropboxmodule&action=authorise';

		// Instantiate the required Dropbox objects
		$encrypter = null;//new \Dropbox\OAuth\Storage\Encrypter('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
		$storage = new \Dropbox\OAuth\Storage\Session($encrypter);
		$OAuth = new \Dropbox\OAuth\Consumer\Curl($key, $secret, $storage, $callback);
		$this->dropbox = new \Dropbox\API($OAuth);
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
							$result = $this->downloadSelectedDropBoxFilesToTmp($actionData);
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
						$this->dropbox->getOAuth()->getRequestToken();
						$url = $this->dropbox->getOAuth()->getAuthoriseUrl();
						$e->url = $url;
						$response['items'] = array(
							'code'=>$e->getCode(),
							'url'=>$e->getUrl(),
							'message'=>$e->getMessage()
						);
						$response["status"]= false;
						$this->addActionData("exception", $response);
						$GLOBALS["bus"]->addData($this->getResponseData());
					}
				}

			}
		}
		return $result;
	}

	/**
	 * loads content of current folder - list of folders and files from Dropbox
	 * @param {Array} $actionData
	 */
	public function loadNode($actionData)
	{
		global $state;
		$folderStruct = $state->read('dropboxFolderStructure');
		$nodeId = $actionData['id'];
		if($nodeId == 'root') {
			$nodes = $this->getFolderContent('/');
			$response["items"] = $nodes;
		} else {
			$nodes = $this->getFolderContent($folderStruct[$nodeId]['path']);
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
	private function getFolderContent($path) {
		global $state;
		$nodes = array();
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
		$state->write('dropboxFolderStructure', $nodes);
		return array_values($nodes);
	}

	/**
	 * Downloads file from the Dropbox service and saves it in tmp
	 * folder with unique name
	 * @param {Array} $actionData
	 * @private
	 */
	private function downloadSelectedDropBoxFilesToTmp($actionData) {
		global $state;
		$ids = $actionData['ids'];
		$dialogAttachmentId = $actionData['dialog_attachments'];
		$storeId = $actionData['store_entry_id'];
		$entryId = $actionData['entryid'];
		$response = array();
		$struct = $state->read('dropboxFolderStructure');
		$attachment_state = new AttachmentState();
		$attachment_state->open();
		foreach ($ids as $id) {
			$node = $struct[$id];
			$filename = mb_basename(stripslashes($node['filename']));
			$path = $node['path'];
			$tmpname = $attachment_state->getAttachmentTmpPath($filename);
			$mime = $this->dropbox->getFile($path, $tmpname);
			$response['items'][] = array(
				'name' => $filename,
				'size' => filesize($tmpname),
				'tmpname'=> mb_basename($tmpname)
			);
			$attachment_state->addAttachmentFile($dialogAttachmentId, mb_basename($tmpname), Array(
				"name"       => $filename,
				"size"       => filesize($tmpname),
				"type"       => 'image/jpeg',
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
	 * dies.
	 * @private
	 */
	private function authorise($data) {
		if(isset($data['uid'], $data['oauth_token'])) {
			$this->dropbox->getOAuth()->getAccessToken();
			echo '<script>window.close()</script>';
			die();
		}

	}

};

?>
