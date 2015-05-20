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
/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * This class is used to store the details of each participant
 * of the conference call. This class makes setup of new conferences
 * easier, but also makes information returned by the server easier
 * to access.
 *
 */
class SpreedParticipant
{
	private $firstName;
	private $lastName;
	private $organisation;
	private $email;
	private $phone;
	private $language;
	private $timezone;
	private $isModerator;
	private $checkInURL;

	/**
	 * The constructor of the SpreedParticipant class.
	 * @param string $firstName The first name of this participant.
	 * @param string $lastName The last name of this participant.
	 * @param string $organisation The organisation name.
	 * @param string $email The email address to contact the user at.
	 * @param string $phone The phone number of the user.
	 * @param string $language The language that the user wants to
	 * receive invitations in.
	 * @param string $timezone The timezone of the user.
	 * @param boolean $isModerator Set to true if this user is
	 * moderator of this conference meeting.
	 **/
	function __construct($firstName, $lastName, $organisation, $email, $phone = '', $language = null, $timezone = null, $isModerator = false)
	{
		$this->firstName = $firstName;
		$this->lastName = $lastName;
		$this->organisation = $organisation;
		$this->email = $email;
		$this->phone = $phone;
		$this->language = $language;
		$this->timezone = $timezone;
		$this->isModerator = $isModerator;

		// By default this url is null until the participant
		// is added to the conference on the Spreed Server.
		$this->checkInURL = null;
	}

	/**
	 * Get the email address of this user.
	 * @return string This email address as a String
	 **/
	public function getEmail()
	{
		return $this->email;
	}

	/**
	 * Get the Check-In URL that allows this user to login on
	 * the Spreed Server directly.
	 * @return string This User's specific URL to check-in with.
	 **/
	public function getCheckInURL()
	{
		return $this->checkInURL;
	}

	/**
	 * Set the check-in URL once it is returned by the server.
	 * @param string $checkInURL The check-in URL that was generated
	 * using the information obtained by the Spreed server.
	 **/
	public function setCheckInURL($checkInURL)
	{
		$this->checkInURL = $checkInURL;
	}

	/**
	 * The user is added to the conference, this function is
	 * called by the conference class after the user has been
	 * added to the user list.
	 * @param string $conference The Conference object where this user
	 * is added to.
	 *
	 * NOTE: You do not need to call this function yourself,
	 * this would otherwise result in unnecessary operations.
	 */
	public function addedToConference($conference){
		if($this->language == null)
			$this->language = $conference->getLanguage();

		if($this->timezone == null)
			$this->timezone = $conference->getTimezone();
	}

	/**
	 * Extract the name from the display name string.
	 * The display name string can be in many formats, but the
	 * most common format is either:
	 * Firstname Lastname (Organisation) <optional-email@address.com>
	 * or
	 * Lastname, Firstname (Organisation) <optional-email@address.com>
	 * Based on these two formats this function is able to extract
	 * the firstname, lastname and organisation, and return that
	 * as the result string array.
	 * @param string $disp The display string that contains the
	 * name information that you want to extract.
	 * @return string[] The array with the fields: firstname,
	 * lastname, organisation, and email.
	 */
	public static function extractNameArrayFromDisplayName($disp)
	{
		if(preg_match('/^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$/', $disp) !== 0)
			return self::extractNameArrayFromEmailHeader($disp);

		return self::extractNameArrayFromNameField($disp);
	}


