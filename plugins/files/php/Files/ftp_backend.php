<?php
include("file_backend.class.php");
require_once('backendexception.php');

/**
 * This is a file backend for ftp servers.
 *
 * @class ftp_backend
 * @extends file_backend
 */
class ftp_backend extends file_backend {
	
	/**
	 * @var boolean debuggin flag, if true, debugging is enabled
	 */
	var $debug = false;
	
	/**
	 * @var int ftp server port
	 */
	var $port = 21;
	
	/**
	 * @var string hostname or ip
	 */
	var $server = "localhost";
	
	/**
	 * @var string global path prefix for all requests
	 */
	var $path = "/some/ftp/dir";
	
	/**
	 * @var boolean if true, ssl is used
	 */
	var $ssl = false;
	
	/**
	 * @var string the username
	 */
	var $user = "";
	
	/**
	 * @var string the password
	 */
	var $pass = "";
	
	/**
	 * @var object Our SabreDAV client object.
	 */
	var $ftp_client;
	
	/**
	 * @constructor
	 */
	function sync_backend() {
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
		$this->log("SSL extention was set to $ssl");
	}
	
	/**
	 * Allow self signed certificates - unimplemented
	 *
	 * @param bool $allowselfsigned Allow self signed certificates. Not yet implemented.
	 *
	 * @return void
	 */
	public function set_selfsigned($allowselfsigned) {}

