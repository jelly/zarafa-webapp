<?php
/** 
 * Zarafa Z-Merge
 * 
 * Copyright (C) 2005 - 2015  Zarafa B.V. and its licensors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3, 
 * and under the terms of the GNU General Public License, version 3,
 * as published by the Free Software Foundation.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU (Affero) General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License 
 * and the GNU General Public License along with this program.  
 * If not, see <http://www.gnu.org/licenses/>.
 *  
 * Created on 27.10.2008 by Sebastian Kummer & Manfred Kutas
 *
 * @package Z-Merge
 * @subpackage SugarCRM
 */


/** 
 * SugarCRMAuthentication is an overwritten implementation of the DefaultAuthentication 
 */ 
class SugarCRMAuthentication extends DefaultAuthentication {

    /**
     * Constructor
     * @param object $profile configuration data for this connection
     */
    function SugarCRMAuthentication($profile, $saved_session = array()) {
        // normalize URL for SugarCRM
        if (substr($profile['url'], -1) === "/") $profile['url'] .= "index.php";
        if (substr($profile['url'],-10) !== "/index.php") $profile['url'] .= "/index.php";

        parent::DefaultAuthentication($profile, $saved_session, true);

        if ((!isset($this->_moreData)) || (!isset($this->_moreData['username']) || (!isset($this->_moreData['password'])))) {
            return false;
        }
    }

    /**
     * Function to the authenticate on the SugarCRM server
     * performs a really hardcore login on the server
     * 
     * @return boolean  authentication sucessful true/false
     */
    function authenticate() {
        unset($this->_session);
        // build submit datastring
        $data = "module=Users&action=Authenticate&" .
                "return_module=Users&return_action=Login&cant_login=&" .
                "login_module=ZMerge&login_action=justBe&login_record=none&" .
                "user_name=".urlencode($this->_moreData['username'])."&" .
                "user_password=".urlencode($this->_moreData['password'])."&" .
                "login_theme=Sugar&login_language=en_us&Login=++Login++";

        $response = $this->raw_connect($this->_scheme, $this->_host, $this->_port, $this->_uri, "application/x-www-form-urlencoded", $data);

        if ($response === false) {
            return false;
        } 

        $cookie = false;

        // process answer
        $lines = explode("\n", $response);
        foreach ($lines as $l) { 
            if (stripos($l, "Set-Cookie") !== false) {
                $s = substr($l, 11);
                if ($sem = strpos($s, ";")) $s = substr($s, 0, $sem);
                $cookie = $s;
            }
            
            if (stripos($l, "module=Users") !== false && stripos($l, "action=Login") !== false) {
                $cookie = false;    
            }
        }
        if ($cookie) {
            $this->_session = trim($s);
            $this->_lastconnect = time();
            return true;
        }
        else { 
            $this->errmess = "Authentication on SugarCRM failed";
            return false;
        }
    }


    /**
     * Function returns the complete URL to perform the "check" action
     * 
     * @access public
     * @return string check-url
     */
    function getCheckUrl() {
        return $this->_url . "?module=ZMerge&action=check&soap=1";
    }


    /**
     * Function returns the complete URL to perform the "connector" action (read/write data)
     * 
     * @access public
     * @return string connector-url
     */
    function getConnectorUrl() {
        return $this->_url . "?module=ZMerge&action=connector";
    }



    /**
     * Function returns a better error message than "unknown error"
     * if there is a short message in the body
     * 
     * @return array response_array with error message 
     */
    function getError(&$response_array, $header, $body) {
        $response_array["status"] = "failed";
        $response_array["message"] = "unknown error";
        
        // is this a direct error message? Usually these are very short
        if (strlen($body) < 200) $response_array["message"] = "SugarCRM: ". $body;
    }


    /**
     * Function returns the key name of the authentication header
     * 
     * @access public
     * @return string  authentication header key name
     */
    function getAuthenticationKey() {
        return "Cookie";
    }

    /**
     * Function returns an valid value for the authentication header
     * in DefaultAuthentication, an "Authentication" header is returned
     * 
     * @access public
     * @return string  authentication header
     */
    function getAuthenticationValue() {
        // lazy login
        if (!$this->isSessionValid(true))
            $this->authenticate();

        if (isset($this->_session))
            return $this->_session;
        else return false;
    }
}
?>
