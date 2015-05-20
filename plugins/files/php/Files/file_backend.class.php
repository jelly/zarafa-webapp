<?php

/**
 * A abstract file backend. Offers basic functions that are needed by the frontend modules.
 *
 * @class file_backend
 */
abstract class file_backend {
	// all available features
	public $SUPPORT_QUOTA = false;
	public $SUPPORT_SHARING = false;
	public $SUPPORT_VERSION_INFO = false;
	
	
	// setters
	abstract public function set_server($server);
	abstract public function set_selfsigned($allowselfsigned);
	abstract public function set_port($port);
	abstract public function set_ssl($ssl);
	abstract public function set_base($pp);
	abstract public function set_user($user);
	abstract public function set_pass($pass);
	abstract public function set_debug($debug);
	
	// storage functions
	abstract public function open();
	abstract public function ls($dir, $hidefirst = true);
	abstract public function mkcol($dir);
	abstract public function delete($path);
	abstract public function move($src_path,$dst_path, $overwrite = false);
	abstract public function put($path, $data );
	abstract public function put_file($path, $filename);
	abstract public function get($path, &$buffer);
	abstract public function get_file($srcpath, $localpath);
	abstract public function copy_file($src_path, $dst_path, $overwrite = false);
	abstract public function copy_coll($src_path, $dst_path, $overwrite = false);
	abstract public function gpi($path);
	abstract public function is_file($path);
	abstract public function is_dir($path);
	abstract public function exists($path);
	
	// misc
	/**
	 * Check if the given feature is supported by this backend.
	 *
	 * @param string $feature feature name. e.g. QUOTA
	 *
	 * @return boolean
	 */
	public function supports($feature) {
		$feature = str_replace("SUPPORT_", "", strtoupper($feature));
		$varname = "SUPPORT_" . $feature;
		return $this->$varname;
	}
	
	/**
	 * Returns all available features and their values.
	 *
	 * @return array
	 */
	public function getAvailableFeatures() {
		return get_class_vars(get_class($this));
	}
}
?>