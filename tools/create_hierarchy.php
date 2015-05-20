<?php

// Utility script for generating a large hierarchy
// Fill in the configuration 

// Logon information for the store to update
$username = "sisko";
$password = "starDS9";
$server = "http://localhost:236/zarafa";

// How many folders to create in the private store
// Below the Inbox there will be $private_level1_count
// number of folders. Each of those folders will get
// $private_level2_count subfolders in turn.
$private_level1_count = 25;
$private_level2_count = 25;

// How should the folders in the private store be named
$private_level1_name = "Private-1";
$private_level2_name = "Private-2";

// How many folders to create in the public store
// Below the Inbox there will be $public_level1_count
// number of folders. Each of those folders will get
// $public_level2_count subfolders in turn.
$public_level1_count = 5;
$public_level2_count = 25;

// How should the folders in the private store be named
$public_level1_name = "Public-1";
$public_level2_name = "Public-2";


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

// The mail function which is going to create the folders
function createFolder($parent, $name) {
	print($name . PHP_EOL);

	$new_folder = mapi_folder_createfolder($parent, $name);
	if ($new_folder) {
		mapi_setprops($new_folder, array(PR_CONTAINER_CLASS => "IPF.Note"));
	}

	return $new_folder;
}

// Start searching for the Private and Public store
$msgstorestable = mapi_getmsgstorestable($session);
$rows = mapi_table_queryallrows($msgstorestable, Array(PR_ENTRYID, PR_MDB_PROVIDER));
foreach ($rows as $row) {
	if ($row[PR_MDB_PROVIDER] == ZARAFA_SERVICE_GUID) {
		$private = $row[PR_ENTRYID];
	} else if ($row[PR_MDB_PROVIDER] == ZARAFA_STORE_PUBLIC_GUID) {
		$public = $row[PR_ENTRYID];
	}
}

// We have the private store, start creating the subfolders in the "Inbox"
$store = mapi_openmsgstore($session, $private);
$inbox = mapi_msgstore_getreceivefolder($store);

for ($i = 0; $i < $private_level1_count; $i++) {
	$sub1 = createFolder($inbox, "$private_level1_name-$i");

	for ($j = 0; $j < $private_level2_count; $j++) {
		$sub2 = createFolder($sub1, "$private_level2_name-$j");
	}
}

// We have the public store, start creating the subfolders in the "Public Folders"
$store = mapi_openmsgstore($session, $public);
$storeprops = mapi_getprops($store, array(PR_IPM_SUBTREE_ENTRYID));
$subtree = mapi_msgstore_openentry($store, $storeprops[PR_IPM_SUBTREE_ENTRYID]);
$table = mapi_folder_gethierarchytable($subtree, MAPI_DEFERRED_ERRORS);

$subfolders = mapi_table_queryallrows($table, Array(PR_ENTRYID, PR_DISPLAY_NAME));
foreach ($subfolders as $sub) {
	if ($sub[PR_DISPLAY_NAME] == "Public Folders") {
		$publicfolders = mapi_msgstore_openentry($store, $sub[PR_ENTRYID]);
		for ($i = 0; $i < $public_level1_count; $i++) {
			$sub1 = createFolder($publicfolders, "$public_level1_name-$i");

			for ($j = 0; $j < $public_level2_count; $j++) {
				$sub2 = createFolder($sub1, "$public_level2_name-$j");
			}
		}
	}
}

?>
