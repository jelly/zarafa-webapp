<?php
include('version.php');
include('Files/class.helper.php');

$backend = preg_replace('/[^A-Za-z0-9_\-]/', '_', $GLOBALS["settings"]->get("zarafa/v1/contexts/files/backend"));
require_once('Files/' . $backend . '_backend.php');
require_once('Files/cachemanager.php');

/**
 * This module handles all list and change requests for the webdav browser.
 *
 * @class FilesBrowserModule
 * @extends ListModule
 */
class FilesBrowserModule extends ListModule {

	/**
	 * @var object The webdav-client object
	 */
	private $wdc;
	
	/**
	 * @var object The cachemanager object
	 */
	private $cache;

	/**
	 * @constructor
	 * @param int $id unique id.
	 * @param array $data list of all actions.
	 */
	function FilesBrowserModule($id, $data) {
		parent::ListModule($id, $data);

		$this->start = 0;
	}

	/**
	 * Initialize PHP backend API of Files
	 *
	 * @access private
	 * @return void
	 */
	private function bootstrap() {
		$backend = preg_replace('/[^A-Za-z0-9_\-]/', '_', $GLOBALS["settings"]->get("zarafa/v1/contexts/files/backend")) . "_backend";
		$this->wdc = new $backend;
		$fp_base = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/files_path");
		$fp_server = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/server");
		$fp_ssl = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/use_ssl");
		
		$this->wdc->set_server($fp_server);
		$this->wdc->set_ssl($fp_ssl);
		if($fp_ssl == true) {
			$this->wdc->set_port(intval($GLOBALS["settings"]->get("zarafa/v1/contexts/files/port_ssl")));
		} else {
			$this->wdc->set_port(intval($GLOBALS["settings"]->get("zarafa/v1/contexts/files/port")));
		}		
		$this->wdc->set_base($fp_base);
		// enable debugging
		$this->wdc->set_debug($_ENV["FP_PLUGIN_DEBUG"]);
		
		// logon to files
		$this->authorise();
		
		// initialize the cachemanager
		$this->cache = new cache_manager(PLUGIN_FILESBROWSER_TMP, $GLOBALS["settings"]->get("zarafa/v1/contexts/files/enable_caching"));
	}

	/**
	 * Executes all the actions in the $data variable.
	 * Exception part is used for webdav errors also.
	 *
	 * @return boolean true on success or false on failure.
	 */
	public function execute() {
		$result = false;
		
		$this->bootstrap();
		
		foreach($this->data as $actionType => $actionData) {
			if(isset($actionType)) {
				try {
					Helper::log("exec: " . $actionType, "Browser");
					$this->wdc->open();
					
					switch($actionType) {
						case "list":
							$result = $this->loadNode($actionType, $actionData);
							break;
						case "loaddirectory":
							$result = $this->loadNodeTreeLoader($actionType, $actionData, !$actionData['loadfiles']);
							break;
						case "delete":
							$result = $this->delete($actionType, $actionData);
							break;
						case "open":
							$result = $this->open($actionType, $actionData);
							break;
						case "move":
							$result = $this->move($actionType, $actionData);
							break;
						case "save":
							$result = $this->save($actionType, $actionData);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}

				} catch (MAPIException $e) {
					Helper::log("mapi exception: " . $e->getMessage(), "Browser");
				} catch (BackendException $e) {
					// always clear cache - otherwhise the next request will probably not fail...
					$this->cache->clear();
					
					$this->sendFeedback(false, array(
						'type' => ERROR_GENERAL,
						'info' => array(
							'original_message' => $e->getMessage(),
							'display_message' => $e->getMessage()
						)
					));
					
					Helper::log("backend exception: " . $e->getMessage() . " (" . $e->getCode() . ")", "Core");
				}
			}
		}
		return $result;
	}

