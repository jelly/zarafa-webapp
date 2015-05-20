<?php
/** 
 * A custom exception class for webdav exceptions
 *
 * @class BackendException
 * @extends Exception
 */
class BackendException extends Exception {
	/**
	 * @constructor
	 * @param string $message The error message
	 * @param int $code The error code
	 */
	public function __construct($message, $code = 0) {
		parent::__construct($message, $code);
	}

	/**
	 * Overrides the toString method.
	 * 
	 * @return string Error code and message
	 */
	public function __toString() {
		return __CLASS__ . ": [{$this->code}]: {$this->message}\n";
	}
}
?>
