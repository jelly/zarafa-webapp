<?php

// Logon information for the store to update
$username = "loki";
$password = "loki";
$server = "http://localhost:236/zarafa";

$settings = array(
	'zarafa' => array(
		'v1' => array(
			'main' => array(
				'confirm_close_dialog' => false
			)
		)
	)
);

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
////////////////////////// END OF CONFIGURATION ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

include('mapi/mapi.util.php');
include('mapi/mapidefs.php');
include('mapi/mapitags.php');

$session = mapi_logon_zarafa($username, $password, $server);
if (!$session) {
	print('Failed to logon to server' . PHP_EOL);
	exit;
}

$msgstorestable = mapi_getmsgstorestable($session);
$rows = mapi_table_queryallrows($msgstorestable, Array(PR_ENTRYID, PR_MDB_PROVIDER));
foreach ($rows as $row) {
	if ($row[PR_MDB_PROVIDER] == ZARAFA_SERVICE_GUID) {
		$private = $row[PR_ENTRYID];
	}
}

$store = mapi_openmsgstore($session, $private);
$stream = mapi_openproperty($store, PR_EC_WEBACCESS_SETTINGS_JSON, IID_IStream, 0, MAPI_CREATE | MAPI_MODIFY);
$settings = json_encode($settings);
mapi_stream_setsize($stream, strlen($settings));
mapi_stream_write($stream, $settings);
mapi_stream_commit($stream);
mapi_savechanges($store);

?>
