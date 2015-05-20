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
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/class.spreedapi.php');

/*
 * The XMLRPC Library is required to communicate to the server
 * of Spreed, this XMLRPC library can be found at:
 * http://phpxmlrpc.sourceforge.net/
 */
require_once(PATH_PLUGIN_DIR . '/spreed/php/inc/lib/xmlrpc-3.0.0.beta.inc');
/* The NULL extension should be enabled in the XMLRPC Library */
$GLOBALS['xmlrpc_null_extension']   = true; 
$GLOBALS['xmlrpc_defencoding']      = 'UTF-8';
$GLOBALS['xmlrpc_internalencoding'] = 'UTF-8';

/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * The ASpreedApi class ia an abstract class that implements
 * the Spreed API interface. This class will define the protected
 * methods that are required for the implementing classes of this
 * abstract class. 
 *
 * The XMLRPC Library is required to communicate to the server
 * of Spreed, this XMLRPC library can be found at:
 * @see http://phpxmlrpc.sourceforge.net/
 *
 * Another requirement for this class is the support of the Curl
 * libraries in PHP.
 *
 **/
abstract class ASpreedApi implements SpreedApi
{
	/**
	 * Constructor of the Abstract Spreed API class.
	 **/
	function __construct()
	{

	}

	/**
	 * The init block of the abstract spreed api
	 **/
	public function init()
	{
		// Does nothing yet.
	}

	/**
	 * This method is used to upload a file to the Spreed Server in an
	 * active File Upload Session. It uses Curl to connect to the Spreed
	 * server and upload the file using a POST request to the designated
	 * URL of the session.
	 * @param string $url The URL to connect to the Spreed Server for uploading files.
	 * @param string $fileField The field name where the file should be posted in.
	 * @param string[] $session The session information array with details that are
	 * required to authenticate with the Spreed Server.
	 * @param string $filePath The full path to the file to upload, stored on the
	 * server that runs this code.
	 **/
	protected function uploadFileToSpreed($url, $fileField, $session, $filePath)
	{
		// To fix a bug in the Curl library we need to change dirs to
		// the location of the file and include only the file name in
		// the file field, otherwise the resulting file name will
		// include the whole path towards the file, which would essentially
		// be a security issue.
		// Otherwise the post data will include this:
		// Content-Disposition: form-data; name="file"; filename="/path/to/file.ext"

		// Store the current directory we are working in
		$prevDir = getcwd();

		// Obtain the directory base, and file info and change the dir
		// to the specified location of the file.
		$pathInfo = pathinfo($filePath);
		chdir($pathInfo['dirname']);

		// Create a new curl instance to upload using the PHP Curl library
		$ch = curl_init();

		// We cannot trust the session parameter directly, if it would contain
		// an @ at the beginning of any paramater the server would upload that
		// file, which would be a major security flaw, so check the parameters
		// before we proceed.
		$postData = $session;
		foreach($postData as $key => $val){
			// If the first char is an @, substr so it is removed and add the
			// encoded @ instead.
			if(isset($val) && strncmp($val, '@', 1) == 0){
				$postData[$key] = array( urlencode('@') . substr($val, 1) );
			}
		}

		// Set the post data correctly, the pathInfo['basename'] returns
		// only the file name of the file, without the actual location of
		// the directory where the file is stored.
		//$postData[$fileField] = '@' . $pathInfo['basename'];
		$postData[$fileField] = '@' . $filePath;

		// Set the URL and headers
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1");
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_AUTOREFERER, true);
		curl_setopt($ch, CURLOPT_MAXREDIRS, 10);

		// Set the post data:
		//curl_setopt($ch, CURLOPT_INFILE, $fileuri);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);


		// Debug headers:
		//curl_setopt($ch, CURLOPT_VERBOSE, true);
		//curl_setopt($ch, CURLOPT_HEADER, true);
		//curl_setopt($ch, CURLINFO_HEADER_OUT, true);


		//print_r($postData);
		//print_r(curl_getinfo($ch));

		// Perform the upload to spreed
		curl_exec($ch);

		//print_r(curl_getinfo($ch));

		// Restore to the previous working directory
		chdir($prevDir);

		// Free all the resources, close curl library, etc.
		curl_close($ch);
	}

	/**
	 * Execute a XMLRPC Call on the server of Spreed.
	 * This will connect to the Spreed Server, and send a
	 * XML/RPC message to the server to fire up the function
	 * requested with the supplied arguments. The result
	 * of this operation is returned by the function.
	 * @param string $fname The name of the function to call on the
	 * Spreed Server.
	 * @param string[] $fargs The argument list for this remote
	 * function call.
	 * @return XMLRPCResult The result block returned by the Spreed Server.
	 * @throws SpreedException if the Spreed Server is not
	 * available, or the function call returned some error
	 * on the server side of Spreed.
	 **/
	abstract protected function doXMLRPCCall($fname, $fargs);

	/**
	 * Get the Check-In URL that is required to construct the
	 * user specific check in URLs.
	 * @return string The base-URL to check-in with.
	 **/
	abstract protected function getCheckInURL();

	/**
	 * Get the XML/RPC URL that is required to contact the Spreed
	 * server at.
	 * @param string $fname The function name that will be called.
	 * @return string The XML/RPC-URL to talk with.
	 **/
	abstract protected function getXMLRPCURL($fname);
}

?>
