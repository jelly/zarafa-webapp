<?php
include("file_backend.class.php");
include("backend_features/interface.quota.php");
include("backend_features/interface.version.php");
include("sabredav/vendor/autoload.php");
require_once('backendexception.php');

/**
 * This is a file backend for webdav servers.
 *
 * @class webdav_backend
 * @extends file_backend
 */
class webdav_backend extends file_backend implements iFeatureQuota, iFeatureVersionInfo {

	/**
	 * Supported features
	 */
	public $SUPPORT_QUOTA = true;
	public $SUPPORT_VERSION_INFO = true;

	/**
	 * Error codes
	 * see @parseErrorCodeToMessage for description
	 */
	const WD_ERR_UNAUTHORIZED = 401;
	const WD_ERR_FORBIDDEN = 403;
	const WD_ERR_NOTFOUND = 404;
	const WD_ERR_TIMEOUT = 408;
	const WD_ERR_LOCKED = 423;
	const WD_ERR_FAILED_DEPENDENCY = 423;
	const WD_ERR_INTERNAL = 500;
	const WD_ERR_UNREACHABLE = 800;
	const WD_ERR_TMP = 801;
	const WD_ERR_FEATURES = 802;
	const WD_ERR_NO_CURL = 803;
	
	/**
	 * @var boolean debuggin flag, if true, debugging is enabled
	 */
	var $debug = false;
	
	/**
	 * @var int webdav server port
	 */
	var $port = 80;
	
	/**
	 * @var string hostname or ip
	 */
	var $server = "localhost";
	
	/**
	 * @var string global path prefix for all requests
	 */
	var $path = "/webdav.php";
	
	/**
	 * @var boolean if true, ssl is used
	 */
	var $ssl = false;
	
	/**
	 * @var boolean allow self signed certificates
	 */
	var $allowselfsigned = true;
	
	/**
	 * @var string the username
	 */
	var $user = "";
	
	/**
	 * @var string the password
	 */
	var $pass = "";
	
	/**
	 * @var the SabreDAV client object.
	 */
	var $sabre_client;
	
	/**
	 * @constructor
	 */
	function webdav_backend() {
		// do nothing here
		$this->debug = isset($_ENV["FP_PLUGIN_DEBUG"]) ? $_ENV["FP_PLUGIN_DEBUG"] : $this->debug;
	}

	/**
	 * Set ftp server. FQN or IP address.
	 *
	 * @param string $server hostname or ip of the ftp server
	 *
	 * @return void
	 */
	public function set_server($server) {
		$this->server = $server;
	}
	
	/**
	 * Set base path
	 *
	 * @param string $pp the global path prefix
	 *
	 * @return void
	 */
	public function set_base($pp) {
		$this->path = $pp;
		$this->log('Base path set to ' . $this->path);
	}
	
	/**
	 * Set ssl
	 *
	 * @param int/bool $ssl (1 = true, 0 = false)
	 *
	 * @return void
	 */
	public function set_ssl($ssl) {
		$this->ssl = $ssl ? true : false;
		$this->port = $ssl ? 443 : $this->port;
		$this->log('SSL extention was set to ' . $this->ssl);
	}
	
	/**
	 * Allow self signed certificates - unimplemented
	 *
	 * @param bool $allowselfsigned Allow self signed certificates. Not yet implemented.
	 *
	 * @return void
	 */
	public function set_selfsigned($allowselfsigned) {
		$this->allowselfsigned = $allowselfsigned;
	}

	/**
	 * Set tcp port of webdav server. Default is 80.
	 *
	 * @param int $port the port of the ftp server
	 *
	 * @return void
	 */
	public function set_port($port) {
		$this->port = $port;
	}

	/**
	 * set user name for authentification
	 *
	 * @param string $user username
	 *
	 * @return void
	 */
	public function set_user($user) {
		$this->user = $user;
	}

	/**
	 * Set password for authentification
	 *
	 * @param string $pass password
	 *
	 * @return void
	 */
	public function set_pass($pass) {
		$this->pass = $pass;
	}

