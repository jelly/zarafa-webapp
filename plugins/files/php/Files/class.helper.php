<?php
/**
 * Some core functionalities used in all other files
 *
 * @class Helper
 */
class Helper {
	/**
	 * get_mime
	 * 
	 * Returns the mimetype for the specified file
	 *
	 * @static
	 * @param string $filename Filname to get the mime type from
	 * @param int $mode 0 = full check, 1 = extension check only
	 *
	 * @return string the found mimetype or 'application/octet-stream' as fallback
	 */
	static function get_mime($filename, $mode=0) {
		// mode 0 = full check
		// mode 1 = extension check only

		$mime_types = array(
			'txt' => 'text/plain',
			'htm' => 'text/html',
			'html' => 'text/html',
			'php' => 'text/html',
			'css' => 'text/css',
			'js' => 'application/javascript',
			'json' => 'application/json',
			'xml' => 'application/xml',
			'swf' => 'application/x-shockwave-flash',
			'flv' => 'video/x-flv',

			// images
			'png' => 'image/png',
			'jpe' => 'image/jpeg',
			'jpeg' => 'image/jpeg',
			'jpg' => 'image/jpeg',
			'gif' => 'image/gif',
			'bmp' => 'image/bmp',
			'ico' => 'image/vnd.microsoft.icon',
			'tiff' => 'image/tiff',
			'tif' => 'image/tiff',
			'svg' => 'image/svg+xml',
			'svgz' => 'image/svg+xml',

			// archives
			'zip' => 'application/zip',
			'rar' => 'application/x-rar-compressed',
			'exe' => 'application/x-msdownload',
			'msi' => 'application/x-msdownload',
			'cab' => 'application/vnd.ms-cab-compressed',

			// audio/video
			'mp3' => 'audio/mpeg',
			'qt' => 'video/quicktime',
			'mov' => 'video/quicktime',
			'mp4' => 'video/mp4',
			'webm' => 'video/webm',

			// adobe
			'pdf' => 'application/pdf',
			'psd' => 'image/vnd.adobe.photoshop',
			'ai' => 'application/postscript',
			'eps' => 'application/postscript',
			'ps' => 'application/postscript',

			// ms office
			'doc' => 'application/msword',
			'rtf' => 'application/rtf',
			'xls' => 'application/vnd.ms-excel',
			'ppt' => 'application/vnd.ms-powerpoint',
			'docx' => 'application/msword',
			'xlsx' => 'application/vnd.ms-excel',
			'pptx' => 'application/vnd.ms-powerpoint',

			// open office
			'odt' => 'application/vnd.oasis.opendocument.text',
			'ods' => 'application/vnd.oasis.opendocument.spreadsheet',
		);

		$exploded = explode('.', $filename);
		$last = array_pop($exploded);
		$ext = strtolower($last);
		
		if(function_exists('mime_content_type') && is_file($filename) && $mode==0) { 
			$mimetype = mime_content_type($filename); 
			return $mimetype;
		} elseif(function_exists('finfo_open') && is_file($filename) && $mode==0) { 
			$finfo = finfo_open(FILEINFO_MIME); 
			$mimetype = finfo_file($finfo, $filename); 
			finfo_close($finfo); 
			return $mimetype; 
		} elseif(array_key_exists($ext, $mime_types)) { 
			return $mime_types[$ext]; 
		} else { 
			return 'application/octet-stream'; 
		} 
	}
	
	/**
	 * Return size to human readable filesize
	 *
	 * @static
	 * @param int $filesize in bytes
	 * @param int $decimals digits
	 *
	 * @return string human readable filesize
	 */
	static function human_filesize($bytes, $decimals = 2) {
		$sz = ' KMGTP';
		$factor = floor((strlen($bytes) - 1) / 3);
		return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . " " . @$sz[$factor] . "B";
	}
	
	/**
	 * Splits the filename from the given path
	 *
	 * @static
	 * @param string $path a filesystem path, use / as path separator
	 *
	 * @return string the last part of the path, mostly this is the filename
	 */
	static function getFilenameFromPath($path) {
		$pathParts = explode('/', $path);
		return end($pathParts);
	}
	
	/**
	 * Splits the foldername/path from the given path
	 *
	 * @static
	 * @param string $path
	 *
	 * @return string foldername
	 */
	static function getFolderNameFromPath($path) {
		$tmp = explode("/", $path);
		array_pop ($tmp);
		$folder = implode("/", $tmp);
		$folder = $folder == "" ? "/" : $folder;
		
		return $folder;
	}
	
	/** 
	 * Creates a random string
	 *
	 * @static
	 * @param int length The length of the random string
	 *
	 * @return string a random string
	 */
	static function randomstring($length = 6) {
		// $chars - all allowed charakters
		$chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

		srand((double)microtime()*1000000);
		$i = 0;
		while ($i < $length) {
			$num = rand() % strlen($chars);
			$tmp = substr($chars, $num, 1);
			$pass = $pass . $tmp;
			$i++;
		}
		return $pass;
	}
	
	/** 
	 * creates a security file, which is checked before downloading a file
	 *
	 * @static
	 * @param string secid A random id
	 * 
	 * @return void
	 */
	static function createSecIDFile($basepath, $secid) {
		$lockFile = $basepath . DIRECTORY_SEPARATOR . "secid." . $secid;
		$fh = fopen($lockFile, 'w') or die("can't open secid file");
		$stringData = date(DATE_RFC822);
		fwrite($fh, $stringData);
		fclose($fh);
	}
	
