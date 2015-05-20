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
 * @subpackage lib
 */


/** 
 * DefaultAuthentication uses HTTP Auth 
 */ 

class DefaultAuthentication {
    /**
     * class logger
     *
     * @access protected
     * @var Logger
     */
    var $_log;

    var $_url;
    var $_host;
    var $_uri;
    var $_scheme;
    var $_authUri;
    
    var $_session;
    var $_lastconnect;
    var $_sessionTimeout;
    var $_moreData;
    var $errmess;


    /**
     * Constructor
     * @param object $profile configuration data for this connection
     */
    function DefaultAuthentication($profile, $saved_session = array(), $urlNormalized = false) {
        if (isset($profile['url'])) {
            // normalize URL if not done yet
            if (! $urlNormalized && substr($profile['url'], -1) !== "/") $profile['url'] .= "/";

            $this->_url = $profile['url'];
            $this->errmess = false;

            $urlParts =    parse_url($profile['url']);
            
            $this->_host = $urlParts['host'];
            $this->_uri = $urlParts['path'];

            $this->_port = isset($urlParts['port'])? $urlParts['port'] : "";
            if ($this->_port == "") {
                switch( $urlParts['scheme'] ) {
                    case 'http':
                        $this->_port = 80; // default for http
                        break;
                    case 'https':
                        $this->_port = 443; // default for https
                        break; 
                }
            }

            $this->_scheme = $urlParts['scheme'];
            if ($this->_scheme == "https") $this->_scheme = "ssl://";
            else $this->_scheme = "";

            // DefaultAuthentication tries to connect to connector.php
            // can be changed using setAuthUri($uri)
            $this->_authUri = "connector.php";
        }

        $this->_sessionTimeout = (isset($profile['sessionTimeout']))?$profile['sessionTimeout'] : 60; // 1 min default
        if (isset($profile['moreData'])) $this->_moreData = $profile['moreData'];
        else {
            $this->_moreData = array();
            $this->_moreData['username'] = $profile['username'];
            $this->_moreData['password'] = $profile['password'];
        }

        // reuse a previous session if the configured username hasn't changed
        if (isset($saved_session['username']) && isset($this->_moreData['username']) &&
            $this->_moreData['username'] == $saved_session['username'] &&
            isset($saved_session['session']) && isset($saved_session['lastconnect'])) {

            $this->_session = $saved_session['session'];
            $this->_lastconnect = $saved_session['lastconnect'];
        }
    }


    /**
     * Function set the LogObject
     * 
     * @access public
     * @param $log log object
     * @return void
     */    
    function setLog($log) {
        $this->_log = $log;
    }


    /**
     * Function to the authentication
     * the default implementation sends an authentication header.
     * so, no real login is done here
     * 
     * @access public
     * @return boolean  authentication sucessful true/false                  
     */
    function authenticate(){
        unset($this->_session);
        $this->errmess = false;

        $resp = $this->raw_connect($this->_scheme, $this->_host, $this->_port, $this->_uri . $this->_authUri, "plain/text", "", array($this->getAuthenticationHeader()));
        // check if there is an HTTP 401 code
        preg_match("/http.*? ((\d+) .*)/i", $resp,$m);

        if ($m[2] != "200" ) {
            $this->errmess = "Authentication failed (". trim($m[1]) .")";
            if (isset($this->_log))
                $this->_log->error($this->errmess);

            return false;
        }
        $this->_session = true;
        return true;
    }


    /**
     * Function returns an array with session information
     * These could be saved and reused for a later request
     * 
     * @access public
     * @return array  session data
     */
    function getSessionData() {
        return array(   "session" => $this->_session, 
                        "lastconnect" =>$this->_lastconnect, 
                        "username" => ($this->_moreData['username'])?$this->_moreData['username']:""
                    );
    }


    /**
     * Function returns the complete URL to perform the "check" action
     * 
     * @access public
     * @return string check-url
     */
    function getCheckUrl() {
        return $this->_url . "check.php?soap";
    }


    /**
     * Function returns the complete URL to perform the "connector" action (read/write data)
     * 
     * @access public
     * @return string connector-url
     */
    function getConnectorUrl() {
        return $this->_url . "connector.php";
    }


    /**
     * Function returns the Uri to be appended on the URL to perform the authentication
     * 
     * @access public
     * @return string authentication-uri
     */
    function getAuthUri() {
        return $this->_authUri;
    }


    /**
     * Function sets the Uri to be appended on the configured URL to perform the authentication
     * 
     * @access public
     * @param string $uri authentication-uri
     * return void
     */
    function setAuthUri($uri) {
        $this->_authUri = $uri;
    }


    /**
     * Function returns an valid authentication header
     * build with getAuthenticationKey() and getAuthenticationValue()
     * 
     * @access public
     * @return string  authentication header
     */
    function getAuthenticationHeader(){
        $value = $this->getAuthenticationValue();
        if ($value)
            return $this->getAuthenticationKey() . ": ". $value;
        else
            return false;
    }


    /**
     * Function returns the key name of the authentication header
     * 
     * @access public
     * @return string  authentication header key name
     */
    function getAuthenticationKey() {
        return "Authorization";
    }


    /**
     * Function returns an valid value for the authentication header
     * in DefaultAuthentication, an "Authentication" header is returned
     * 
     * @access public
     * @return string  authentication header
     */
    function getAuthenticationValue() {
        return "Basic ". base64_encode($this->_moreData['username'] .":". $this->_moreData['password']);
    }


    /**
     * Function returns session string that will be submitted as first
     * parameter of the soap remote function
     * 
     * @access public
     * @return string  session string
     */
    function getSoapSessionString() {
        return "";
    }