	/**
	 * Set tcp port of ftp server. Default is 21.
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
	 * Opens the connection to the ftp server.
	 *
	 * @throws BackendException if connection is not successful
	 * @return boolean true if action succeeded
	 */
	public function open() {
		if($this->ssl) {
			$this->ftp_client = @ftp_ssl_connect($this->server, $this->port);
		}else {
			$this->ftp_client = @ftp_connect($this->server, $this->port);
		}
		
		if($this->ftp_client !== FALSE) {
			$login_result = @ftp_login($this->ftp_client, $this->user, $this->pass);
			if($login_result !== FALSE) {
				return true;
			} else {
				$err = error_get_last();
				$this->log('[OPEN] auth failed: ' . $this->user . ' (err: ' . $err["message"] . ')');
				throw new BackendException(dgettext('plugin_files', 'Wrong username or password.'),401);
			}
		} else {
			$err = error_get_last();
			$this->log('[OPEN] could not connect to server: ' . $this->server . ' (err: ' . $err["message"] . ')');
			throw new BackendException(dgettext('plugin_files', 'Server is not reachable. Wrong IP entered?'),400);
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
	public function ls($path, $hidefirst = true) {
		$time_start = microtime(true);
		
		$dir = $this->createURL($path);
		$files = array();
        $contents = @ftp_rawlist ($this->ftp_client, $dir);
        if(count($contents)){
            foreach($contents as $line){

                $result = preg_match("#([drwx\-]+)([\s]+)([0-9]+)([\s]+)([a-zA-Z0-9\-\.]+)([\s]+)([a-zA-Z0-9\-\.]+)([\s]+)([0-9]+)([\s]+)([a-zA-Z]+)([\s ]+)([0-9]+)([\s]+)(?:([0-9]+):([0-9]+)|([0-9]+))([\s]+)(.*)#si", $line, $out);

				if($result === FALSE || $result === 0) {
					throw new BackendException(dgettext('plugin_files', 'Unparsable server response.'),500);
				}
				
                if($hidefirst && ($out[3] != 1 && ($out[18] == "." || $out[18] == ".."))){
                    // do nothing
                } else {
					$this->log("[LS] $dir: " . $line);
					$tmpend = $out[3] == 1 ? "" : "/";
					$fpath = rtrim($path, '/') . "/" . $out[19] . $tmpend;
                    $files[$fpath]['resourcetype'] = $out[3] == 1 ? "file":"collection";
                    $files[$fpath]['getcontentlength'] = $out[9];
					if($out[15] === "" || $out[16] === "") {
						$files[$fpath]['getlastmodified'] = $out[11]." ".$out[13] . " ".$out[17];
					} else {
						$files[$fpath]['getlastmodified'] = $out[11]." ".$out[13] . " ".$out[15].":".$out[16];
					}
                }
            }
        }
		$time_end = microtime(true);
		$time = $time_end - $time_start;
		$this->log("[LS] done in $time seconds");
        return $files;
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
		$dir = $this->createURL($dir);
		$this->log("[MKCOL] start for dir: $dir");
		
		$result = @ftp_mkdir($this->ftp_client, $dir);
		$time_end = microtime(true);
		$time = $time_end - $time_start;
		
		if($result) {
			$this->log("[MKCOL] done in $time seconds");
			return true;
		} else {
			$err = error_get_last();
			$this->log('[MKCOL] failed: ' . $err["message"]);
			throw new BackendException($err["message"],400);
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
		$dir = $this->createURL($path);
		$this->log("[DELETE] start for dir: $path");
            
		if($this->is_file($path)) {
			$this->log("deleting file: ");
			$result = @ftp_delete($this->ftp_client, $dir);
		} else {
			$this->log("deleting dir");
			$result = $this->ftp_rmdirr($dir);
		}
		
		$time_end = microtime(true);
		$time = $time_end - $time_start;
			
		if($result) {
			$this->log("[DELETE] done in $time seconds: " . $result);
			return true;
		} else {
			$err = error_get_last();
			$this->log('[DELETE] failed: ' . $err["message"]);
			throw new BackendException($err["message"],400);
		}        
	}
	
	/**
	 * recursive function to delete a directory with sub-folders/files
	 *
	 * @access private
	 * @param string $path directory path
	 *
	 * @return boolean true on success, false otherwise
	 */
	private function ftp_rmdirr($path) {
		if(!@ftp_delete($this->ftp_client, $path)) {
			$list = @ftp_nlist($this->ftp_client, $path);
			if(!empty($list)) {
				foreach($list as $value) {
					$this->ftp_rmdirr($value);
				}
			}
		}
		
		if(@ftp_rmdir($this->ftp_client, $path))
			return true;
		else
			return false;
	}
	
	/**
	 * Move a file or collection on ftp server (serverside)
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
		$src_dir = $this->createURL($src_path);
		$dst_dir = $this->createURL($dst_path);
		$this->log("[MOVE] start for dir: $src_path -> $dst_path");
		if ($overwrite) {
			$this->delete($dst_path);
			$result = @ftp_rename($this->ftp_client,$src_dir, $dst_dir);
		} else {
			$result = @ftp_rename($this->ftp_client,$src_dir, $dst_dir);
		}
		$time_end = microtime(true);
		$time = $time_end - $time_start;
		
		if($result) {
			$this->log("[MOVE] done in $time seconds: $src_dir -> $dst_dir");
			return true;
		} else {
			$err = error_get_last();
			$this->log('[MOVE] failed: ' . $err["message"]);
			throw new BackendException($err["message"],400);
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
	public function put($path, $data) {
		$temp_file = tempnam(sys_get_temp_dir(), "$path");
		$fresult = file_put_contents($temp_file, $data);
		$result = $this->put_file($path, $temp_file);
		
		if($fresult !== FALSE) {
			return $result;
		} else {
			throw new BackendException("Could not write temporary file",400);
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
		$dir = $this->createURL($path);
		$time_start = microtime(true);
		$this->log("[PUTFILE] start for dir: $dir");
            
		if(@ftp_chdir($this->ftp_client, dirname($dir) . "/")) {
			$result = @ftp_put($this->ftp_client, basename($dir), $filename, FTP_BINARY);
		} else {
			$result = false;
		}
		$time_end = microtime(true);
		$time = $time_end - $time_start;
	
		if($result) {
			$this->log("[PUTFILE] done in $time seconds: $filename -> $path");
			return true;
		} else {
			$err = error_get_last();
			$this->log('[PUTFILE] failed: ' . $err["message"]);
			throw new BackendException($err["message"],400);
		}
	}
	
	/**
	 * Gets a file from a ftp collection.
	 *
	 * @param string $path The source path on the server
	 * @param mixed $buffer Buffer for the received data
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	public function get($path, &$buffer) {
		$temp_file = tempnam(sys_get_temp_dir(), 'FtpGET');
		$result = $this->get_file($path, $temp_file);
		$buffer = file_get_contents($temp_file);
		
		if($result) {
			if($buffer !== FALSE) {
				return $result;
			} else {
				throw new BackendException("Could not read temporary file",400);
			}
		} else {
			return $result;
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
		$dir = $this->createURL($srcpath);
		$time_start = microtime(true);
		$this->log("[GETFILE] start for dir: $dir");
            
		$result = @ftp_get($this->ftp_client, $localpath, $dir, FTP_BINARY);
		$time_end = microtime(true);
		$time = $time_end - $time_start;
		
		if($result) {
			$this->log("[GETFILE] done in $time seconds: $srcpath -> $localpath");
			return true;
		} else {
			$err = error_get_last();
			$this->log('[GETFILE] failed: ' . $err["message"]);
			throw new BackendException($err["message"],400);
		}
	}
	
	/** 
	 * Public method copy_file - unimplemented
	 * @todo implement
	 *
	 * Copy a file on ftp server. If you set param overwrite as true,
	 * the target will be overwritten. 
	 *
	 * @param string $src_path Source path
	 * @param string $dest_path Destination path
	 * @param bool $overwrite Overwrite if file exists in $dst_path
	 * @throws BackendException if request is not successful
	 *
	 * @return void
	 */
	public function copy_file($src_path, $dst_path, $overwrite = false) {
		throw new BackendException("unimplemented function", 500);
	}
	
	/** 
	 * Public method copy_coll - unimplemented
	 * @todo implement
	 *
	 * Copy a collection on ftp server. If you set param overwrite as true,
	 * the target will be overwritten. 
	 *
	 * @param string $src_path Source path
	 * @param string $dest_path Destination path
	 * @param bool $overwrite Overwrite if collection exists in $dst_path
	 * @throws BackendException if request is not successful
	 *
	 * @return void
	 */
	public function copy_coll($src_path, $dst_path, $overwrite = false) {
		throw new BackendException("unimplemented function", 500);
	}
	
	/**
	 * Gather whether a path points to a file or not
	 *
	 * @param string $path Path to file or folder
	 *
	 * @return boolean true if path points to a file, false otherwise
	 */
	public function is_file($path) {
		$path = $this->createURL($path);
		if(@ftp_size($this->ftp_client, $path) == '-1'){
			return false; // Is directory
		}else{
			return true; // Is file
		};
	}

	/**
	 * Gather whether a path points to a directory
	 *
	 * @param string $path Path to file or folder
	 *
	 * @return boolean true if path points to a directory, false otherwise
	 */
	function is_dir($path) {
		return !$this->is_file($path);
	}
	
	/**
	 * check if file/directory exists
	 *
	 * @param string $path Path to file or folder
	 *
	 * @return boolean true if path exists, false otherwise
	 */
	public function exists($path) {
		$path = $this->createURL($path);
		$result = @ftp_nlist($this->ftp_client, $path); //Returns an array of filenames from the specified directory on success or FALSE on error. 

		// Test if file is in the ftp_nlist array
        if ($result !== FALSE && in_array(basename($path), $result)) 
			return true;
        else
			return false;
	}
	
	/**
	 * Get's path information from ftp server for one element
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
		throw new BackendException('gpi: wrong response from ls', 500);
	}
	
	/**
	 * Removes the leading slash from the folder path
	 *
	 * @access private
	 * @param string $dir directory path
	 *
	 * @return string trimmed directory path
	 */
	private function createURL($dir) {
		if (strpos($dir,'/') !== 0) {
			$dir = "/" . $dir;
		}
		
		// add base
		$dir = rtrim($this->path, '/') . $dir;
		$dir = html_entity_decode($dir);
		// remove all html entities...
		return $dir;
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
			error_log("[BACKEND_FTP]: " . $err_string);
		}
	}
}
?>