	/**
	 * loads content of current folder - list of folders and files from Files
	 *
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	public function loadNode($actionType, $actionData) {
		$nodeId = $actionData['id'];
		$response = array();
		
		Helper::log("parsing dir: " . $nodeId, "Browser");
		
		$nodes = $this->getFolderContent($nodeId, false, false);
		$nodes = $this->sortFolderContent($nodes, $actionData, false);
		
		if($nodeId != "/") { // add a back button (browser only)
			$parentdir =  dirname($nodeId); // get parent dir
			if($parentdir != "/") {
				$parentdir = $parentdir . "/";
			}
		
			$nodes = array($parentdir => 
				array('props' =>
					array(
						'id' => rawurldecode($parentdir),
						'path' => "../",
						'filename'=> "..",
						'message_size' => -1,
						'lastmodified' => null,
						'message_class' => "IPM.Files",
						'type'=> 0
					),
					'entryid' => rawurldecode($parentdir),
					'store_entryid' => 'files',
					'parent_entryid' => dirname(rawurldecode($parentdir)) . "/"
				)
			) + $nodes;
		}
		
		$response["item"] = array_values($nodes);
		
		
		$response['page'] = array("start" => 0, "rowcount" => 50, "totalrowcount" => count($response["item"]));
		$response['folder'] = array("content_count" => count($response["item"]), "content_unread" => 0);
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
		
		Helper::log("nodes loaded, bus data written!", "Browser");
	}
	
	/**
	 * loads content of current folder - list of folders and files from Files
	 * this function is used for the TreeLoader
	 *
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @param boolean $onlyfolders default false, if set to true, only folders will be loaded
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	public function loadNodeTreeLoader($actionType, $actionData, $onlyfolders = false) {	
		$nodeId = $actionData['id'];
		
		$response = array();
		$nodes = $this->getFolderContent($nodeId, $onlyfolders, true);
		$nodes = $this->sortFolderContent($nodes, $actionData, true);
		
		$response["items"] = array_values($nodes);
		$response['status'] = true;
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
		
		Helper::log("navtree nodes loaded, bus data written!", "Browser");
	}
	
	/**
	 * Forms the structure needed for frontend
	 * for the list of folders and files
	 *
	 * @param string $nodeId the name of the current root directory
	 * @param boolean $onlyfolders if true, files will be skept
	 * @param boolean $navtree parse for navtree or browser
	 * @param boolean $childcheck if set to true, this function will be
	 * 							  called recursivly to check subfolders.
	 *							  HINT: this has a huge impact on performance!
	 *
	 * @throws WebDAVException if the webdav request fails
	 * @return array of nodes for current path folder
	 */
	public function getFolderContent($nodeId, $onlyfolders = false, $navtree = false, $childcheck = true) {
		$nodes = array();
		
		$cache_object = $this->cache->get($nodeId);
		
		if(!is_null($cache_object)) {
			$dir = $cache_object;
		} else {
			$dir = $this->wdc->ls($nodeId);
			$this->cache->put($nodeId, $dir);
		}
		
		if($dir) {
			$parentdir =  dirname($nodeId); // get parent dir
			if($parentdir != "/") {
				$parentdir = $parentdir . "/";
			}
			
			foreach($dir as $id => $node) {
				$type = 1;
				
				if (strcmp($node['resourcetype'],"collection") == 0) { // we have a folder
					$type = 0;
				}
				
				// Check if foldernames have a trailing slash, if not, add one!
				if($type == 0 && !Helper::endsWith($id, "/")) {
					$id .= "/";
				}
				
				Helper::log("parsing: " . $id . " in base: " . $nodeId, "Helper");
				
				$filename =  basename($id);

				if($navtree) {
					if ($type == 0) { // we have a folder
						$nodes[$id] = array(
							'id' => $id,
							'path' => dirname($id),
							'text' => $filename,
							'expanded' => false,
							'isFolder' => true, // needed to set class correctly
							'filename'=>$filename
						);
						// check if node has children
						if($childcheck) {
							$children = array();
							$children = $this->getFolderContent($id, $onlyfolders, $navtree, false);
							
							if(empty($children)) {
								$nodes[$id]["leaf"] = true;
							}
						}
					} else {
						if(!$onlyfolders) { // skip files if $onlyfolders == true
							$nodes[$id] = array(
								'id' => $id,
								'path' => dirname($id),
								'text' => $filename . '(' . Helper::human_filesize(intval($node['getcontentlength'])) . ')',
								'filesize' => intval($node['getcontentlength']),
								'isFolder' => false,
								'filename' => $filename,
								'expanded' => false,
								'leaf' => true,
								'checked'=> false
							);
						}
					}
				} else {
					$nodes[$id] = array('props' =>
						array(
							'id' => rawurldecode($id),
							'path' => dirname(rawurldecode($id)),
							'filename'=>$filename,
							'message_size' => $node['getcontentlength'] == null ? -1 : intval($node['getcontentlength']),
							'lastmodified' => strtotime($node['getlastmodified']) * 1000,
							'message_class' => "IPM.Files",
							'type'=> $type
						),
						'entryid' => rawurldecode($id),
						'store_entryid' => 'files',
						'parent_entryid' => dirname($id) . "/"
					);
				}
			}
		} else {
			Helper::log("could not parse, possible empty dir", "Browser");
		}
		
		return $nodes;
	}
	
