<?php
include('version.php');
include('Files/class.helper.php');

$backend = preg_replace('/[^A-Za-z0-9_\-]/', '_', $GLOBALS["settings"]->get("zarafa/v1/contexts/files/backend"));
require_once('Files/' . $backend . '_backend.php');
require_once('Files/cachemanager.php');

/**
 * This module integrates Files into attachment part of emails.
 * It also handles some basic requests like version loading and so on.
 *
 * @class FilesModule
 * @extends Module
 */
class FilesModule extends Module {

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
	 * @param int $id unique id of the class
	 * @param array $data list of all actions, which is received from the client
	 */
	public function __construct($id, $data) {
		parent::Module($id, $data);
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
					Helper::log("exec: " . $actionType, "Core");
					
					if($actionType != "getdynamics" && $actionType != "getversion") { // we don't need it to be loaded here.
						$this->wdc->open();
					}
					
					switch($actionType) {
						case "getversion":
							$result = $this->getVersion();
							break;
						case "getdynamics":
							$result = $this->getDynamics();
							break;
						case "download-to-tmp":
							$result = $this->downloadSelectedFilesToTmp($actionData);
							break;
						case "createdir":
							$result = $this->createDirectory($actionData);
							break;
						case "uploadtooc":
							$result = $this->uploadToFiles($actionData);
							break;
						case "updatesession":
							$result = $this->updateSession($actionData);
							break;
						case "clearcache":
							$result = $this->clearCache($actionType, $actionData);
							break;
						case "checkifexists":
							$result = $this->checkIfExists($actionType, $actionData);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}
				} catch (MAPIException $e) {
					Helper::log("mapi exception: " . $e->getMessage(), "Core");
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
					
					Helper::log("webdav exception: " . $e->getMessage(), "Core");
				}
			}
		}
		return $result;
	}
	
	/**
	 * Clears the whole cache
	 *
	 * @param string $actionType name of the current action
	 * @param array $actionData all parameters contained in this request
	 *
	 * @return void
	 */
	public function clearCache($actionType, $actionData) {
		$this->cache->clear();
		
		$response['status'] = true;
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}

	/**
	 * Downloads file from the Files service and saves it in tmp
	 * folder with unique name
	 *
	 * @access private
	 * @param array $actionData
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function downloadSelectedFilesToTmp($actionData) {
		$ids = $actionData['ids'];
		$dialogAttachmentId = $actionData['dialog_attachments'];
		$fp_base = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/files_path");
		$response = array();
		
		$attachment_state = new AttachmentState();
		
		// compatibility to older webapps than 1.3
		if(method_exists($attachment_state,"open")) {
			$attachment_state->open();
		}
		
		foreach ($ids as $id) {
			$file = $id;
			$filename = basename($file);
			
			// compatibility to older webapps than 1.3
			if(method_exists($attachment_state,"getAttachmentTmpPath")) {
				$tmpname = $attachment_state->getAttachmentTmpPath($filename);
			} else {
				$tmpname = tempnam(TMP_PATH, stripslashes($filename));
			}
			
			$path = dirname($file);
			
			Helper::log("Downloading: " . $filename . " to: " . $tmpname, "Core");
			
			// download file from webdav
			$buffer = null;
			$http_status = $this->wdc->get($file, $buffer);
			if($_ENV["FP_PLUGIN_DEBUG"]) {
				error_log("http-status: " . $http_status);
			}
			
			$fhandle = fopen($tmpname,'w');
			fwrite($fhandle,$buffer,strlen($buffer));
			fclose($fhandle); 
			
			$response['items'][] = array(
				'name' => $filename,
				'size' => filesize($tmpname),
				'tmpname'=>Helper::getFilenameFromPath($tmpname)
			);
			
			// mimetype is not required...
			$attachment_state->addAttachmentFile($dialogAttachmentId, Helper::getFilenameFromPath($tmpname), Array(
				"name"       => $filename,
				"size"       => filesize($tmpname),
				"sourcetype" => 'default'
			));
			Helper::log("filesize: " . filesize($tmpname), "Core");
		}
		
		$attachment_state->close();
		$response['status'] = true;
		$this->addActionData("tmpdownload", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}

	/**
	 * Sets access token for Files's WebDav Interface
	 *
	 * @access private
	 *
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
		
		Helper::log("auth for " . $GLOBALS["settings"]->get("zarafa/v1/contexts/files/username"), "Core");
	}
	
	/**
	 * upload the tempfile to files
	 *
	 * @access private
	 * @param array $actionData
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function uploadToFiles($actionData) {
		$result = true;

		if($actionData["type"] === "attachment") {
			foreach($actionData["items"] as $item) {
				list($tmpname, $filename) = $this->prepareAttachmentToStore($item);

				$dst = $actionData["destdir"] . $filename;

				if(isset($tmpname) && !empty($tmpname)) {
					$result = $result && $this->wdc->put_file($dst, $tmpname);
					unlink($tmpname);
				} else {
					$result = false;
				}
			}
		} elseif($actionData["type"] === "mail") {
			foreach($actionData["items"] as $item) {
				list($tmpname, $filename) = $this->prepareEmailForUpload($item);

				$dst = $actionData["destdir"] . $filename;

				if(isset($tmpname) && !empty($tmpname)) {
					$result = $result && $this->wdc->put_file($dst, $tmpname);
					unlink($tmpname);
				} else {
					$result = false;
				}
			}
		} else {
			$this->sendFeedback(false, array(
				'type' => ERROR_GENERAL,
				'info' => array(
					'original_message' => _("Unknown type - cannot save this file to the Files backend!"),
					'display_message' => _("Unknown type - cannot save this file to the Files backend!")
				)
			));
		}

		$this->cache->remove($actionData["destdir"]);
		
		Helper::log("Uploaded to: " . $actionData["destdir"] . " worked: " . $result, "Core");
		
		$response = array();
		$response['status'] = $result;
		$this->addActionData("uploadtooc", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * update the session variables for the files plugin
	 *
	 * @param array $actionData
	 * @return void
	 * @access private
	 */
	private function updateSession($actionData) {
	
		session_start();
		
		$session_prefix = "PLUGIN_FP_";
			
		$_SESSION[$session_prefix . "username"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/username");
		$_SESSION[$session_prefix . "password"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/password");
		$_SESSION[$session_prefix . "port"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/port");
		$_SESSION[$session_prefix . "portssl"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/port_ssl");
		$_SESSION[$session_prefix . "backend"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/backend");
		$_SESSION[$session_prefix . "server"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/server");
		$_SESSION[$session_prefix . "path"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/files_path");
		$_SESSION[$session_prefix . "sessionAuth"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/session_auth") === true ? 1 : 0;
		$_SESSION[$session_prefix . "useSSL"] = $GLOBALS["settings"]->get("zarafa/v1/contexts/files/use_ssl") === true ? 1 : 0;
		
		session_write_close();
		
		$response = array();
		$response['status'] = true;
		$this->addActionData("updatesession", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Returns files and plugin version.
	 * Or "Unknown" if no version could be detected.
	 * This is a owncloud only feature.
	 *
	 * @access private
	 */
	private function getVersion() {
		$response = array();
		$response['ocversion'] = "Unknown";
		
		// get version info
		$has_version_info = $this->wdc->supports("VERSION_INFO");
		
		if($has_version_info) {
			$response['ocversion'] = $this->wdc->getBackendVersion();
		}
		
		$response['version'] = $_ENV["FP_PLUGIN_VERSION"];
		$this->addActionData("getversion", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Returns some dynamic values as the upload size limit.
	 *
	 * @access private
	 */
	private function getDynamics() {
		$response = array();
		
		// get quota info
		$has_quota = $this->wdc->supports("QUOTA");
		
		if($has_quota) {
			$response['quotaSupport'] = true;
			try {
				$this->wdc->open();
				$response['quotaUsed'] = $this->wdc->getQuotaBytesUsed("/");
				$response['quotaAvailable'] = $this->wdc->getQuotaBytesAvailable("/");
			} catch (BackendException $e) {
				$response['quotaSupport'] = false;
			}
			
		} else {
			$response['quotaSupport'] = false;
		}
	
		// get max upload limit
		$limits = $this->getFileLimits();
		
		$max_upload = $limits->upload_max_filesize;
		$max_post = $limits->post_max_size;
		$upload_mb = min($max_upload, $max_post);
		$response['uploadLimit'] = $upload_mb;
		
		$this->addActionData("getdynamics", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Gets maximum post request size and max upload size limit for the Files/php folder.
	 * 
	 * @return array returns assoziative array with max upload and max post size.
	 * @access private
	 */
	function getFileLimits() {
		$parts = explode('/', $_SERVER['REQUEST_URI']);
		$dir = "";
		for ($i = 0; $i < count($parts) - 1; $i++) {
			$dir .= $parts[$i] . "/";
		}
		
		$url = 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . $dir . "plugins/files/php/limits.php";
	
		$json = false;
		if (function_exists('curl_exec')) {
			$conn = curl_init();
			curl_setopt($conn, CURLOPT_URL, $url);
			curl_setopt($conn, CURLOPT_RETURNTRANSFER, true);
			$json = curl_exec($conn);
			curl_close($conn);
		} elseif (function_exists('file_get_contents')) {
			$json = file_get_contents($url);
		} elseif (function_exists('fopen') && function_exists('stream_get_contents')) {
			$handle = fopen ($url, "r");
			$json = stream_get_contents($handle);
		}
		
		if($json) {
			$limits = json_decode($json);
		} else {
			$limits = false;
		}
		
		return $limits;
	}
	
	/**
	 * Parses php ini filesize to bytes.
	 * @param {String} Filesize e.g. 100M
	 * @return {Number} Filesize in bytes
	 * @access private
	 */
	private function return_bytes($val) {
		$val = trim($val);
		$last = strtolower($val[strlen($val)-1]);
		switch($last) {
			case 'g':
				$val *= 1024;
			case 'm':
				$val *= 1024;
			case 'k':
				$val *= 1024;
		}

		return intval($val);
	}
	
	/**
	 * Create a new Directory
	 *
	 * @access private
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function createDirectory($actionData) {
		$dirname = $actionData["dirname"];
		$result  = $this->wdc->mkcol($dirname);
		
		$parentdir =  dirname($dirname);  // get parent dir
		if($parentdir != "/") {
			$parentdir = $parentdir . "/";
		}
		
		$this->cache->remove($parentdir);
		
		Helper::log("Created dir: " . $dirname . " response: " . $result, "Core");
		
		$response = array();
		$response['status'] = $result;
		$response['basedir'] = $actionData['basedir'];
		$this->addActionData("createdir", $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Check if given filename or folder already exists on server
	 *
	 * @access private
	 * @param array $actionData all parameters contained in this request
	 * @throws WebDAVException if the webdav request fails
	 *
	 * @return void
	 */
	private function checkIfExists($actionType, $actionData) {

		$duplicate = false;

		// use backported function to check multiple records at one time
		if(isset($actionData["records"])) {
			$records = $actionData["records"];
			$destination = isset($actionData["destination"]) ? $actionData["destination"] : false;
			$duplicate = false;


			if(is_array($records)) {
				if(!isset($destination) || $destination === false) {
					$destination = reset($records);
					$destination = dirname($destination["id"]); // we can only check files in the same folder, so one request will be enough
				}

				$lsdata = $this->wdc->ls($destination);

				if (isset($lsdata) && is_array($lsdata)) {
					foreach($records as $record) {
						$id = $record["id"];
						$isfolder = $record["isFolder"];

						foreach ($lsdata as $argsid => $args) {
							if (strcmp($args['resourcetype'], "collection") == 0 && $isfolder && strcmp($argsid, ($id . "/")) == 0) { // we have a folder
								$duplicate = true;
								break;
							} else if (strcmp($args['resourcetype'], "collection") != 0 && !$isfolder && strcmp($argsid, $id) == 0) {
								$duplicate = true;
								break;
							} else {
								$duplicate = false;
							}
						}

						if($duplicate) {
							break;
						}
					}
				}
			}

		} else { // use old check function otherwise
			$id = $actionData["id"];
			$isfolder = $actionData["isfolder"];

			$lsdata = $this->wdc->ls(dirname($id));

			if (isset($lsdata) && is_array($lsdata)) {
				foreach ($lsdata as $argsid => $args) {
					if (strcmp($args['resourcetype'], "collection") == 0 && $isfolder && strcmp($argsid, ($id . "/")) == 0) { // we have a folder
						$duplicate = true;
						break;
					} else if (strcmp($args['resourcetype'], "collection") != 0 && !$isfolder && strcmp($argsid, $id) == 0) {
						$duplicate = true;
						break;
					} else {
						$duplicate = false;
					}
				}
			}

			if ($duplicate) {
				Helper::log("Duplicate entry: " . $id, "Core");
			}
		}
		
		$response = array();
		$response['status'] = true;
		$response['duplicate'] = $duplicate;
		$this->addActionData($actionType, $response);
		$GLOBALS["bus"]->addData($this->getResponseData());
	}
	
	/**
	 * Store the file to a temporary directory, prepare it for oc upload
	 *
	 * @access private
	 * @param array $actionData all parameters contained in this request
	 */
	private function prepareAttachmentToStore($actionData) {
		
		Helper::log("preparing attachment", "Core");
	
		// Get store id
		$storeid = false;
		if(isset($actionData["store"])) {
			$storeid = $actionData["store"];
		}

		// Get message entryid
		$entryid = false;
		if(isset($actionData["entryid"])) {
			$entryid = $actionData["entryid"];
		}

		// Check which type isset
		$openType = "attachment";

		// Get number of attachment which should be opened.
		$attachNum = false;
		if(isset($actionData["attachNum"])) {
			$attachNum = $actionData["attachNum"];
		}

		// Check if storeid and entryid isset
		if($storeid && $entryid) {
			// Open the store
			$store = $GLOBALS["mapisession"]->openMessageStore(hex2bin($storeid));
			
			if($store) {
				// Open the message
				$message = mapi_msgstore_openentry($store, hex2bin($entryid));
				
				if($message) {
					$attachment = false;

					// Check if attachNum isset
					if($attachNum) {
						// Loop through the attachNums, message in message in message ...
						for($i = 0; $i < (count($attachNum) - 1); $i++)
						{
							// Open the attachment
							$tempattach = mapi_message_openattach($message, (int) $attachNum[$i]);
							if($tempattach) {
								// Open the object in the attachment
								$message = mapi_attach_openobj($tempattach);
							}
						}

						// Open the attachment
						$attachment = mapi_message_openattach($message, (int) $attachNum[(count($attachNum) - 1)]);
					}

					// Check if the attachment is opened
					if($attachment) {
						
						// Get the props of the attachment
						$props = mapi_attach_getprops($attachment, array(PR_ATTACH_LONG_FILENAME, PR_ATTACH_MIME_TAG, PR_DISPLAY_NAME, PR_ATTACH_METHOD));
						// Content Type
						$contentType = "application/octet-stream";
						// Filename
						$filename = "ERROR";

						// Set filename
						if(isset($props[PR_ATTACH_LONG_FILENAME])) {
							$filename = $this->sanitizeFilename($props[PR_ATTACH_LONG_FILENAME]);
						} else if(isset($props[PR_ATTACH_FILENAME])) {
							$filename = $this->sanitizeFilename($props[PR_ATTACH_FILENAME]);
						} else if(isset($props[PR_DISPLAY_NAME])) {
							$filename = $this->sanitizeFilename($props[PR_DISPLAY_NAME]);
						} 
				
						// Set content type
						if(isset($props[PR_ATTACH_MIME_TAG])) {
							$contentType = $props[PR_ATTACH_MIME_TAG];
						} else {
							// Parse the extension of the filename to get the content type
							if(strrpos($filename, ".") !== false) {
								$extension = strtolower(substr($filename, strrpos($filename, ".")));
								$contentType = "application/octet-stream";
								if (is_readable("mimetypes.dat")){
									$fh = fopen("mimetypes.dat","r");
									$ext_found = false;
									while (!feof($fh) && !$ext_found){
										$line = fgets($fh);
										preg_match("/(\.[a-z0-9]+)[ \t]+([^ \t\n\r]*)/i", $line, $result);
										if ($extension == $result[1]){
											$ext_found = true;
											$contentType = $result[2];
										}
									}
									fclose($fh);
								}
							}
						}
						
						
						$tmpname = tempnam(TMP_PATH, stripslashes($filename));

						// Open a stream to get the attachment data
						$stream = mapi_openpropertytostream($attachment, PR_ATTACH_DATA_BIN);
						$stat = mapi_stream_stat($stream);
						// File length =  $stat["cb"]
						
						Helper::log("filesize: " . $stat["cb"], "Core");
						
						$fhandle = fopen($tmpname,'w');
						$buffer = null;
						for($i = 0; $i < $stat["cb"]; $i += BLOCK_SIZE) {
							// Write stream
							$buffer = mapi_stream_read($stream, BLOCK_SIZE);
							fwrite($fhandle,$buffer,strlen($buffer));
						}
						fclose($fhandle);
						
						Helper::log("temp attachment written to " . $tmpname, "Core");


						return array($tmpname, $filename);
					}
				}
			} else {
				Helper::log("store could not be opened", "Core");
			}
		} else {
			Helper::log("wrong call, store and entryid have to be set", "Core");
		}

		return false;
	}

	/**
	 * Store the email to a temporary directory, prepare it for oc upload
	 *
	 * @access private
	 * @param array $item all parameters contained in this request
	 */
	private function prepareEmailForUpload($item) {
		// Get store id
		$storeid = false;
		if(isset($item["store"])) {
			$storeid = $item["store"];
		}

		// Get message entryid
		$entryid = false;
		if(isset($item["entryid"])) {
			$entryid = $item["entryid"];
		}

		$tmpname = "";
		$filename = "";

		$store = $GLOBALS['mapisession']->openMessageStore(hex2bin($storeid));
		$message = mapi_msgstore_openentry($store, hex2bin($entryid));

		// Decode smime signed messages on this message
		parse_smime($store, $message);

		if($message && $store) {
			// get message properties.
			$messageProps = mapi_getprops($message, array(PR_SUBJECT, PR_EC_IMAP_EMAIL, PR_MESSAGE_CLASS));

			$isSupportedMessage = (
				(stripos($messageProps[PR_MESSAGE_CLASS], 'IPM.Note') === 0)
				|| (stripos($messageProps[PR_MESSAGE_CLASS], 'Report.IPM.Note') === 0)
				|| (stripos($messageProps[PR_MESSAGE_CLASS], 'IPM.Schedule') === 0)
			);

			if ($isSupportedMessage) {
				// If RFC822-formatted stream is already available in PR_EC_IMAP_EMAIL property
				// than directly use it, generate otherwise.
				if (isset($messageProps[PR_EC_IMAP_EMAIL]) || propIsError(PR_EC_IMAP_EMAIL, $messageProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
					// Stream the message to properly get the PR_EC_IMAP_EMAIL property
					$stream = mapi_openproperty($message, PR_EC_IMAP_EMAIL, IID_IStream, 0, 0);
				} else {
					// Get addressbook for current session
					$addrBook = $GLOBALS['mapisession']->getAddressbook();

					// Read the message as RFC822-formatted e-mail stream.
					$stream = mapi_inetmapi_imtoinet($GLOBALS['mapisession']->getSession(), $addrBook, $message, array());
				}

				if (!empty($messageProps[PR_SUBJECT])) {
					$filename = $this->sanitizeFilename($messageProps[PR_SUBJECT]) . '.eml';
				} else {
					$filename = _('Untitled') . '.eml';
				}

				$tmpname = tempnam(TMP_PATH, "email2filez");

				// Set the file length
				$stat = mapi_stream_stat($stream);

				$fhandle = fopen($tmpname, 'w');
				$buffer = null;
				for ($i = 0; $i < $stat["cb"]; $i += BLOCK_SIZE) {
					// Write stream
					$buffer = mapi_stream_read($stream, BLOCK_SIZE);
					fwrite($fhandle, $buffer, strlen($buffer));
				}
				fclose($fhandle);

				return array($tmpname, $filename);
			}
		}

		return false;
	}

	/**
	 * Sanitize a filename.
	 * Currently removes all html tags
	 * and replaces \, /, :, ", |, !, ?, <, > and *
	 *
	 * @param string $string
	 * @return string
	 */
	private function sanitizeFilename($string) {
		$cleanerString = preg_replace('/[:\|\"!\*\?\\\\\/]+/i', '', $string);
		$cleanerString = strip_tags($cleanerString);
		$cleanerString = preg_replace('/[><]+/i', '', $cleanerString);

		return $cleanerString;
	}
};

?>
