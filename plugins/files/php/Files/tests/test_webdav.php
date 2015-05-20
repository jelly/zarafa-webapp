<?php

$time_start = microtime(true);

require_once('../webdav_backend.php');

$wdc = new webdav_client();
	
$wdc->set_server("webdav1.kundencontroller.de");
$wdc->set_ssl(true);
$wdc->set_selfsigned(true);
$wdc->set_base("/ftpbackup-euserv/webdav");
$wdc->set_debug(true);

$wdc->set_user("ftpbackup-euserv");
$wdc->set_pass("euservpw");

if (!$wdc->open()) {
	error_log("conn failed!");
}

$dir = $wdc->ls("/");
echo $dir . "<br/>";
echo "<br/>LS: <br/>";
foreach( $dir as $name => $other) {
	echo "$name " . $other["resourcetype"] . " " . $other["getcontentlength"] . " " . $other["getlastmodified"] ."<br />";
}

echo "<br/>MKCOL: <br/>";
$response = $wdc->mkcol("/testing");
echo $response;

echo "<br/>MKCOL: <br/>";
$response = $wdc->mkcol("/test ing2/");
echo $response;

echo "<br/>PUT: <br/>";
$response = $wdc->put("/testing/test.txt", "blablabvl1");
echo $response;

echo "<br/>PUT: <br/>";
$response = $wdc->put("/test ing2/test mit leer.txt", "blablabvl");
echo $response;

echo "<br/>LS: <br/>";
$dir = $wdc->ls("/testing/");
foreach( $dir as $name => $other) {
	echo "$name " . $other["resourcetype"] . " " . $other["getcontentlength"] . " " . $other["getlastmodified"] ."<br />";
}

echo "<br/>DELETE: <br/>";
$response = $wdc->delete("/testing/");
echo $response;

echo "<br/>MOVE: <br/>";
$response = $wdc->move("/test ing2/", "/testing3 with space/");
echo $response;

echo "<br/>LS: <br/>";
$dir = $wdc->ls("/");
foreach( $dir as $name => $other) {
	echo "$name " . $other["resourcetype"] . " " . $other["getcontentlength"] . " " . $other["getlastmodified"] ."<br />";
}

echo "<br/>PUT: <br/>";
$response = $wdc->put_file("/testput.php", "test_webdav.php");
echo $response;

echo "<br/>PUT: <br/>";
$response = $wdc->put_file("/testing3 with space/testput.php", "test_webdav.php");
echo $response;

echo "<br/>GET: <br/>";
$response = $wdc->get("/testput.php", $buffer);
echo $response. "<br/>";
//echo $buffer . "<br/>";

echo "<br/>GET: <br/>";
$response = $wdc->get("/testing3 with space/testput.php", $buffer);
echo $response. "<br/>";
//echo $buffer . "<br/>";

echo "<br/>COPY: <br/>";
$response = $wdc->copy_file("/testput.php", "/testput2.php", true);
echo $response;

echo "<br/>MOVE: <br/>";
$response = $wdc->move("/testput2.php", "/testput3.txt", true);
echo $response;

echo "<br/>DELETE: <br/>";
$response = $wdc->delete("/testput.php");
echo $response;

$time_end = microtime(true);
$time = $time_end - $time_start;
error_log("[WEBDAV TEST] done in $time seconds");
echo "<br><hr><h1>TEST DONE IN $time SECONDS!<br></h1>";
?>