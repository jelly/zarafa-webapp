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
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/legacy/class.datetimezone.php');

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * This class has been added to provide backwards compatibility
 * for the DateTime class that was added to PHP version 5.2.
 * With this legacy implementation the code will be able to run
 * on older versions of PHP 5 as well, while getting all the
 * adventages of the new DateTime class for the newer installations.
 *
 */
class DateTime
{
	private /*int*/ $timestamp;
	private /*DateTimeZone*/ $timezone;

	public function __construct(/*string*/ $str = "now", /*DateTimeZone*/ $zone = null)
	{
		if($str == "now"){
			$this->timestamp = time();
		} else {
			$this->timestamp = strtotime($str);
		}

		$this->timezone = is_null($zone)? new DateTimeZone( date_default_timezone_get() ) : $zone;
	}

	public /*int*/ function getTimestamp()
	{
		return $this->timestamp;
	}

	public /*DateTimeZone*/ function getTimezone()
	{
		return $this->timezone;
	}

	public /*string*/ function format($format)
	{
		return date($format, $this->timestamp);
	}

	public /*DateTime*/ function modify(/*string*/ $str)
	{
		$this->timestamp = strtotime($str, $this->timestamp);
		return $this;
	}

	public /*DateTime*/ function setDate(/*int*/ $year, /*int*/ $month, /*int*/ $day)
	{
		$this->timestamp = mktime(date('H', $this->timestamp), date('i', $this->timestamp), date('s', $this->timestamp), $month, $day, $year);
		return $this;
	}

	public /*DateTime*/ function setTime(/*int*/ $hour, /*int*/ $minute, /*int*/ $second = 0)
	{
		$this->timestamp = mktime($hour, $minute, $second, date('n', $this->timestamp), date('j', $this->timestamp), date('Y', $this->timestamp));
		return $this;
	}

	public /*DateTime*/ function setTimestamp(/*int*/ $unixtimestamp)
	{
		$this->timestamp = $unixtimestamp;
		return $this;
	}

	public /*DateTime*/ function setTimezone(/*DateTimeZone*/ $timezone)
	{
		/* Substract the old offset from the timestamp first */
		$this->timestamp -= $this->timezone->getOffset($this);

		/* Now add the new offset to the timestamp */
		$this->timezone = $timezone;
		$this->timestamp += $timezone->getOffset($this);
		return $this;
	}
}

?>
