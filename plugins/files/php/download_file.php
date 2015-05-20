<?php
/**
 * Download Files
 * This file is used to download a file from a temporary directory.
 */
include('Files/class.helper.php');
 
/** 
 * This function reads the temporary file from the server and passes it to the client.
 * 
 * This file needs to be called via a GET request with the following parameters: 
 *  - tmpname : temporary name of the file
 *  - filename : the "real" filename, that the client should see
 *  - basedir : the directory where the temporary file is stored
 *  - secid : the security id to check if the download is allowed
 *
 * @return void
 */
function downloadAttachment() {
	$tempname  = $_GET["tmpname"];
	$filename  = $_GET["filename"];
	$tmpdir  = $_GET["basedir"];
	$secid    = $_GET["secid"];
	$attachmentdir = "attachments";
	
	$secfile = $tmpdir . DIRECTORY_SEPARATOR . "secid." . $secid;
	
	// if the secid file exists -> download!
	if(file_exists($secfile)) {
		$tmpname = $tmpdir . DIRECTORY_SEPARATOR . basename($tempname);
		
		// Check if the file still exists
		if (is_file($tmpname)) {
			// Set the headers
			header("Pragma: public");
			header("Expires: 0"); // set expiration time
			header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
			header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
			header("Content-Transfer-Encoding: binary");
			header("Content-Type: " . Helper::get_mime($tmpname));
			header("Content-Length: " . filesize($tmpname));
			
			// Open the file and print it
			$file = fopen($tmpname, "r");
			fpassthru($file);
			fclose($file);
		}
	}
}

// directly execute the function because this function is only created to not clutter global namespace
downloadAttachment();

?>
