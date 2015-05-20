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
if(!class_exists("DateTime")){
	require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/legacy/class.datetime.php');
}

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * The Authenticated Spreed Api class to talk with the Authenticated
 * API's at the Spreed Servers using XML/RPC.
 * This class extends the ASpreedApi and therefore implements the
 * SpreedApi interface.
 *
 **/
class AuthSpreedApi extends ASpreedApi
{
	const SOFTWARE_AUTH_ID = "5618e6f2-b537-4413-aa09-5e7cca2f8423";
	const CHECKIN_BASE_URL = "https://eu99.spreed.com/checkin/";
	const USERNAME = "you@example.com";
	const PASSWORD = "YOURPASSWORD";
	const LICENSE_ID = "";
	const DEBUG = false;

	private $username;
	private $password;
	private $application_url;
	private $cookie_name;
	private $cookie_ticket;

	/**
	 * Construct the Authenicated Spreed API Instance.
	 * @param string $username The username to login with, defaults to the
	 * hard coded value if left equal to null.
	 * @param string $password The password to login with, defaults to the
	 * hard coded value if left equal to null.
	 **/
	function __construct($username = null, $password = null)
	{
		parent::__construct();

		// Check whether specific username and password details
		// were given
		$this->username = $username != null ? $username : self::USERNAME;
		$this->password = $password != null ? $password : self::PASSWORD;

		$this->application_url = null;
		$this->cookie_name = 'na';
		$this->cookie_ticket = '';
	}

	/**
	 * Initialize the Spreed API Communication Channel, this
	 * will login at the Spreed Server Authenticated XML/RPC
	 * server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the server of Spreed returns an error.
	 **/
	public function init()
	{
		// Init our super class too.
		parent::init();

		// Make sure the default timezone is set to UTC
		//date_default_timezone_set('UTC');

		// Login as the user
		$result = $this->doXMLRPCCall('spreed.login.login', array(
								new xmlrpcval(self::USERNAME),
								new xmlrpcval(self::PASSWORD)
							));

		// This part will only be reached if the init part
		// did not result in any exception being thrown
		$this->application_url = $result['application_url'];
		$this->cookie_name = $result['cookie_name'];
		$this->cookie_ticket = $result['ticket'];
	}

	/**
	 * Get the list of open conferences that are available at
	 * the server for this current session, or all open
	 * conferences that exist for this user.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the server of Spreed returns an error.
	 **/
	public function getConferences()
	{
		return $this->doXMLRPCCall('spreed.studio.getConferences', array());
	}

	/**
	 * The Spreed API allows only a limited list of timezones,
	 * the complete list of options can be obtained by calling
	 * this function. It will connect to the Spreed API and ask
	 * for all valid values.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param string $language The ISO 3166 language value to return the
	 * list of timezones in.
	 * @return string[] Array of timezone strings.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the server of Spreed returns an error.
	 **/
	public function getTimezones($language)
	{
		return $this->doXMLRPCCall('spreed.misc.getTimezones', array(new xmlrpcval($language)));
	}

	/**
	 * The Spreed API allows only a limited list of languages,
	 * the complete list of options can be obtained by calling
	 * this function. It will connect to the Spreed API and ask
	 * for all valid values.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param string $language The ISO 3166 language value to return the
	 * list of languages in.
	 * @return string[] Array of language strings.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the server of Spreed returns an error.
	 **/
	public function getLanguages($language)
	{
		return $this->doXMLRPCCall('spreed.misc.getCountries', array(new xmlrpcval($language)));
	}

	/**
	 * Create a new conference call on the Spreed server. This will
	 * create the conference with the specified configuration and
	 * return a conference block with the identifiers inside.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param string $title The title of the conference call.
	 * @param string $description The description of the conference call.
	 * @param DateTime $startTime The DateTime instance of the start time
	 * of the conference.
	 * @param int $durationInMin The duration of the conference call in
	 * minutes.
	 * @return SpreedConference The conference block with identifiers.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the function to create a new conference returns
	 * a failure on the server side of Spreed.
	 **/
	public function createNewConference($title, $description, $startTime, $durationInMin)
	{
		// The Spreed API requires us to send the start time in UTC timezone.
		$startTime->setTimezone(new DateTimeZone('UTC'));

		return $this->doXMLRPCCall('spreed.studio.createConference', array(
				new xmlrpcval($title),                        // Title
				new xmlrpcval($description),                  // Description
				new xmlrpcval($startTime, 'dateTime.iso8601'),// Start date
				//new xmlrpcval($startTime->format('c'), 'dateTime.iso8601'),// Start date
				new xmlrpcval(self::LICENSE_ID),              // License ID
				new xmlrpcval('spreed_private'),              // Conference type (spreed_private, spreed_public)
				new xmlrpcval($durationInMin, 'int'),         // Duration
			));
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
		// TODO Implement me
		$confBlock = $this->createNewConference($conf->getTitle(), $conf->getDescription(), $conf->getStartTime(), $conf->getDurationInMin());

		//echo "Conference created: <br />";
		//print_r($conf);

		// Add the participants
		$part = $this->addParticipants($confBlock, $conf->getParticipantsXMLRPCElement());

		// TODO Process the response, store the pins in the user instances

		//echo "Participants added: <br />";
		//print_r($part);

		//echo "<br />The invitation ids for the users: <br />";
		//foreach($result as $u){
		//    $url = construct_spreed_checkin_url($conf['meeting_id'], $u['pin'], $u['email']);
		//    echo $u['email'] . " => <a href='$url'>Login - $url</a><br/>";
		//}

		// Add the attachments
		foreach($conf->getFiles() as $f){
			$this->addFile($confBlock, $f->getFilePath(), $f->isPresentation());
		}

		// Send the invitations
		$this->sendInvitations($confBlock);
	}

