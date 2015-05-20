<?php

/**
 * Dropbox Exception class
 * @author Ben Tadiar <ben@handcraftedbyben.co.uk>
 * @link https://github.com/benthedesigner/dropbox
 * @package Dropbox
 */
namespace Dropbox;

class Exception extends \BaseException
{
	/**
	 * @var $url url for authentication
	 */
	public $url;

	/**
	 * @return {string} url for authentication
	 */
	public function getUrl() {
		return $this->url;
	}
}

?>