    /**
     * Function to check if the session is still valid
     * 
     * @access public
     * @param boolean $check_timeout consider the session_timeout time
     * @return boolean  session valid true/false                  
     */
    function isSessionValid($check_timeout = true) {
        if ($check_timeout && isset($this->_lastconnect) && 
            $this->_lastconnect < (time() - $this->_sessionTimeout))
            return false;
        return (isset($this->_session) && $this->_session);
    }


    /**
     * Function to upload a raw RFC822 email from Zarafa (PHP-MAPI) Webaccess to a server (POST)
     * This function is used only by the ZMA Webaccess plugin
     * 
     * @access public
     * @param string $querystring Querystring appended to the server uri
     * @param mapistream $stream Reference to the mapistream of the message
     * @param string $filename submit the stream with that filename
     * @param string $content_type submit the data with that filename
     * @param array $moreData    name => value array of other values to be posted
     * @param array $moreHeaders simple array of additional header lines
     * @return array  "status" => "ok"/"failure", "message" => a message                  
     */
    function uploadData($querystring, &$stream, $filename, $content_type, $moreData = array(), $moreHeaders = array()) {
           $authentication = $this->getAuthenticationHeader();
           if (!$authentication) 
               return array("status" => "failed", "message" => "Authentication on the remote server failed");

        // generate a boundary
        srand((double)microtime()*1000000);
        $boundary = "---------ZMA-----ARCHIVE------".substr(md5(rand(0,32000)),0,10);

           // build POSTDATA for $moreData
           $data = "";
           foreach ($moreData as $key=>$value) {
            $data .="--$boundary\r\n";
            $data .= "Content-Disposition: form-data; name=\"$key\"\r\n";
            $data .= "\r\n".$value."\r\n";
            $data .="--$boundary\r\n";
           }

        $datasize = strlen($data);
        $job = array();

        // attach data
        $job['start']  = "--$boundary\r\n";
        $job['start'] .= "Content-Disposition: form-data; name=\"archivefile\"; filename=\"{$filename}\"\r\n";
        $job['start'] .= "Content-Type: {$content_type}\r\n\r\n";

        // File length
         $stat = mapi_stream_stat($stream);
        $job['datasize'] = $stat["cb"];

        $job['end'] = "\r\n--$boundary--\r\n";

        // add datasize to the total post size
        $datasize += strlen($job['start']) + $job['datasize'] + strlen($job['end']);

        //Build the header
        $header = "POST ". $this->_uri . "?" . $querystring ." HTTP/1.0\r\n";
        $header .= "Host: {$this->_host}\r\n";
        $header .= "Content-type: multipart/form-data, boundary=$boundary\r\n";
        $header .= "Content-length: " . $datasize . "\r\n";    
        $header .= $authentication . "\r\n";

        foreach($moreHeaders as $h) $header .= $h . "\r\n";
        $header .= "\r\n";

        $fp = @fsockopen($this->_scheme . $this->_host, $this->_port, $errno, $errstr, 3);

        if ($errstr || get_resource_type($fp) != 'stream') {        
            if (isset($this->_log))
                $this->_log->error("connection could not be established! ". $errstr);
                
             return array("status" => "failed", "message" => "connection failed");
         }
           // send static data
        fputs($fp, $header . $data . $job['start']);

        // write stream data to the upload
        for($i = 0; $i < $job['datasize']; $i += BLOCK_SIZE) {
            $content = mapi_stream_read($stream, BLOCK_SIZE);
            fputs($fp, $content);        
        }
        fputs($fp, $job['end']);
        // get answer answer
        $rawresponse = "";
        while(!feof($fp)) 
                $rawresponse .= fgets($fp, 128);
        fclose($fp);

        // process response from the server
        $content = explode("\r\n\r\n", $rawresponse);
        $rv = explode("\n", $content[1]);
        $response = array();
        foreach ($rv as $l) {
            if (stripos($l, "serverurl:") !== false) $response['serverurl'] = trim(substr($l, 10));
            if (stripos($l, "status:") !== false) $response['status'] = trim(substr($l, 7));
            if (stripos($l, "message:") !== false) $response['message'] = trim(substr($l, 8));
        }
        if (empty($response))
            $this->getError($response, $content[0], $content[1]);

        $this->_lastconnect = time();

        return $response;
    }


    /**
     * Function could return a better error message than just "unknown error"
     * It could be extracted from the header or the body
     * 
     * @access private
     * @return array response_array
     */
    function getError(&$response_array, $header, $body) {
        $response_array["status"] = "failed";
        $response_array["message"] = "unknown error";
    }


    /**
     * Function executes a raw socket connect and returns the response
     * 
     * @access public
     * @return string response
     */
    function raw_connect($scheme, $host, $port, $path, $content_type, $data, $headers = array()) {
        //Build the header
        $header = "POST $path HTTP/1.0\r\n";
        $header .= "Host: $host\r\n";
        $header .= "Content-type: $content_type\r\n";
        $header .= "Content-length: " . strlen($data) . "\r\n";    // no $data manipulation after that point
        foreach($headers as $h) $header .= $h . "\r\n";
        $header .= "\r\n";

        $fp = @fsockopen($scheme . $host, $port, $errno, $errstr, 3);

        if ($errstr || !isset($fp) || get_resource_type($fp) != 'stream') {
            $this->errmess = "connection could not be established! ". $errstr;

            if (isset($this->_log))
                $this->_log->error($this->errmess);

             return false; 
         }

        // send !
        fputs($fp, $header . $data);

        // get answer answer
        $answer = "";
        while(!feof($fp)) 
                $answer .= fgets($fp, 128);
        fclose($fp);

        return $answer;
    }

}
?>
