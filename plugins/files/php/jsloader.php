<?php
/**
 * This file handles the delivery of javascript files.
 *
 * If the config value PLUGIN_FILESBROWSER_ENABLE_UXMEDIA is set to true, the uxmediapack will also be delivered.
 * @see PLUGIN_FILESBROWSER_ENABLE_UXMEDIA
 */
 
header('Content-type: application/x-javascript');
require_once("../config.php");

$load_ux = PLUGIN_FILESBROWSER_ENABLE_UXMEDIA;
$debug = $_GET['debug'] == "true" ? "-debug" : "";

$content = "";

if($load_ux) {
	$content .= file_get_contents("../js/external/uxmediapak" . $debug . ".js");
}

$content .= file_get_contents("../js/files" . $debug . ".js");

echo $content;
?>
