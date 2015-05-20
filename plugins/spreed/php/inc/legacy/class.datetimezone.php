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

require_once(PATH_PLUGIN_DIR . '/spreed/php/dat/legacy/timezones.inc');

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * This class has been added to provide backwards compatibility
 * for the DateTimeZone class that was added to PHP version 5.2.
 * With this legacy implementation the code will be able to run
 * on older versions of PHP 5 as well, while getting all the
 * adventages of the new DateTimeZone class for the newer installations.
 *
 */
class DateTimeZone
{
	private /*string*/ $zonename;

	/* Methods */
	public function __construct(/*string*/ $timezone)
	{
		$this->zonename = $timezone;
	}

	public /*array*/ function getLocation()
	{
		return array(
					"country_code" => 'UNKNOWN',
					"latitude" => "0.000",
					"longitude" => "0.000",
					"comments" => "n/a"
				);
	}

	public /*string*/ function getName()
	{
		return $this->zonename;
	}

	public /*int*/ function getOffset(/*DateTime*/ $datetime)
	{
		$tz = $GLOBALS['_DATE_TIMEZONE_DATA'][$this->zonename];
		if(isset($tz))
			return round($tz['offset'] / 1000.0);

		return false;
	}

	public /*array*/ function getTransitions(/*int*/ $timestamp_begin = 0, /*int*/ $timestamp_end = 0)
	{
		$tz = $GLOBALS['_DATE_TIMEZONE_DATA'][$this->zonename];
		if(isset($tz))
			return array(array(
					"ts" => "0",
					"time" => "0",
					"offset" => round($tz['offset'] / 1000.0),
					"isdst" => $tz['hasdst'],
					"abbr" => $tz['shortname']
				));

		return false;
	}

	public static /*array*/ function listAbbreviations()
	{
		$tz = $GLOBALS['_DATE_TIMEZONE_DATA'][$this->zonename];
		if(isset($tz))
			return array(array(
					"dst" => $tz['hasdst'],
					"offset" => round($tz['offset'] / 1000.0),
					"timezone_id" => $tz['shortname']
				));

		return false;
	}

	public static /*array*/ function listIdentifiers(/*int*/ $what = DateTimeZone::ALL, /*string*/ $country = null)
	{
		return array_keys($GLOBALS['_DATE_TIMEZONE_DATA']);
	}
}
?>
