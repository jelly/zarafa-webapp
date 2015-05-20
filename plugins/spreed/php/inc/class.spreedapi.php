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
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/class.spreedexception.php');

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * The SpreedApi interface defines all the public functions
 * that are required for a seamless integration of other API
 * versions of the Spreed system.
 *
 **/
interface SpreedApi
{
	/**
	 * Initialize the Spreed API Communication Channel, this
	 * will login if necessary or start another type of session
	 * to communicate with the server.
	 **/
	public function init();

	/**
	 * The Spreed API allows only a limited list of timezones,
	 * the complete list of options can be obtained by calling
	 * this function. It will connect to the Spreed API and ask
	 * for all valid values.
	 * @param string $language The ISO 3166 language value to return the
	 * list of timezones in.
	 **/
	public function getTimezones($language);

	/**
	 * The Spreed API allows only a limited list of languages,
	 * the complete list of options can be obtained by calling
	 * this function. It will connect to the Spreed API and ask
	 * for all valid values.
	 * @param string $language The ISO 3166 language value to return the
	 * list of languages in.
	 **/
	public function getLanguages($language);

	/**
	 * Set-up a new conference call on the Spreed server. This will
	 * create the conference using all the information that is available
	 * in the Spreed Conference object and process all the returned
	 * information back in the api.
	 * @param SpreedConference $conf The Spreed Conference object that should be set-up.
	 * @return boolean True if it succeeded to set-up the spreed conference
	 * meeting, false in all other cases.
	 **/
	public function setupSpreedConference($conf);
}

?>