	/** 
	 * check if a string starts with a specific char
	 *
	 * @static
	 * @param string $haystack
	 * @param string $needle
	 *
	 * @return boolean true if $needle is found in $haystack
	 */
	static function startsWith($haystack, $needle) {
		return !strncmp($haystack, $needle, strlen($needle));
	}

	/** 
	 * check if a string ends with a specific char
	 *
	 * @static
	 * @param string $haystack
	 * @param string $needle
	 *
	 * @return boolean true if $haystack ends with $needle
	 */
	static function endsWith($haystack, $needle) {
		$length = strlen($needle);
		if ($length == 0) {
			return true;
		}

		return (substr($haystack, -$length) === $needle);
	}
	
	/**
	 * Sort multidimensional array by any key
	 *
	 * @static
	 * @param boolean $navtree if we have a navtree, we have to sort different fields!
	 * @param array $arr the array to sort
	 * @param string $key the key to sort
	 * @param string $dir ASC or DESC sort direction
	 *
	 * @return array the sorted array
	 */
	static function sort_by_key ($navtree, $arr, $key, $dir) { 
		global $key2sort; 
		$key2sort = $key; 
		
		$prefix = "";
		if($navtree){
			$prefix = "nav";
		}
		
		if($dir == "DESC")
			usort($arr, array('self', $prefix . 'invpropsort'));
		else
			usort($arr, array('self', $prefix . 'propsort'));
		return ($arr); 
	} 
	
	/**
	 * compare function for multidimensional array sorting
	 *
	 * @static
	 * @param array $a this argument will be compared with argument $b
	 * @param array $b this argument will be compared with argument $a
	 *
	 * @return int compare value. If $a < $b the return value will be -1.
	 */
	static function propsort ($a, $b) {
		global $key2sort;
		
		if($a['props']['type'] == $b['props']['type']) {
			if(is_numeric($a['props'][$key2sort]) && is_numeric($b['props'][$key2sort])) {
				if ($a['props'][$key2sort] == $b['props'][$key2sort]) {
					return 0;
				}
				return ($a['props'][$key2sort] < $b['props'][$key2sort]) ? -1 : 1;
			} else {
				return (strcasecmp ($a['props'][$key2sort],$b['props'][$key2sort]));
			}
		}
		
		return ($a['props']['type'] - $b['props']['type']);
	}
	
	/**
	 * inverse compare function for multidimensional array sorting
	 *
	 * @static
	 * @param array $a this argument will be compared with argument $b
	 * @param array $b this argument will be compared with argument $a
	 *
	 * @return int compare value. If $a < $b the return value will be 1.
	 */
	static function invpropsort ($a, $b) {
		global $key2sort;
		
		if($a['props']['type'] == $b['props']['type']) {
			if(is_numeric($a['props'][$key2sort]) && is_numeric($b['props'][$key2sort])) {
				if ($a['props'][$key2sort] == $b['props'][$key2sort]) {
					return 0;
				}
				return ($a['props'][$key2sort] < $b['props'][$key2sort]) ? 1 : -1;
			} else {
				return (-1 * strcasecmp ($a['props'][$key2sort],$b['props'][$key2sort]));
			}
		}
		
		return ($a['props']['type'] - $b['props']['type']);
	}
	
	/**
	 * compare function for multidimensional array sorting (navtree)
	 *
	 * @static
	 * @param array $a this argument will be compared with argument $b
	 * @param array $b this argument will be compared with argument $a
	 *
	 * @return int compare value If $a < $b the return value will be -1.
	 */
	static function navpropsort ($a, $b) {
		global $key2sort;
		
		if($a['isFolder'] == $b['isFolder']) {
			return (strcasecmp ($a[$key2sort],$b[$key2sort]));
		}
		
		return ((int) $b['isFolder'] - (int) $a['isFolder']);
	}
	
	/**
	 * inverse compare function for multidimensional array sorting (navtree)
	 *
	 * @static
	 * @param array $a this argument will be compared with argument $b
	 * @param array $b this argument will be compared with argument $a
	 *
	 * @return int compare value If $a < $b the return value will be 1.
	 */
	static function navinvpropsort ($a, $b) {
		global $key2sort;
		
		if($a['isFolder'] == $b['isFolder']) {
			return (-1 * strcasecmp ($a[$key2sort],$b[$key2sort]));
		}
		
		return ((int) $b['isFolder'] - (int) $a['isFolder']);
	}
	
	/**
	 * Logs to error log if debugging enabled
	 *
	 * @static
	 * @param string $logmessage
	 * @param string $module Optional TAG name. Log message looks like: [TAG] logmsg
	 *
	 * @return void
	 */
	static function log ($logmessage, $module = "Files") {
		if($_ENV["FP_PLUGIN_DEBUG"]) {
			error_log("[" . $module . "]: " . $logmessage);
		}
	}
	
	/**
	 * Returns the value for the specified key, loaded from the current session
	 *
	 * @static
	 * @param string $key String name describing the name of the session variable
	 * @param array $session Optional session array. $_SESSION will be used by default.
	 *
	 * @return void
	 */
	static function getSessionData($key, $session = null) {
		$session_prefix = "PLUGIN_FP_";
		
		if($session === null) {
			$session = $_SESSION;
		}
		
		return $session[$session_prefix . $key];
	}
}
?>