	/**
	 * Add the list of participants on the Spreed Server to the
	 * specified conference.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param SpreedConference $conf The conference block with the identifiers referencing
	 * to the conference on the Spreed Server.
	 * @param XMLRPCArray $xmlrpcParticipantsArray An array with all the
	 * user structure blocks inside wrapped in xmlrpcval instances.
	 * See the documentation of Spreed for the exact configuration
	 * of these User structure blocks.
	 * @return XMLRPCResult The result as given back by the Spreed Server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the function to add participants returns some
	 * failure on the server side of Spreed.
	 **/
	public function addParticipants($conf, $xmlrpcParticipantsArray)
	{
		return $this->doXMLRPCCall('spreed.studio.addParticipants', array(
								new xmlrpcval($conf['conference_id']),
								$xmlrpcParticipantsArray
							));
	}

	/**
	 * Add a file to the conference on the Spreed Server. This will
	 * setup a file upload session with the Spreed Server and connect
	 * using the libcurl implementation in PHP to the server to upload
	 * the file given.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param SpreedConference $conf The conference block with the identifiers referencing
	 * to the conference on the Spreed Server.
	 * @param string $file The full-path to the file stored on this server. Do not
	 * worry about the path becoming visible to the Spreed Server, this is
	 * dealt with correctly.
	 * @param boolean $typeIsPresentation Set this value to true to upload this file
	 * in the presentation section of the conference. This will make it
	 * visible to all users. If this value is set to false it will upload
	 * as an attachment to this conference so everyone can download it
	 * during the conference call.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the file upload session cannot be created by some
	 * failure on the server side of Spreed.
	 **/
	public function addFile($conf, $file, $typeIsPresentation)
	{
		$uploadSession = $this->doXMLRPCCall($typeIsPresentation ? 'spreed.meeting.presentations.getUploadSession' : 'spreed.meeting.files.getUploadSession',
										   array(new xmlrpcval($conf['meeting_id'])));

		$this->uploadFileToSpreed($uploadSession['url'], $uploadSession['file_field'], $uploadSession['session'], $file);
	}

	/**
	 * Calling this function will send all the invitations to the participants
	 * of this conference.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param SpreedConference $conf The conference block with the identifiers referencing
	 * to the conference on the Spreed Server.
	 * @return XMLRPCResult The result as given back by the Spreed Server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the invitations cannot be send by some error
	 * on the server side of Spreed.
	 **/
	public function sendInvitations($conf)
	{
		//return $this->doXMLRPCCall('spreed.studio.sendInvitations', array(new xmlrpcval(new xmlrpcval($conf['conference_id']))));
		return $this->doXMLRPCCall('spreed.studio.sendInvitations', array(new xmlrpcval($conf['conference_id'])));
	}

	/**
	 * Calling this function will delete the list of conferences that
	 * were given.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @param int[] $confIDs The list of conference ids that need to be deleted
	 * from the Spreed Server.
	 * @return XMLRPCResult The result as given back by the Spreed Server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the deletion of conferences
	 * fails on the server side of Spreed.
	 **/
	public function deleteConferences($confIDs)
	{
		if(!is_array($confIDs))
			$confIDs = array($confIDs);

		return $this->doXMLRPCCall('spreed.studio.deleteConferences', array(new xmlrpcval($confIDs, 'array')));
	}

	/**
	 * Calling this function will delete all the open conference calls on
	 * the Spreed Server. It will first obtain the list with open conference
	 * calls, and delete those using the deleteConferences function.
	 * NOTE: Call the init function before calling this method,
	 * otherwise a SpreedException is thrown.
	 * @return XMLRPCResult The result as given back by deletion operation on the
	 * Spreed Server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the listing of conferences or deletion of conferences
	 * fails on the server side of Spreed.
	 **/
	public function deleteAllOpenConferences()
	{
		// Gather all the open conferences first
		$allOpenConferences = $this->getConferences();

		// Convert the structure to XML/RPC Style
		$xmlOpenConferences = array();
		foreach($allOpenConferences as $c){
			$xmlOpenConferences[] = new xmlrpcval($c['conference_id']);
		}

		// Delete the conferences
		return $this->deleteConferences($xmlOpenConferences);
	}

	/**
	 * Construct the spreed check in URL for each participant, except the invitor.
	 * @param string[] $conf The conference block of the conference that has been setup.
	 * @param string $pin The pin code of this user to include in the URL.
	 * @param string $email The mail address of the user.
	 * @return string The Check-In URL to join the Spreed web meeting.
	 **/
	public function getSpreedCheckInURL($conf, $pin, $email){
		return $this->getCheckInURL() . '/' . urlencode($conf['meeting_id']) . '?p=' . urlencode($pin) . '&direct=1&u=' . urlencode($email);
	}

	/**
	 * Construct the spreed check in URL for the invitor.
	 * @param string[] $conf The conference block of the conference that has been setup.
	 * @return string The Check-In URL to join the Spreed web meeting.
	 **/
	public function getSpreedCheckInURLInvitor($conf){
		return $this->getCheckInURL() . '/' . urlencode($conf['meeting_id']) . '&direct=1';
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

		// Set Cookie Authentication Session
		if($fname != 'spreed.login.login')
			$client->setcookie($this->cookie_name, $this->cookie_ticket);

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
		return $fname == 'spreed.login.login' || $this->application_url == null ? self::CHECKIN_BASE_URL . "XMLRPC" : $this->application_url;
	}
}

?>
