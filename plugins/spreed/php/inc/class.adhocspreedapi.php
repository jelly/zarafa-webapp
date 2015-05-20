<?php
/*
 * Copyright (C) 2005 - 2015  Zarafa B.V. and its licensors
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3, 
 * as published by the Free Software Foundation with the following additional 
 * term according to sec. 7:
 *  
 * According to sec. 7 of the GNU Affero General Public License, version
 * 3, the terms of the AGPL are supplemented with the following terms:
 * 
 * "Zarafa" is a registered trademark of Zarafa B.V. The licensing of
 * the Program under the AGPL does not imply a trademark license.
 * Therefore any rights, title and interest in our trademarks remain
 * entirely with us.
 * 
 * However, if you propagate an unmodified version of the Program you are
 * allowed to use the term "Zarafa" to indicate that you distribute the
 * Program. Furthermore you may use our trademarks where it is necessary
 * to indicate the intended purpose of a product or service provided you
 * use it in accordance with honest practices in industrial or commercial
 * matters.  If you want to propagate modified versions of the Program
 * under the name "Zarafa" or "Zarafa Server", you may only do so if you
 * have a written permission by Zarafa B.V. (to acquire a permission
 * please contact Zarafa at trademark@zarafa.com).
 * 
 * The interactive user interface of the software displays an attribution
 * notice containing the term "Zarafa" and/or the logo of Zarafa.
 * Interactive user interfaces of unmodified and modified versions must
 * display Appropriate Legal Notices according to sec. 5 of the GNU
 * Affero General Public License, version 3, when you propagate
 * unmodified or modified versions of the Program. In accordance with
 * sec. 7 b) of the GNU Affero General Public License, version 3, these
 * Appropriate Legal Notices must retain the logo of Zarafa or display
 * the words "Initial Development by Zarafa" if the display of the logo
 * is not reasonably feasible for technical reasons. The use of the logo
 * of Zarafa in Legal Notices is allowed for unmodified and modified
 * versions of the software.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *  
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

?>
<?php
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/class.aspreedapi.php');
require_once(PATH_PLUGIN_DIR . '/spreed/php/dat/timezones.inc');
require_once(PATH_PLUGIN_DIR . '/spreed/php/dat/languages.inc');
if(!class_exists("DateTime") || version_compare(PHP_VERSION, '5.2.0', '<') ){
	require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/legacy/class.datetime.php');
}

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * The Adhoc Spreed Api class to talk with the free Adhoc
 * API's at the Spreed Servers using XML/RPC.
 * This class extends the ASpreedApi and therefore implements the
 * SpreedApi interface.
 *
 **/
class AdhocSpreedApi extends ASpreedApi
{
	const SOFTWARE_AUTH_ID = PLUGIN_SPREED_SOFTWARE_AUTH_ID;
	const CHECKIN_BASE_URL = PLUGIN_SPREED_CHECKIN_BASE_URL;
	const API_NAME_CREATE_ADHOC_CONFERENCE = PLUGIN_SPREED_API_NAME_CREATE_ADHOC_CONFERENCE;
	const DEBUG = false;

	/**
	 * Construct the Adhoc Spreed API Instance.
	 **/
	function __construct()
	{
		parent::__construct();
	}

	/**
	 * Initialize the Spreed API Communication Channel, this
	 * will configure everything correctly to communicate
	 * with the Spreed Adhoc XML/RPC Server
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the server of Spreed returns an error.
	 **/
	public function init()
	{
		// Init our super class too.
		parent::init();

		// Make sure the default timezone is set to UTC
		// TODO Delete this if possible:
		//date_default_timezone_set('UTC');
	}

	/**
	 * The Spreed API allows only a limited list of timezones,
	 * the complete list of options can be obtained by calling
	 * this function. It will use the hardcoded list of timezones
	 * that with their valid values.
	 * @param string $language The ISO 3166 language value to return the
	 * list of timezones in.
	 * @return string[] The list with all supported timezones.
	 **/
	public function getTimezones($language)
	{
		// This variable is defined in the server/dat/timezones.inc file
		return $GLOBALS['spreed_timezones'];
	}

	/**
	 * The Spreed API allows only a limited list of languages,
	 * the complete list of options can be obtained by calling
	 * this function. It will use the hardcoded list of timezones
	 * that with their valid values.
	 * @param string $language The ISO 3166 language value to return the
	 * list of languages in.
	 * @return string[] The list with all supported languages.
	 **/
	public function getLanguages($language)
	{
		// This variable is defined in the server/dat/timezones.inc file
		return $GLOBALS['spreed_languages'];
	}