	/**
	 * set debug on (1) or off (0).
	 * produces a lot of debug messages in webservers error log if set to on (1).
	 *
	 * @param boolean $debug enable or disable debugging
	 *
	 * @return void
	 */
	public function set_debug($debug) {
		$this->debug = $debug;
	}
	
	/**
	 * Opens the connection to the webdav server.
	 *
	 * @throws BackendException if connection is not successful
	 * @return boolean true if action succeeded
	 */
	public function open() {
	
		// check if curl is available
		$serverHasCurl = function_exists('curl_version');
		if(!$serverHasCurl) {
			throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_NO_CURL), 500);
		}
		
		$davsettings = array(
			'baseUri' => $this->webdavUrl(),
			'userName' => $this->user,
			'password' => $this->pass,
			'authType' => Sabre\DAV\Client::AUTH_BASIC,
		);

		try {
			$this->sabre_client = new Sabre\DAV\Client($davsettings);
			$this->sabre_client->setVerifyPeer(!$this->allowselfsigned);
			return true;
		} catch (Exception $e) {
			$this->log('Failed to open: ' . $e->getMessage());
			if(intval($e->getHTTPCode()) == 401) {
				throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_UNAUTHORIZED), $e->getHTTPCode());
			} else {
				throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_UNREACHABLE), $e->getHTTPCode());
			}
		}
	}
	
	/**
	 * show content of a diretory
	 *
	 * @param string $path directory path
	 * @param boolean $hidefirst Optional parameter to hide the root entry. Default true
	 * @throws BackendException if request is not successful
	 *
	 * @return mixed array with directory content
	 */
	public function ls($dir, $hidefirst = true) {
		$time_start = microtime(true);
		$dir = $this->removeSlash($dir);
		$lsdata = array();
		$this->log("[LS] start for dir: $dir");
		try{
			$response=$this->sabre_client->propfind($dir, array(
				'{DAV:}resourcetype',
				'{DAV:}getcontentlength',
				'{DAV:}getlastmodified',
				'{DAV:}getcontenttype',
				'{DAV:}quota-used-bytes',
				'{DAV:}quota-available-bytes',
			), 1);
			
			foreach($response as $name => $fields) {
				
				if($hidefirst) {
					$hidefirst = false; // skip the first line - its the requested dir itself
					continue;
				}
				
				$name = substr($name, strlen($this->path)); // skip the webdav path
				$name = urldecode($name);
				
				$type = $fields["{DAV:}resourcetype"]->resourceType;
				if(is_array($type)&& !empty($type)) {
					$type = $type[0] == "{DAV:}collection" ? "collection" : "file";
				} else {
					$type = "file"; // fall back to file if detection fails... less harmful
				}
				
				$lsdata[$name] = array(
					"resourcetype" => $type,
					"getcontentlength" => isset($fields["{DAV:}getcontentlength"]) ? $fields["{DAV:}getcontentlength"] : null,
					"getlastmodified" => isset($fields["{DAV:}getlastmodified"]) ? $fields["{DAV:}getlastmodified"] : null,
					"getcontenttype" => isset($fields["{DAV:}getcontenttype"]) ? $fields["{DAV:}getcontenttype"] : null,
					"quota-used-bytes" => isset($fields["{DAV:}quota-used-bytes"]) ? $fields["{DAV:}quota-used-bytes"] : null,
					"quota-available-bytes" => isset($fields["{DAV:}quota-available-bytes"]) ? $fields["{DAV:}quota-available-bytes"] : null,
				);
			}
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[LS] done in $time seconds");
			return $lsdata;
            
		} catch (Exception $e) {
			$this->log('ls fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}
	
	/**
	 * create a new diretory
	 *
	 * @param string $dir directory path
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function mkcol($dir) {
		$time_start = microtime(true);
		$dir = $this->removeSlash($dir);
		$this->log("[MKCOL] start for dir: $dir");
		try{
            $response = $this->sabre_client->request("MKCOL", $dir, null);
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[MKCOL] done in $time seconds: " . $response['statusCode']);
            return true;
        } catch (Exception $e) {
			$this->log('[MKCOL] fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}
	
	/**
	 * delete a file or directory
	 *
	 * @param string $path file/directory path
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function delete($path) {
		$time_start = microtime(true);
		$path = $this->removeSlash($path);
		$this->log("[DELETE] start for dir: $path");
		try{
            $response = $this->sabre_client->request("DELETE", $path, null);
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[DELETE] done in $time seconds: " . $response['statusCode']);			
            return true;
        } catch (Exception $e) {
			$this->log('delete fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}
	
	/**
	 * Move a file or collection on webdav server (serverside)
	 * If you set param overwrite as true, the target will be overwritten. 
	 *
	 * @param string $src_path Source path
	 * @param string $dest_path Destination path
	 * @param boolean $overwrite Overwrite file if exists in $dest_path
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function move($src_path,$dst_path, $overwrite = false) {
		$time_start = microtime(true);
		$src_path = $this->removeSlash($src_path);
		$dst_path = $this->webdavUrl() . $this->removeSlash($dst_path);
		$this->log("[MOVE] start for dir: $src_path -> $dst_path");
		if ($overwrite) {
			$overwrite = 'T';
		} else {
			$overwrite = 'F';
		}
		
		try{
            $response = $this->sabre_client->request("MOVE", $src_path, null, array("Destination" => $dst_path, 'Overwrite' => $overwrite));
            $time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[MOVE] done in $time seconds: " . $response['statusCode']);
			return true;
        } catch (Exception $e) {
			$this->log('move fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}
	
	/**
	 * Puts a file into a collection. 
	 *
	 * @param string $path Destination path
	 * @string mixed $data Any kind of data
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function put($path, $data ) {
		$time_start = microtime(true);
		$path = $this->removeSlash($path);
		$this->log("[PUT] start for dir: $path");
		try{
            $response = $this->sabre_client->request("PUT", $path, $data);
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[PUT] done in $time seconds: " . $response['statusCode']);
            return true;
        } catch (Exception $e) {
			$this->log('[PUT] put fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}
	
	/**
	 * Upload a local file
	 *
	 * @param string $path Destination path on the server
	 * @param string $filename Local filename for the file that should be uploaded
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function put_file($path, $filename) {
		$buffer = file_get_contents($filename);
		
		if($buffer !== false) {
			return $this->put($path, $buffer);
		} else {
			throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_TMP), 400);
		}
	}
	
	/**
	 * Gets a file from a webdav collection.
	 *
	 * @param string $path The source path on the server
	 * @param mixed $buffer Buffer for the received data
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function get($path, &$buffer) {
		$time_start = microtime(true);
		$path = $this->removeSlash($path);
		$this->log("[GET] start for dir: $path");
		try{
            $response = $this->sabre_client->request("GET", $path);
			$buffer = $response['body'];
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[GET] done in $time seconds: " . $response['statusCode']);
            return true;
        } catch (Exception $e) {
			$this->log('get fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}
	
	/**
	 * Gets a file from a collection into local filesystem. 
	 *
	 * @param string $srcpath Source path on server
	 * @param string $localpath Destination path on local filesystem
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function get_file($srcpath, $localpath) {
		$buffer = null;
		$result = $this->get($srcpath,$buffer);
		
		if($result) {
			if(file_put_contents($localpath, $buffer) === false)
				throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_TMP), 400);
			else 
				return $result;
		} else {
			return false;
		}
	}
	
	/** 
	 * Public method copy_file
	 *
	 * Copy a file on webdav server
	 * Duplicates a file on the webdav server (serverside). 
	 * All work is done on the webdav server. If you set param overwrite as true,
	 * the target will be overwritten. 
	 *
	 * @param string $src_path Source path
	 * @param string $dest_path Destination path
	 * @param bool $overwrite Overwrite if file exists in $dst_path
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function copy_file($src_path, $dst_path, $overwrite = false) {
		return $this->copy($src_path, $dst_path, $overwrite, false);
	}
	
	/** 
	 * Public method copy_coll
	 *
	 * Copy a collection on webdav server
	 * Duplicates a collection on the webdav server (serverside). 
	 * All work is done on the webdav server. If you set param overwrite as true,
	 * the target will be overwritten. 
	 *
	 * @param string $src_path Source path
	 * @param string $dest_path Destination path
	 * @param bool $overwrite Overwrite if collection exists in $dst_path
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function copy_coll($src_path, $dst_path, $overwrite = false) {
		return $this->copy($src_path, $dst_path, $overwrite, true);
	}
	
	/**
	 * Get's path information from webdav server for one element
	 *
	 * @param string $path Path to file or folder
	 * @throws BackendException if request is not successful
	 *
	 * @return array directory info
	 */
	public function gpi($path) {
		$list = $this->ls($path, false);

		// be sure it is an array
		if (is_array($list)) {
			return $list[0];
		}
		
		$this->log('gpi: wrong response from ls');
		throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_FAILED_DEPENDENCY), 500);
	}
	
	/**
	 * Get's server information
	 *
	 * @throws BackendException if request is not successful
	 * @return array with all header fields returned from webdav server.
	 */
	public function options() {
		$features = $client->options();

		// be sure it is an array
		if (is_array($features)) {
			return $features;
		}
		
		$this->log('options: error getting server features');
		throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_FEATURES), $e->getHTTPCode());
	}
	
	/**
	 * Gather whether a path points to a file or not
	 *
	 * @param string $path Path to file or folder
	 *
	 * @return boolean true if path points to a file, false otherwise
	 */
	public function is_file($path) {
		$item = $this->gpi($path);

		return $item === false ? false : ($item['resourcetype'] != 'collection');
	}

	/**
	 * Gather whether a path points to a directory
	 *
	 * @param string $path Path to file or folder
	 *
	 * @return boolean true if path points to a directory, false otherwise
	 */
	public function is_dir($path) {
		$item = $this->gpi($path);

		return $item === false ? false : ($item['resourcetype'] == 'collection');
	}
	
	/**
	 * check if file/directory exists
	 *
	 * @param string $path Path to file or folder
	 *
	 * @return boolean true if path exists, false otherwise
	 */
	public function exists($path) {
		return ($this->is_dir($path) || $this->is_file($path));
	}
	
	/**
	 * Copy a collection on webdav server
	 * Duplicates a collection on the webdav server (serverside). 
	 * All work is done on the webdav server. If you set param overwrite as true,
	 * the target will be overwritten. 
	 *
	 * @access private
	 * @param string $src_path Source path
	 * @param string $dest_path Destination path
	 * @param bool $overwrite Overwrite if collection exists in $dst_path
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	private function copy($src_path, $dst_path, $overwrite, $coll) {
		$time_start = microtime(true);
		$src_path = $this->removeSlash($src_path);
		$dst_path = $this->webdavUrl() . $this->removeSlash($dst_path);
		$this->log("[COPY] start for dir: $src_path -> $dst_path");
		if ($overwrite) {
			$overwrite = 'T';
		} else {
			$overwrite = 'F';
		}
		
		array("Destination" => $dst_path, 'Overwrite' => $overwrite);
		if($coll) {
			$settings = array("Destination" => $dst_path, 'Depth' => 'Infinity');
		}
		
		try{
            $response = $this->sabre_client->request("COPY", $src_path, null, $settings);
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[COPY] done in $time seconds: " . $response['statusCode']);
            return true;
        } catch (Exception $e) {
			$this->log('[COPY] fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}

	/**
	 * Create the base webdav url
	 *
	 * @access private
	 * @return string baseURL
	 */
	private function webdavUrl() {
		$url = "";
		if($this->ssl) {
			$url = "https://";
		} else {
			$url = "http://";
		}
		
		// make sure that we do not have any trailing / in our url
		$server = rtrim($this->server, '/');
		$path = rtrim($this->path, '/');
		
		$url .= $server . ":" . $this->port . $path . "/";
		return $url;
	}
	
	/**
	 * Removes the leading slash from the folder path
	 *
	 * @access private
	 * @param string $dir directory path
	 *
	 * @return string trimmed directory path
	 */
	private function removeSlash($dir) {
		if (strpos($dir,'/') === 0) {
			$dir = substr($dir,1);
		}
		
		// remove all html entities and urlencode the path...
		$nohtml = html_entity_decode($dir);
		$dir = implode("/", array_map("rawurlencode", explode("/", $nohtml)));
		return $dir;
	}
	
	/**
	 * This function will return a user friendly error string.
	 * @param number $error_code A error code
	 * 
	 * @return string userfriendly error message
	 */
	private function parseErrorCodeToMessage($error_code) {
		$error = intval($error_code);
		
		$msg = dgettext('plugin_files', 'Unknown error');
		
		switch($error) {
			case self::WD_ERR_UNAUTHORIZED: $msg = dgettext('plugin_files', 'Unauthorized. Wrong username or password.'); break;
			case self::WD_ERR_UNREACHABLE: $msg = dgettext('plugin_files', 'File-server is not reachable. Wrong IP entered?'); break;
			case self::WD_ERR_FORBIDDEN: $msg = dgettext('plugin_files', 'You don\'t have enough permissions for this operation.'); break;
			case self::WD_ERR_NOTFOUND: $msg = dgettext('plugin_files', 'File is not available any more.'); break;
			case self::WD_ERR_TIMEOUT: $msg = dgettext('plugin_files', 'Connection to server timed out. Retry later.'); break;
			case self::WD_ERR_LOCKED: $msg = dgettext('plugin_files', 'This file is locked by another user.'); break;
			case self::WD_ERR_FAILED_DEPENDENCY: $msg = dgettext('plugin_files', 'The request failed due to failure of a previous request.'); break;
			case self::WD_ERR_INTERNAL: $msg = dgettext('plugin_files', 'File-server encountered a problem. Wrong IP entered?'); break; // this comes most likely from a wrong ip
			case self::WD_ERR_TMP: $msg = dgettext('plugin_files', 'Could not write to temporary directory. Contact the server administrator.'); break;
			case self::WD_ERR_FEATURES: $msg = dgettext('plugin_files', 'Could not retrieve list of server features. Contact the server administrator.'); break;
			case self::WD_ERR_NO_CURL: $msg = dgettext('plugin_files', 'PHP-Curl is not available. Contact your system administrator'); break;
		}
		
		return $msg;
	}
	
	/**
	 * a simple php error_log wrapper.
	 *
	 * @access private
	 * @param string $err_string error message
	 *
	 * @return void
	 */
	private function log($err_string) {
		if ($this->debug) {
			error_log("[BACKEND_WEBDAV]: " . $err_string);
		}
	}
	
	/**
	 * ============================ FEATURE FUNCTIONS ========================
	 */
	
	/**
	 * Returns the bytes that are currently used.
	 *
	 * @param string $dir directory to check
	 * @return int bytes that are used or -1 on error
	 */
	public function getQuotaBytesUsed($dir) {
		$lsdata = $this->ls($dir, false);

		if(isset($lsdata) && is_array($lsdata)) {
			return $lsdata[$dir]["quota-used-bytes"];
		} else {
			return -1;
		}
	}
	
	/**
	 * Returns the bytes that are currently available.
	 *
	 * @param string $dir directory to check
	 * @return int bytes that are available or -1 on error
	 */
	public function getQuotaBytesAvailable($dir) {
		$lsdata = $this->ls($dir, false);

		if(isset($lsdata) && is_array($lsdata)) {
			return $lsdata[$dir]["quota-available-bytes"];
		} else {
			return -1;
		}
	}
	
	/**
	 * Return the version string of the backend.
	 * @return String
	 */
	public function getBackendVersion() {
		// check if curl is available
		$serverHasCurl = function_exists('curl_version');
		if(!$serverHasCurl) {
			throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_NO_CURL), 500);
		}

		$webdavurl = $this->webdavUrl();
		
		$url = substr($webdavurl, 0, strlen($webdavurl) - strlen("remote.php/webdav/")) . "status.php";

		// try to get the contents of the owncloud status page
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 3); // timeout of 3 seconds
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE); 
		$versiondata = curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		
		if($httpcode && $httpcode == "200" && $versiondata){
			$versions = json_decode($versiondata);
			$version = $versions->versionstring;
		} else {
			$version = "Undetected (no Owncloud?)";
		}
		
		return $version;
	}
}
?>