	/**
	 * This functions sorts an array of nodes.
	 *
	 * @param array $nodes array of nodes to sort
	 * @param array $data all parameters contained in the request
	 * @param boolean $navtree parse for navtree or browser
	 *
	 * @return array of sorted nodes
	 */
	public function sortFolderContent($nodes, $data, $navtree = false) {
		$sortednodes = array();
		
		$sortkey = "filename";
		$sortdir = "ASC";
		
		if(isset($data['sort'])) {
			$sortkey = $data['sort'][0]['field'];
			$sortdir = $data['sort'][0]['direction'];
		}
		
		Helper::log("sorting by " . $sortkey . " in direction: " . $sortdir, "Helper");
		
		$sortednodes = Helper::sort_by_key($navtree, $nodes, $sortkey, $sortdir);
		
		return $sortednodes;
	}
	
	/**
	 * Deletes the selected files on the webdav server
	 *
	 * @access private
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function delete($actionType, $actionData) {
		$nodeId = $actionData['entryid'];
		$result = $this->wdc->delete($nodeId);
		Helper::log("deleted: " . $nodeId . ", worked: " . $result, "Browser");
		
		$cacheKey = rtrim($nodeId, "/"); // this just hits folders...
		$this->cache->remove($cacheKey); // remove cached object..
		
		if($result) {
			$response['status'] = true;
			$this->addActionData($actionType, $response);
			$GLOBALS["bus"]->addData($this->getResponseData());
		}
	}
	
	/**
	 * Handle open requests
	 *
	 * @access private
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function open($actionType, $actionData) {
		$nodeId = $actionData['entryid'];
		
		$node = $this->wdc->is_dir($nodeId);
		
		$filename =  basename($nodeId);
		$type = strcmp($node['resourcetype'],"collection") === 0 ? 0 : 1; // 0 means folder, 1 file
		
		$result = array('props' =>
			array(
				'id' => rawurldecode($nodeId),
				'path' => dirname(rawurldecode($nodeId)),
				'filename'=>$filename,
				'message_size' => $node['getcontentlength'] == null ? 0 : intval($node['getcontentlength']),
				'lastmodified' => strtotime($node['lastmodified']) * 1000,
				'message_class' => "IPM.Files",
				'type'=> $type
			),
			'entryid' => rawurldecode($nodeId),
			'store_entryid' => 'files',
			'parent_entryid' => dirname($nodeId) . "/"
		);
		$response['item'] = $result;
		$this->addActionData("item", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Handles the saverequests. Those requests could either be a new folder creation or a renamed file
	 *
	 * @access private
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 *
	 * @return void
	 */
	private function save($actionType, $actionData) {
		if(count($actionData["props"]) <= 2) { // we only submit the new filename and id on a rename...
			$this->rename($actionType, $actionData);
		} else {
			$this->createDirectory($actionType, $actionData);
		}
	}
	
	/**
	 * Moves the selected files on the webdav server
	 *
	 * @access private
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function move($actionType, $actionData) {
		$dst = rtrim($actionData['destination'], '/');
		$overwrite = false;
		if(isset($actionData['overwrite']) && $actionData['overwrite'] === true) {
			$overwrite = true;
		}
		$result = array();
		$overall_status = true;
		$message = "";
		$errorids = array();
		
		for($i = 0; $i < count($actionData['ids']); $i++) {
			$source = rtrim($actionData['ids'][$i], '/');
			$destination = $dst . '/' . Helper::getFilenameFromPath($source);
			
			$result[$i] = $this->wdc->move($source, $destination, $overwrite);
			$this->cache->remove($source);
			
			if(!$result[$i]) {
				$overall_status = false;
				$errorids[] = $actionData['ids'][$i];
				$message = "Moving item " . $actionData['ids'][$i] . " to " . $destination . " failed! (" . $result[$i] . ")";
			}
			
			Helper::log("move status: " . $result[$i], "Browser");
		}
		
		$this->cache->remove($actionData['destination']); // clear cache for destination folder too
		
		if(!$overall_status) { // something went wrong...
			$response['faileditems'] = $errorids;
			$response['message'] = $message;
		}
		
		$response['status'] = $overall_status;
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Renames the selected file on the webdav server
	 *
	 * @access private
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function rename($actionType, $actionData) {
		$isfolder = "";
		if(substr($actionData['entryid'], -1) == '/') {
			$isfolder = "/"; // we have a folder...
			Helper::log("ISFOLDER", "Browser");
		}
		
		$src = rtrim($actionData['entryid'], '/');
		$dstdir = dirname($src) == "/" ? "" : dirname($src);
		$dst = $dstdir . "/" .  rtrim($actionData['props']['filename'], '/');
		
		$result = $this->wdc->move($src, $dst, false);
		
		$this->cache->remove($src);
		
		Helper::log("Renamed: " . $src . " to: " . $dst . ", worked: " . $result, "Browser");
			
		if($result) {
			/* create the response object */
			$folder = array();
			