	/**
	 * Set-up a new conference call on the Spreed server. This will
	 * create the conference using all the information that is available
	 * in the Spreed Conference object and process all the returned
	 * information back in the api.
	 * @param SpreedConference $conf The Spreed Conference object that should be set-up.
	 * @return boolean True if it succeeded to set-up the spreed conference
	 * meeting, false in all other cases.
	 **/
	public function setupSpreedConference($conf){
		// The Spreed API requires us to send the start time in UTC timezone.
		$startTime = $conf->getStartTime();
		$startTime->setTimezone(new DateTimeZone('UTC'));

		$retBlock = $this->doXMLRPCCall(self::API_NAME_CREATE_ADHOC_CONFERENCE, array(
				new xmlrpcval($conf->getTitle()),                        // Title
				new xmlrpcval($conf->getDescription()),                  // Description
				new xmlrpcval($startTime, 'dateTime.iso8601'),           // Start date
				new xmlrpcval($conf->getDurationInMin(), 'int'),         // Duration
				$conf->getCreator()->getXMLRPCElement(),                 // Creator
				$conf->getParticipantsXMLRPCElement(),                   // Participants
				new xmlrpcval(true, 'boolean')                           // Should Spreed send the invitations?
			));

		// TODO Test me further
		foreach($conf->getFiles() as $f){
			$uploadSession = $f->isPresentation() ? 'presentations' : 'files';
			$this->uploadFileToSpreed($retBlock[$uploadSession]['url'], $retBlock[$uploadSession]['file_field'], $retBlock[$uploadSession]['session'], $f->getFilePath());
		}

		$passArray = $retBlock['passwords'];

		// Set the creator credentials:
		$password = $passArray[$conf->getCreator()->getEmail()];
		$conf->getCreator()->setCheckInURL($retBlock['join_url'] . "?u=" . $conf->getCreator()->getEmail() . "&p=" . $password . "&fm=1&direct=1");

		// Set the participant credentials:
		foreach($conf->getUsers() as $u){
			$password = $passArray[$u->getEmail()];
			$u->setCheckInURL($retBlock['join_url'] . "?u=" . $u->getEmail() . "&p=" . $password . "&fm=1&direct=1");
		}
	}

	/**
	 * Execute a XMLRPC Call on the server of Spreed.
	 * This will connect to the Spreed Server, and send a
	 * XML/RPC message to the server to fire up the function
	 * requested with the supplied arguments. The result
	 * of this operation is returned by the function.
	 * @param string $fname The name of the function to call on the
	 * Spreed Server.
	 * @param mixed[] $fargs The argument list for this remote
	 * function call.
	 * @return XMLRPCResult The result block returned by the Spreed Server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the function call returned some error
	 * on the server side of Spreed.
	 **/
	protected function doXMLRPCCall($fname, $fargs)
	{
		$args = new xmlrpcval( array(
			'version' => new xmlrpcval('1.0'),
			'id'      => new xmlrpcval(2, 'int'),
			'method'  => new xmlrpcval('submit'),
			'auth'    => new xmlrpcval(self::SOFTWARE_AUTH_ID),
			'args'    => new xmlrpcval($fargs, 'array')
		), 'struct' );

		// Set-up the XML/RPC Details
		$client = new xmlrpc_client($this->getXMLRPCURL($fname));

		if(self::DEBUG)
			$client->SetDebug(2);

		// Do not verify the SSL certificate of the server
		$client->setSSLVerifyPeer(false);

		// Set-up the function call itself
		$msg = new xmlrpcmsg($fname);
		$msg->addParam($args);

		// Send the XML/RPC message to the server
		$resp = $client->send($msg);

		// Parse the response
		//
		// Check if calling this function returned some
		// kind of error code and message:
		if ($resp->faultCode())
			throw new SpreedException($resp->faultString(), $resp->faultCode());

		// Decode the response
		$val = php_xmlrpc_decode( $resp->value() );

		// Check if Spreed gave an error message
		if($val['status'] != 0)
			throw new SpreedException($val['error']['message'], $val['status']);

		return $val['result'];
	}

	/**
	 * Get the Check-In URL that is required to construct the
	 * user specific check in URLs.
	 * @return string The base-URL to check-in with.
	 **/
	protected function getCheckInURL()
	{
		return self::CHECKIN_BASE_URL . "jc";
	}

	/**
	 * Get the XML/RPC URL that is required to contact the Spreed
	 * server at.
	 * @param string $fname The function name that will be called.
	 * @return string The XML/RPC-URL to talk with.
	 **/
	protected function getXMLRPCURL($fname)
	{
		return self::CHECKIN_BASE_URL . "XMLRPC";
	}
}
?>
