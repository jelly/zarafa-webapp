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
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/class.spreedparticipant.php');
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/class.spreedfile.php');

/*
 * This class uses the DateTime class that was added to PHP
 * since version 5.2. Since we support PHP 5 and above for
 * this plugin, we had to develop a legacy class that wraps
 * around the available functions of earlier versions so
 * newer PHP environments can take adventage of the newer
 * DateTime class, and older environments are able to run
 * as well.
 */
if(!class_exists("DateTime")){
	require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/legacy/class.datetime.php');
}

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * The Spreed Conference class will setup the call directly
 * on the Spreed Server using the specified API, this allows
 * a seamless integration with different API's of Spreed.
 * With the Spreed Conference class the context of information
 * is also kept locally, which increases the code stability and
 * test possibilities. You can specify a Unit-Test-API that
 * implements the SpreedApi interface and ASpreedApi abstract
 * class functions to test the in and output completely.
 *
 */
class SpreedConference
{
	private $title;
	private $desciption;
	private $startTime;
	private $durationInMin;
	private $timezone;
	private $language;
	private $creator;
	private $users;
	private $files;

	/**
	 * The constructor of the Spreed Conference class.
	 * @param string $title The title of this conference call.
	 * @param string $description The description of the conference call.
	 * @param DateTime $startTime The DateTime instance that represents
	 * the start of the conference call.
	 * @param int $durationInMin The duration of the conference in
	 * minutes.
	 * @param string $timezone The timezone of the conference call.
	 * @param string $language The default language of the conference
	 * invitor. This will be used as the default language for
	 * users that have no specific language set.
	 * @param SpreedParticipant $creator The SpeedParticipant instance of the
	 * creator of this conference meeting.
	 **/
	public function __construct($title, $description, $startTime, $durationInMin, $timezone, $language, $creator)
	{
		$this->title = $title;
		$this->description = $description;

		if($startTime == null){
			$this->startTime = new DateTime("now");
		} else
		{
			$this->startTime = $startTime;

		}
		$this->durationInMin = $durationInMin;
		$this->timezone = $timezone;
		$this->language = $language;

		$this->creator = $creator;

		$this->users = array();
		$this->files = array();
	}

	/**
	 * Add a new user to the conference.
	 * @param SpreedParticipant $user The new user instance to add.
	 **/
	public function addUser($user)
	{
		$this->users[] = $user;
		$user->addedToConference($this);
	}

	/**
	 * Add a new file to the conference.
	 * @param SpreedFile $file The new file instance to add.
	 **/
	public function addFile($file)
	{
		$this->files[] = $file;
	}

	/**
	 * Get the title of the conference call.
	 * @return string The title as a String
	 **/
	public function getTitle()
	{
		return $this->title;
	}

	/**
	 * Get the description of the conference call.
	 * @return string The description as a String
	 **/
	public function getDescription()
	{
		return $this->description;
	}

	/**
	 * Get the start time of the conference call.
	 * @return DateTime The start time as a DateTime instance.
	 **/
	public function getStartTime()
	{
		return $this->startTime;
	}

	/**
	 * Get the duration in minutes of the conference call.
	 * @return int The duration in minutes as a String
	 **/
	public function getDurationInMin()
	{
		return $this->durationInMin;
	}

	/**
	 * Get the creator of this conference call.
	 * @return SpreedParticipant The SpreedPartcipant instance of the creator.
	 **/
	public function getCreator()
	{
		return $this->creator;
	}

	/**
	 * Get the users of this conference call.
	 * @return SpreedParticipant[] The array with all the SpreedParticipant instances.
	 **/
	public function getUsers()
	{
		return $this->users;
	}

	/**
	 * Get the files of this conference call.
	 * @return SpreedFile[] The array with all the SpreedFile instances.
	 **/
	public function getFiles()
	{
		return $this->files;
	}

	/**
	 * Get the language of the conference call.
	 * @return string The language as a String
	 **/
	public function getLanguage()
	{
		return $this->language;
	}

	/**
	 * Get the timezone of the conference call.
	 * @return string The timezone as a String
	 **/
	public function getTimezone()
	{
		return $this->timezone;
	}

	/**
	 * Cast the array of users to an array that is
	 * in the xmlrpcval format, such that the Spreed
	 * server knows which participants to add.
	 * @return XMLRPCRValue The xmlrpcval array of the users,
	 * each single user is also in its xmlrpcval
	 * wrapper.
	 **/
	public function getParticipantsXMLRPCElement()
	{
		$xmlUsers = array();
		foreach($this->users as $u){
			$xmlUsers[] = $u->getXMLRPCElement();
		}
		return new xmlrpcval($xmlUsers, 'array');
	}
}

?>
