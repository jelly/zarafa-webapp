<?php
require_once(__DIR__ . "/../../../server/util.php");

$limits = array(
	"upload_max_filesize" => getMaxUploadSize(),
	"post_max_size" => getMaxPostRequestSize()
);

echo json_encode($limits);
?>