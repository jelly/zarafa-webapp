<?php
/**
 * This is the global request proxy to the webdav server.
 * It handles all file GET requests and delivers the webdav content.
 *
 * The file needs to be called via GET with the following parameters:
 *  - server : the webdav server/hostname
 *  - port : port of the webdav server
 *  - path : the path to the webdav server
 *  - ssl : a string (true or false) to enable ssl
 *  - user : the username that will be authenticated to the files server
 *  - password : a base64 encoded password for the user
 *  - id : the id to the requested resource
 */
 
// connect to the zarafa session
include("../../../config.php");
include("../config.php");
session_name(COOKIE_NAME);
session_start();

include('version.php');
include('Files/class.helper.php');

require_once('Files/' . Helper::getSessionData("backend") . '_backend.php');

// disable error reporting
error_reporting(0);

$backend = Helper::getSessionData("backend") . "_backend";
$wdc = new $backend;
$wdc->set_server(Helper::getSessionData("server"));
$wdc->set_ssl(Helper::getSessionData("useSSL"));
$wdc->set_port(Helper::getSessionData("useSSL") == 1 ? Helper::getSessionData("portssl") : Helper::getSessionData("port"));
if(Helper::getSessionData("sessionAuth") == 1) {
	$sessionPass = $_SESSION['password'];
	// if user has openssl module installed
	if(function_exists("openssl_decrypt")) {
		if(version_compare(phpversion(), "5.3.3", "<")) {
			$sessionPass = openssl_decrypt($sessionPass,"des-ede3-cbc",PASSWORD_KEY,0);
		} else {
			$sessionPass = openssl_decrypt($sessionPass,"des-ede3-cbc",PASSWORD_KEY,0,PASSWORD_IV);
		}
		
		if(!$sessionPass) {
			$sessionPass = $_SESSION['password'];
		}
	}
	$wdc->set_pass($sessionPass);
	$wdc->set_user($_SESSION["username"]);
} else {
	$wdc->set_pass(base64_decode(Helper::getSessionData("password")));
	$wdc->set_user(Helper::getSessionData("username"));
}
$wdc->set_base(Helper::getSessionData("path"));

// enable debugging
$wdc->set_debug(false);

try {
	$wdc->open();
} catch (BackendException $e) {
	if(isset($_GET["inline"]) && $_GET["inline"] == "false") {
		// Javascript error message
		echo "<script>alert('" . dgettext('plugin_files', 'File backend not responding. Please try again later.') . "');</script>";
	} else {
		// Text error message that is shown in the preview box
		echo dgettext('plugin_files', 'File backend not responding. Please try again later.');
	}
	exit;
}

$buffer = null;
try {
	if(isset($_GET["ids"])) {
		$zip = new ZipArchive;
		$zipname = TMP_PATH . '/files_' . date("dmY_Hi") . '.zip';
		$zip->open($zipname, ZipArchive::CREATE);
		foreach($_GET["ids"] as $id) {
			$wdc->get($id, $buffer);
			$zip->addFromString(Helper::getFilenameFromPath($id) ,$buffer);
			unset($buffer);
		}
		$zip->close();
		
		// no caching
		header('Content-Disposition: attachment; filename="' . basename($zipname) . '"');
		header("Expires: 0"); // set expiration time
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header('Content-Length: ' . filesize($zipname));
		header('Content-Type: application/zip');
		readfile($zipname);
		unlink($zipname);
		
	} else {
		$wdc->get($_GET["id"], $buffer);
		
		$mime = Helper::get_mime($_GET["id"]);

		// needs GD2 library
		if(isset($_GET["thumb"]) && $_GET["thumb"] == "true" && function_exists("ImageCreateFromJPEG") ) {
			$height = 50;
			$width = 40;
			
			if(isset($_GET["width"]))
				$width = $_GET["width"];
			if(isset($_GET["height"]))
				$height = $_GET["height"];
				
			$filepath = tempnam(PLUGIN_FILESBROWSER_TMP, "dataview_");
			file_put_contents($filepath, $buffer);
			
			$images_orig = imagecreatefromstring($buffer);
			$photoX = ImagesX($images_orig);
			$photoY = ImagesY($images_orig);
			$images_fin = ImageCreateTrueColor($width, $height);
			ImageCopyResampled($images_fin, $images_orig, 0, 0, 0, 0, $width+1, $height+1, $photoX, $photoY);
			ImageJPEG($images_fin, $filepath.".thmb");
			ImageDestroy($images_orig);
			ImageDestroy($images_fin);
			
			$buffer = file_get_contents($filepath.".thmb");
			$mime = "image/jpeg";
		}

		// set headers here
		if(isset($_GET["inline"]) && $_GET["inline"] == "false") {
			header('Content-Disposition: attachment; filename="' . Helper::getFilenameFromPath($_GET["id"]) . '"');
		}

		// no caching
		header("Expires: 0"); // set expiration time
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header('Content-Length: ' . strlen($buffer));
		header('Content-Type: ' . $mime);

		// print the downloaded file
		echo $buffer;
	}
} catch (BackendException $e) {
	if(isset($_GET["inline"]) && $_GET["inline"] == "false") {
		// Javascript error message
		echo "<script>alert('" . dgettext('plugin_files', 'This file is no longer available. Please clear the cache.') . "');</script>";
	} else {
		// Text error message that is shown in the preview box
		echo dgettext('plugin_files', 'This file is no longer available. Please clear the cache.');
	}
	exit;
}
flush();
?>