	/**
	 * Extract the name from the display name string.
	 * The display name string can be in many formats, but the
	 * most common format is either:
	 * Firstname Lastname (Organisation)
	 * or
	 * Lastname, Firstname (Organisation)
	 * Based on these two formats this function is able to extract
	 * the firstname, lastname and organisation, and return that
	 * as the result string array.
	 * @param string $disp The display string that contains the
	 * name information that you want to extract.
	 * @return string[] The array with the fields: firstname,
	 * lastname and organisation.
	 */
	public static function extractNameArrayFromNameField($fullname)
	{
		$retArray = array('firstname' => '', 'lastname' => '', 'organisation' => '');

		$fullname = trim($fullname);

		$commaPos = strpos($fullname, ',');
		$orgPos = strpos($fullname, '(');

		// Is the name provided in the following format? Doe, John
		if($commaPos !== false){
			// Case: The last name is the first part
			// Example: Doe, John (Zarafa)

			// This is the easy part, the comma deliminates the first
			// and lastnames, which is perfect, we do not need to check
			// where the firstname ends and the lastname start here...

			// Set the lastname first, this is the part until the first comma
			$retArray['lastname'] = trim(substr($fullname, 0, $commaPos));

			// Is the organisation name available?
			if($orgPos !== false){
				$retArray['firstname'] = trim(substr($fullname, $commaPos + 1, $orgPos - $commaPos - 1));
				$retArray['organisation'] = trim(substr($fullname, $orgPos + 1, strpos($fullname, ')') - $orgPos - 1));
			} else {
				$retArray['firstname'] = trim(substr($fullname, $commaPos + 1));
			}
		} else {
			// Case: The first name is the first part
			// Example: John Doe (Zarafa)

			// Is the organisation name available?
			if($orgPos !== false){
				$names = explode(' ', trim(substr($fullname, 0, $orgPos)));
				$retArray['organisation'] = trim(substr($fullname, $orgPos + 1, strpos($fullname, ')') - $orgPos - 1));
			} else {
				$names = explode(' ', $fullname);
			}

			// Loop through the names until you find a lower case
			// name, such as van, der, etc. and add those to the first name
			// field. All the other names will be appended to the last name.
			$mode = 'firstname';
			for($i = 0; $i < count($names); $i++){
				// If we are in firstname mode and we find a name such as van
				// der, etc. or we reached the last name in the name string
				// we should switch to lastname mode and append all the other
				// names to the lastname instead.
				if($mode == 'firstname' && (preg_match('/^[a-z]/', $names[$i]) || $i == (count($names) - 1))){
					$mode = 'lastname';
					$retArray[$mode] = $names[$i];
				} else if($i == 0) {
					$retArray[$mode] = $names[$i];
				} else {
					$retArray[$mode] .= ' ' . $names[$i];
				}
			}
			$retArray['firstname'] = trim($retArray['firstname']);
			$retArray['lastname'] = trim($retArray['lastname']);
		}

		return $retArray;
	}

	/**
	 * Extract the name from the email header.
	 * This is used to process the email address and extract
	 * the firstname, lastname and organisation if possible.
	 * @param string $mailHeader The display string that contains the
	 * name information that you want to extract.
	 * @return string[] The array with the fields: firstname,
	 * lastname, organisation and email.
	 */
	public static function extractNameArrayFromEmailHeader($mailHeader)
	{
		$mailHeader = trim($mailHeader);
		$lessThanPos = strpos($mailHeader, '<');
		if($lessThanPos !== false){
			// This email address has a name specified
			$retArray = SpreedParticipant::extractNameArrayFromNameField(substr($mailHeader, 0, $lessThanPos));
			$retArray['email'] = substr($mailHeader, $lessThanPos + 1, strlen($mailHeader) - $lessThanPos - 2);
		} else {
			// This is just a plain email address, parse it differently
			$retArray = array('firstname' => '', 'lastname' => '', 'organisation' => '', 'email' => $mailHeader);

			$matches = array();
			if(preg_match('/^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$/', $mailHeader, $matches) !== 0){

				$user = $matches[1];
				$retArray['organisation'] = trim($matches[2]);

				$flmatches = array();
				if(preg_match('/(.+)(\-|\.|\_)(\w+)$/', $user, $flmatches) !== 0){
					$retArray['firstname'] = trim($flmatches[1]);
					$retArray['lastname'] = trim($flmatches[3]);
				} else {
					$retArray['lastname'] = trim($user);
				}
			}
		}
		return $retArray;
	}

	/**
	 * Adds to MAPI recipients record fields specific
	 * for spreed records - isModerator, language and timezone.
	 * @static
	 * @param $recipient - recipient to add spreed fields to
	 * @return $recipient - recipient with added fields
	 **/
	public static function convertMapiRecipientToSpreedParticipant($recipient)
	{
		$lang=$GLOBALS['settings']->get('zarafa/v1/main/language');
		$lang=substr($lang, 0, 2);
		$timez=$GLOBALS['settings']->get('zarafa/v1/plugins/spreed/default_timezone');
		$recipient['props']['timezone']=$timez;
		$recipient['props']['language']=$lang;
		$recipient['props']['isModerator']=false;
		if (empty($recipient['props']['smtp_address']))
		{
			$recipient['props']['smtp_address']=$recipient['props']['email_address'];
		}

		return $recipient;
	}

	/**
	 * Get the XML/RPC value of this user struct, given back
	 * in the definition set by Spreed for User structs.
	 * @return XMLRPCVal The xmlrpcval instance for this User struct.
	 **/
	public function getXMLRPCElement()
	{
		return new xmlrpcval( array( // User Struct
			'email' => new xmlrpcval($this->email),                  // Email address
			'firstname' => new xmlrpcval($this->firstName),          // First name
			'lastname' => new xmlrpcval($this->lastName),            // Surname
			'organization' => new xmlrpcval($this->organisation),    // Organization
			'phone' => new xmlrpcval($this->phone),                  // Phone Number
			'timezone' => new xmlrpcval($this->timezone),            // Time Zone
			'language' => new xmlrpcval(strtolower($this->language)),// Language in ISO 3166
			'moderator' => new xmlrpcval($this->isModerator, 'boolean') // Whether this user is a moderator
		), 'struct'); // End of User Struct
	}
}

?>