			$folder[dirname($src)] = array(
				'props' =>
					array(
						'id' => rawurldecode($dst.$isfolder) ,
						'path' => dirname(rawurldecode($dst)),
						'filename'=> $actionData['props']['filename']
					),
				'entryid' => rawurldecode($dst.$isfolder),
				'store_entryid' => 'files',
				'parent_entryid' => dirname(dirname($src))
			);
			$response['item'] = array_values($folder);
			
			$this->addActionData("update", $response);
			$GLOBALS["bus"]->addData($this->getResponseData());
		}
	}
	
	/**
	 * Creates a new directory.
	 *
	 * @access private
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function createDirectory($actionType, $actionData) {
		$actionData = $actionData["props"];
		$dirname = $actionData["id"];
		$result  = $this->wdc->mkcol($dirname); // create it !
		
		$parentdir =  dirname($dirname);  // get parent dir
		if($parentdir != "/") {
			$parentdir = $parentdir . "/";
		}
		
		$this->cache->remove($parentdir);
		
		Helper::log("Created dir: " . $dirname . ", worked: " . $result, "Browser");
		
		$response = array();
		
		if($result) {
			/* create the response folder object */
			$folder = array();
			
			$folder[$dirname] = array(
				'props' =>
					array(
						'id' => rawurldecode($dirname),
						'path' => dirname(rawurldecode($dirname)),
						'filename'=> $actionData["filename"],
						'message_size' => 0,
						'lastmodified' => $actionData['lastmodified'],
						'message_class' => "IPM.Files",
						'type'=> $actionData['type']
					),
				'entryid' => rawurldecode($dirname),
				'store_entryid' => 'files',
				'parent_entryid' => $parentdir
			);
			$response['item'] = array_values($folder);
			
			$this->addActionData("update", $response);
			$GLOBALS["bus"]->addData($this->getResponseData());
		}
	}

	/**
	 * Sets access token for Files's WebDav Interface
	 *
	 * @access private
	 * @return void
	 */
	private function authorise() {
		if($GLOBALS["settings"]->get("zarafa/v1/contexts/files/session_auth") == true) {
			$sessionPass = $_SESSION['password'];
			// if user has openssl module installed
			if(function_exists("openssl_decrypt")) {
				if(version_compare(phpversion(), "5.3.3", "<")) {
					$sessionPass = openssl_decrypt($sessionPass,"des-ede3-cbc",PASSWORD_KEY,0);
				} else {
					$sessionPass = openssl_decrypt($sessionPass,"des-ede3-cbc",PASSWORD_KEY,0,PASSWORD_IV);
				}
				
				if(!$sessionPass) {
					$sessionPass = $_SESSION['password'];
				}
			}
			
			$this->wdc->set_user($_SESSION["username"]);
			$this->wdc->set_pass($sessionPass);
		} else {
			$this->wdc->set_user($GLOBALS["settings"]->get("zarafa/v1/contexts/files/username"));
			$this->wdc->set_pass(base64_decode($GLOBALS["settings"]->get("zarafa/v1/contexts/files/password")));
		}
		
		Helper::log("auth for " . $GLOBALS["settings"]->get("zarafa/v1/contexts/files/username"), "Browser");
	}
	
	/**
	 * Function will be used to process private items in a list response,
	 * Files doesn't have private items so function is overriden to not do 
	 * any processing.
	 *
	 * @param object $item item properties
	 *
	 * @return object item properties if its non private item otherwise empty array
	 */
	function processPrivateItem($item) {
		return $item;
	}
}
?>
