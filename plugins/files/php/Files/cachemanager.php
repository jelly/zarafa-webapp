<?php
/** 
 * This is a simple file caching class for webdav requests.
 *
 * @class cache_manager
 */
class cache_manager {
	/**
	 * @var boolean debugging switch, if it's true, debugging messages wil be written to log
	 */
	var $_debug = false;
	
	/**
	 * @var string path to the temporary cachefile
	 */
	var $_cacheFile = "/tmp/wdquery.cache";
	
	/**
	 * @var array this array stores all values that should be cached
	 */
	var $_store = array();
	
	/**
	 * @var boolean enable or disable this cachemanager instance
	 */
	var $_enabled = false;
	
	/**
	 * @constructor
	 * @param string $tmppath path to a temporary directory. the cachefile will be stored there
	 * @param boolean $enabled enable or disable this cachemanager instance
	 */
	function cache_manager($tmppath, $enabled) {
		$this->_cacheFile = $tmppath . session_id() . "wd.cache";
		$this->_enabled = $enabled;
		$this->_debug = $_ENV["FP_PLUGIN_DEBUG"];
		
		if(!is_writable($tmppath)) {
			$this->_enabled = false;
			$this->_error_log("Cachefile not writeable - disabling cache!");
		}
		
		$this->_error_log("cachefile: " . $this->_cacheFile);
		if(file_exists($this->_cacheFile)) {
			$this->_store = unserialize(file_get_contents($this->_cacheFile));
		}
	}
	
	/**
	 * Puts a value for the identifier id to the cache store
	 *
	 * @param string $id the key. must be unique for this cache
	 * @param mixed $value any kind of value to cache
	 *
	 * @return void
	 */
	public function put($id, $value) {
		if($this->_enabled) {
			$hid = $this->hash($id);
			
			
			if(!$this->is_cached($id)) {
				$this->_store[$hid] = $value;
				$this->flush_store();
				$this->_error_log('put: ' . $id . ' to cache with hid: ' . $hid);
			} else {
				$this->_error_log('put: ' . $id . ' already in cache');
			}
		}
	}
	
	/**
	 * Returns the value for id or null if id is not cached
	 *
	 * @param string $id return the cached object for this key 
	 *
	 * @return array NULL if not cached
	 */
	public function get($id) {
		$ret = NULL;
		
		if($this->_enabled) {
			$hid = $this->hash($id);
			
			if($this->is_cached($id)) {
				$ret = $this->_store[$hid];
				$this->_error_log('get: cached id: ' . $id . ' as ' . $hid . '!');
			} else {
				$this->_error_log('get: none cached id: ' . $id);
			}
		}
		return $ret;
	}
	
	/**
	 * Removes a cached value from the store
	 *
	 * @param string $id delete the cached object for this key 
	 *
	 * @return void
	 */
	public function remove($id) {
		if($this->_enabled) {
			$hid = $this->hash($id);
			
			if($this->is_cached($id)) {
				unset($this->_store[$hid]);
				$this->flush_store();
				$this->_error_log("removed: id " . $id . " from cache");
			} else {
				$this->_error_log('removed: id ' . $id . ' is not in the cache - nothing to be removed');
			}
		}
	}
	
	/**
	 * Clears the whole cache
	 *
	 * @return void
	 */
	public function clear() {
		if($this->_enabled) {
			unset($this->_store);
			$this->_store = array();
			$this->flush_store();
			$this->_error_log('cache cleared');
		}
	}
	
	/**
	 * Check if a cached object exists for the given key
	 * 
	 * @access private
	 * @param string $id the key to search for
	 *
	 * @return boolean
	 */
	private function is_cached($id) {
		if($this->_enabled) {
			$hid = $this->hash($id);
			
			return array_key_exists($hid, $this->_store);
		} else {
			return false;
		}
	}
	
	/**
	 * Flushes changes to disk
	 *
	 * @access private
	 * @return void
	 */
	private function flush_store() {
		file_put_contents($this->_cacheFile, serialize($this->_store));
	}
	
	/**
	 * Hashes the given id to a unique string
	 *
	 * @access private
	 * @param string $id a file or folderpath
	 *
	 * @return string the generated hash for $id
	 */
	private function hash($id) {
		$folder = Helper::getFolderNameFromPath($id);
	
		return base64_encode($folder);
	}
		
	/**
	 * a simple php error_log wrapper.
	 *
	 * @access private
	 * @param string err_string
	 *
	 * @return void
	 */
	private function _error_log($err_string) {
		if ($this->_debug) {
			error_log("[Cachemanager]: " . $err_string);
		}
	}
}
 ?>
