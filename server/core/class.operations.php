<?php
	/**
	* General operations
	*
	* All mapi operations, like create, change and delete, are set in this class.
	* A module calls one of these methods.
	*
	* Note: All entryids in this class are binary
	*
	* @todo This class is bloated. It also returns data in various arbitrary formats
	* that other functions depend on, making lots of code almost completely unreadable.
	* @package core
	*/

	include_once("server/core/class.filter.php");
	include_once("mapi/class.recurrence.php");
	include_once("mapi/class.taskrecurrence.php");
	include_once("mapi/class.meetingrequest.php");
	include_once("mapi/class.taskrequest.php");
	include_once("mapi/class.freebusypublish.php");

	class Operations
	{
		function Operations()
		{
		}

		/**
		* Gets the hierarchy list of all required stores.
		*
		* getHierarchyList builds an entire hierarchy list of all folders that should be shown in various places. Most importantly,
		* it generates the list of folders to be show in the hierarchylistmodule (left-hand folder browser) on the client.
		*
		* It is also used to generate smaller hierarchy lists, for example for the 'create folder' dialog.
		*
		* The returned array is a flat array of folders, so if the caller wishes to build a tree, it is up to the caller to correlate
		* the entryids and the parent_entryids of all the folders to build the tree.
		*
		* The return value is an associated array with the following keys:
		* - store: array of stores
		*
		* Each store contains:
		* - array("store_entryid" => entryid of store, name => name of store, subtree => entryid of viewable root, type => default|public|other, folder_type => "all")
		* - folder: array of folders with each an array of properties (see Operations::setFolder() for properties)
		*
		* @param array $properties MAPI property mapping for folders
		* @param int $type Which stores to fetch (HIERARCHY_GET_ALL | HIERARCHY_GET_DEFAULT | HIERARCHY_GET_ONE)
		* @param object $store Only when $type == HIERARCHY_GET_ONE
		* @param array $storeOptions Only whe $type == HIERARCHY_GET_ONE, this overrides the  loading options which is normally
		* obtained frrom the settings for loading the store (e.g. only load calendar).
		* @param String $username The username
		*
		* @return array Return structure
		*/
		function getHierarchyList($properties, $type = HIERARCHY_GET_ALL, $store = null, $storeOptions = null, $username = null)
		{
			switch($type)
			{
				case HIERARCHY_GET_ALL:
					$storelist = $GLOBALS["mapisession"]->getAllMessageStores();
					break;

				case HIERARCHY_GET_DEFAULT:
					$storelist = array($GLOBALS["mapisession"]->getDefaultMessageStore());
					break;

				case HIERARCHY_GET_ONE:
					// Get single store and it's archive store aswell
					$storelist = $GLOBALS["mapisession"]->getSingleMessageStores($store, $storeOptions, $username);
					break;
			}

			$data = array();
			$data["item"] = array();

			// Get the other store options
			if (isset($storeOptions)) {
				$otherUsers = $storeOptions;
			} else {
				$otherUsers = $GLOBALS["mapisession"]->retrieveOtherUsersFromSettings();
			}

			foreach($storelist as $store)
			{
				$msgstore_props = mapi_getprops($store, array(PR_ENTRYID, PR_DISPLAY_NAME, PR_IPM_SUBTREE_ENTRYID, PR_IPM_OUTBOX_ENTRYID, PR_IPM_SENTMAIL_ENTRYID, PR_IPM_WASTEBASKET_ENTRYID, PR_MDB_PROVIDER, PR_IPM_PUBLIC_FOLDERS_ENTRYID, PR_IPM_FAVORITES_ENTRYID, PR_OBJECT_TYPE, PR_STORE_SUPPORT_MASK, PR_MAILBOX_OWNER_ENTRYID, PR_MAILBOX_OWNER_NAME, PR_USER_ENTRYID, PR_USER_NAME, PR_QUOTA_WARNING_THRESHOLD, PR_QUOTA_SEND_THRESHOLD, PR_QUOTA_RECEIVE_THRESHOLD, PR_MESSAGE_SIZE_EXTENDED, PR_MAPPING_SIGNATURE));

				$inboxProps = array();
				$storeType = $msgstore_props[PR_MDB_PROVIDER];

				/**
				 * storetype is public and if public folder is disabled
				 * then continue in loop for next store.
				 */
				if($storeType == ZARAFA_STORE_PUBLIC_GUID && ENABLE_PUBLIC_FOLDERS == false)
					continue;

				// Obtain the real username for the store when dealing with a shared store
				if($storeType == ZARAFA_STORE_DELEGATE_GUID){
					$storeUserName = $GLOBALS["mapisession"]->getUserNameOfStore($msgstore_props[PR_ENTRYID]);
				}else{
					$storeUserName = $msgstore_props[PR_USER_NAME];
				}

				$storeData = array(
					"store_entryid" => bin2hex($msgstore_props[PR_ENTRYID]),
					"props" => array(
						"display_name" => $msgstore_props[PR_DISPLAY_NAME],
						"subtree_entryid" => bin2hex($msgstore_props[PR_IPM_SUBTREE_ENTRYID]),
						"mdb_provider" => bin2hex($msgstore_props[PR_MDB_PROVIDER]),
						"mapping_signature" => bin2hex($msgstore_props[PR_MAPPING_SIGNATURE]),
						"object_type" => $msgstore_props[PR_OBJECT_TYPE],
						"store_support_mask" => $msgstore_props[PR_STORE_SUPPORT_MASK],
						"user_name" => $storeUserName,
						"user_entryid" => bin2hex($msgstore_props[PR_USER_ENTRYID]),
						"store_size" => round($msgstore_props[PR_MESSAGE_SIZE_EXTENDED]/1024),
						"quota_warning" => isset($msgstore_props[PR_QUOTA_WARNING_THRESHOLD]) ? $msgstore_props[PR_QUOTA_WARNING_THRESHOLD] : 0,
						"quota_soft" => isset($msgstore_props[PR_QUOTA_SEND_THRESHOLD]) ? $msgstore_props[PR_QUOTA_SEND_THRESHOLD] : 0,
						"quota_hard" => isset($msgstore_props[PR_QUOTA_RECEIVE_THRESHOLD]) ? $msgstore_props[PR_QUOTA_RECEIVE_THRESHOLD] : 0
					)
				);

				// these properties doesn't exist in public store
				if(isset($msgstore_props[PR_MAILBOX_OWNER_ENTRYID]) && isset($msgstore_props[PR_MAILBOX_OWNER_NAME])) {
					$storeData["props"]["mailbox_owner_entryid"] = bin2hex($msgstore_props[PR_MAILBOX_OWNER_ENTRYID]);
					$storeData["props"]["mailbox_owner_name"] = $msgstore_props[PR_MAILBOX_OWNER_NAME];
				}

				// public store doesn't have inbox
				try {
					$inbox = mapi_msgstore_getreceivefolder($store);
					$inboxProps = mapi_getprops($inbox, array(PR_ENTRYID));
				} catch (MAPIException $e) {
					// don't propogate this error to parent handlers, if store doesn't support it
					if($e->getCode() === MAPI_E_NO_SUPPORT) {
						$e->setHandled();
					}
				}

				$root = mapi_msgstore_openentry($store, null);
				$rootProps = mapi_getprops($root, array(PR_IPM_APPOINTMENT_ENTRYID, PR_IPM_CONTACT_ENTRYID, PR_IPM_DRAFTS_ENTRYID, PR_IPM_JOURNAL_ENTRYID, PR_IPM_NOTE_ENTRYID, PR_IPM_TASK_ENTRYID, PR_ADDITIONAL_REN_ENTRYIDS));

				$additional_ren_entryids = array();
				if(isset($rootProps[PR_ADDITIONAL_REN_ENTRYIDS])) {
					$additional_ren_entryids = $rootProps[PR_ADDITIONAL_REN_ENTRYIDS];
				}

				$defaultfolders = array(
						"default_folder_inbox"			=>	array("inbox"=>PR_ENTRYID),
						"default_folder_outbox"			=>	array("store"=>PR_IPM_OUTBOX_ENTRYID),
						"default_folder_sent"			=>	array("store"=>PR_IPM_SENTMAIL_ENTRYID),
						"default_folder_wastebasket"	=>	array("store"=>PR_IPM_WASTEBASKET_ENTRYID),
						"default_folder_favorites"		=>	array("store"=>PR_IPM_FAVORITES_ENTRYID),
						"default_folder_publicfolders"	=>	array("store"=>PR_IPM_PUBLIC_FOLDERS_ENTRYID),
						"default_folder_calendar"		=>	array("root" =>PR_IPM_APPOINTMENT_ENTRYID),
						"default_folder_contact"		=>	array("root" =>PR_IPM_CONTACT_ENTRYID),
						"default_folder_drafts"			=>	array("root" =>PR_IPM_DRAFTS_ENTRYID),
						"default_folder_journal"		=>	array("root" =>PR_IPM_JOURNAL_ENTRYID),
						"default_folder_note"			=>	array("root" =>PR_IPM_NOTE_ENTRYID),
						"default_folder_task"			=>	array("root" =>PR_IPM_TASK_ENTRYID),
						"default_folder_junk"			=>	array("additional" =>4),
						"default_folder_syncissues"		=>	array("additional" =>1),
						"default_folder_conflicts"		=>	array("additional" =>0),
						"default_folder_localfailures"	=>	array("additional" =>2),
						"default_folder_serverfailures"	=>	array("additional" =>3),
				);

				foreach($defaultfolders as $key=>$prop){
					$tag = reset($prop);
					$from = key($prop);
					switch($from){
						case "inbox":
							if(isset($inboxProps[$tag])) {
								$storeData["props"][$key] = bin2hex($inboxProps[$tag]);
							}
							break;
						case "store":
							if(isset($msgstore_props[$tag])) {
								$storeData["props"][$key] = bin2hex($msgstore_props[$tag]);
							}
							break;
						case "root":
							if(isset($rootProps[$tag])) {
								$storeData["props"][$key] = bin2hex($rootProps[$tag]);
							}
							break;
						case "additional":
							if(isset($additional_ren_entryids[$tag])) {
								$storeData["props"][$key] = bin2hex($additional_ren_entryids[$tag]);
							}
							break;
					}
				}

				$storeData["folders"] = array( "item" => array() );

				if (isset($msgstore_props[PR_IPM_SUBTREE_ENTRYID])) {
					$subtreeFolderEntryID = $msgstore_props[PR_IPM_SUBTREE_ENTRYID];

					$openWholeStore = true;
					if($storeType == ZARAFA_STORE_DELEGATE_GUID) {
						$username = strtolower($storeData["props"]["user_name"]);
						$sharedFolders = array();

						// Check whether we should open the whole store or just single folders
						if(is_array($otherUsers)) {
							if(isset($otherUsers[ $username ])){
								$sharedFolders = $otherUsers[ $username ];
								if(!isset($otherUsers[ $username ]['all'])){
									$openWholeStore = false;
								}
							}
						}

						// Update the store properties when this function was called to
						// only open a particular shared store.
						if (is_array($storeOptions)) {
							// Update the store properties to mark previously opened
							$prevSharedFolders = $GLOBALS["settings"]->get("zarafa/v1/contexts/hierarchy/shared_stores/" . $username ,null);
							if (!empty($prevSharedFolders)) {
								foreach ($prevSharedFolders as $type => $prevSharedFolder) {
									// Update the store properties to refer to the shared folder,
									// note that we don't care if we have access to the folder or not.
									$type = $prevSharedFolder["folder_type"];
									if ($type == "all") {
										$propname = "subtree_entryid";
									} else {
										$propname = "default_folder_" . $prevSharedFolder["folder_type"];
									}

									if (isset($storeData["props"][$propname])) {
										$folderEntryID = hex2bin($storeData["props"][$propname]);
										$storeData["props"]["shared_folder_" . $prevSharedFolder["folder_type"]] = bin2hex($folderEntryID);
									}
								}
							}
						}
					}

					// Get the IPMSUBTREE object
					$storeAccess = true;
					try {
						$subtreeFolder = mapi_msgstore_openentry($store, $subtreeFolderEntryID);
						// Add root folder
						$subtree = $this->setFolder(mapi_getprops($subtreeFolder, $properties));
						if (!$openWholeStore) {
							$subtree['props']['access'] = 0;
						}
						array_push($storeData["folders"]["item"], $subtree);
					} catch (MAPIException $e) {
						if($openWholeStore) {
							/*
							 * if we are going to open whole store and we are not able to open the subtree folder
							 * then it should be considered as an error
							 * but if we are only opening single folder then it could be possible that we don't have
							 * permission to open subtree folder so add a dummy subtree folder in the response and don't consider this as an error
							 */
							$storeAccess = false;

							// Add properties to the store response to indicate to the client
							// that the store could not be loaded.
							$this->invalidateResponseStore($storeData, 'all', $subtreeFolderEntryID);
						}else{
							// Add properties to the store response to add a placeholder IPMSubtree.
							$this->getDummyIPMSubtreeFolder($storeData, $subtreeFolderEntryID);
						}

						// We've handled the event
						$e->setHandled();
					}

					if($storeAccess){
						// Open the whole store and be done with it
						if($openWholeStore){
							try {
								if ($storeType != ZARAFA_STORE_PUBLIC_GUID) {
									// Update the store properties to refer to the shared folder,
									// note that we don't care if we have access to the folder or not.
									$storeData["props"]["shared_folder_all"] = bin2hex($subtreeFolderEntryID);
									$this->getSubFolders($subtreeFolder, $store, $properties, $storeData);
								} else {
									// Recursively add all subfolders
									$this->getSubFoldersPublic($subtreeFolder, $store, $properties, $storeData);
								}
							} catch (MAPIException $e) {
								// Add properties to the store response to indicate to the client
								// that the store could not be loaded.
								$this->invalidateResponseStore($storeData, 'all', $subtreeFolderEntryID);

								// We've handled the event
								$e->setHandled();
							}

						// Open single folders under the store object
						}else{
							foreach($sharedFolders as $type => $sharedFolder){
								$openSubFolders = ($sharedFolder["show_subfolders"] == true);

								// See if the folders exists by checking if it is in the default folders entryid list
								$store_access = true;
								if (!isset($storeData["props"]["default_folder_" . $sharedFolder["folder_type"]])){
									// Create a fake folder entryid which must be used for referencing this folder
									$folderEntryID = "default_folder_" . $sharedFolder["folder_type"];

									// Add properties to the store response to indicate to the client
									// that the store could not be loaded.
									$this->invalidateResponseStore($storeData, $type, $folderEntryID);

									// Update the store properties to refer to the shared folder,
									// note that we don't care if we have access to the folder or not.
									$storeData["props"]["shared_folder_" . $sharedFolder["folder_type"]] = bin2hex($folderEntryID);

									// Indicate that we don't have access to the store,
									// so no more attempts to read properties or open entries.
									$store_access = false;

								// If you access according to the above check, go ahead and retrieve the MAPIFolder object
								}else{
									$folderEntryID = hex2bin($storeData["props"]["default_folder_" . $sharedFolder["folder_type"]]);

									// Update the store properties to refer to the shared folder,
									// note that we don't care if we have access to the folder or not.
									$storeData["props"]["shared_folder_" . $sharedFolder["folder_type"]] = bin2hex($folderEntryID);

									try {
										// load folder props
										$folder = mapi_msgstore_openentry($store, $folderEntryID);
									} catch (MAPIException $e) {
										// Add properties to the store response to indicate to the client
										// that the store could not be loaded.
										$this->invalidateResponseStore($storeData, $type, $folderEntryID);

										// Indicate that we don't have access to the store,
										// so no more attempts to read properties or open entries.
										$store_access = false;

										// We've handled the event
										$e->setHandled();
									}
								}

								// Check if a error handler already inserted a error folder,
								// or if we can insert the real folders here.
								if ($store_access === true) {
									// check if we need subfolders or not
									if($openSubFolders === true) {
										// add folder data (with all subfolders recursively)
										// get parent folder's properties
										$folderProps = mapi_getprops($folder, $properties);
										$tempFolderProps = $this->setFolder($folderProps);

										array_push($storeData["folders"]["item"], $tempFolderProps);

										// get subfolders
										if($tempFolderProps["props"]["has_subfolder"] != false) {
											$subfoldersData = array();
											$subfoldersData["folders"]["item"] = array();
											$this->getSubFolders($folder, $store, $properties, $subfoldersData);

											$storeData["folders"]["item"] = array_merge($storeData["folders"]["item"], $subfoldersData["folders"]["item"]);
										}
									} else {
										$folderProps = mapi_getprops($folder, $properties);
										$tempFolderProps = $this->setFolder($folderProps);
										// We don't load subfolders, this means the user isn't allowed
										// to create subfolders, as they should normally be hidden immediately.
										$tempFolderProps["props"]["access"] = ($tempFolderProps["props"]["access"] & ~MAPI_ACCESS_CREATE_HIERARCHY);
										// We don't load subfolders, so force the 'has_subfolder' property
										// to be false, so the UI will not consider loading subfolders.
										$tempFolderProps["props"]["has_subfolder"] = false;
										array_push($storeData["folders"]["item"], $tempFolderProps);
									}
								}

							}

						}
					}
					array_push($data["item"], $storeData);
				}
			}

			return $data;
		}

		/**
		 * Helper function to get the subfolders of a Personal Store
		 *
		 * @access private
		 * @param object $folder Mapi Folder Object.
		 * @param object $store Message Store Object
		 * @param array $properties MAPI property mappings for folders
		 * @param array $storeData Reference to an array. The folder properties are added to this array.
		 */
		function getSubFolders($folder, $store, $properties, &$storeData, $parentEntryid = false)
		{
			/**
			 * remove hidden folders, folders with PR_ATTR_HIDDEN property set
			 * should not be shown to the client
			 */
			$restriction =	Array(RES_OR, Array(
				Array(RES_PROPERTY,
					Array(
						RELOP => RELOP_EQ,
						ULPROPTAG => PR_ATTR_HIDDEN,
						VALUE => Array( PR_ATTR_HIDDEN => false )
					)
				),
				Array(RES_NOT,
					Array(
						Array(RES_EXIST,
							Array(
								ULPROPTAG => PR_ATTR_HIDDEN
							)
						)
					)
				)
			));

/**
 * FIXME: This code is disabled because of ZCP-10423 which says that using CONVENIENT_DEPTH is much slower
 * then walking recursively through the hierarchy.
 *
			$hierarchyTable = mapi_folder_gethierarchytable($folder, CONVENIENT_DEPTH | MAPI_DEFERRED_ERRORS);
			mapi_table_restrict($hierarchyTable, $restriction, TBL_BATCH);

			// Also request PR_DEPTH
			$columns = array_merge($properties, array(PR_DEPTH));

			// Check if mapi_table_setcolumns exists (ZCP-7.1.1 and above), if so
			// then call mapi_table_setcolumns now, and set $columns to null.
			if (function_exists('mapi_table_setcolumns')) {
				mapi_table_setcolumns($hierarchyTable, $columns);
				$columns = null;
			}

			// Load the hierarchy in small batches
			$batchcount = 100;
			do {
				$rows = mapi_table_queryrows($hierarchyTable, $columns, 0, $batchcount);

				foreach($rows as $subfolder) {
					if ($parentEntryid !== false && isset($subfolder[PR_DEPTH]) && $subfolder[PR_DEPTH] === 1) {
						$subfolder[PR_PARENT_ENTRYID] = $parentEntryid;
					}
					array_push($storeData["folders"]["item"], $this->setFolder($subfolder));
				}

			// When the server returned a different number of rows then was requested,
			// we have reached the end of the table and we should exit the loop.
			} while (count($rows) === $batchcount);
 *
 * As temporary solution we will be using the following code which recursively walks through the hierarchy.
 */

			$expand = Array(
				Array(
					'folder' => $folder,
					'props' => mapi_getprops($folder, Array(PR_ENTRYID, PR_SUBFOLDERS))
				)
			);

			// Start looping through the $expand array, during each loop we grab the first item in
			// the array and obtain the hierarchy table for that particular folder. If one of those
			// subfolders has subfolders of its own, it will be appended to $expand again to ensure
			// it will be expanded later.
			while (!empty($expand)) {
				$item = array_shift($expand);
				$columns = $properties;

				$hierarchyTable = mapi_folder_gethierarchytable($item['folder'], MAPI_DEFERRED_ERRORS);
				mapi_table_restrict($hierarchyTable, $restriction, TBL_BATCH);

				// Check if mapi_table_setcolumns exists (ZCP-7.1.1 and above), if so
				// then call mapi_table_setcolumns now, and set $columns to null.
				if (function_exists('mapi_table_setcolumns')) {
					mapi_table_setcolumns($hierarchyTable, $columns);
					$columns = null;
				}

				// Load the hierarchy in small batches
				$batchcount = 100;
				do {
					$rows = mapi_table_queryrows($hierarchyTable, $columns, 0, $batchcount);

					foreach($rows as $subfolder) {

						// If the subfolders has subfolders of its own, append the folder
						// to the $expand array, so it can be expanded in the next loop.
						if ($subfolder[PR_SUBFOLDERS]) {
							$folderObject = mapi_msgstore_openentry($store, $subfolder[PR_ENTRYID]);
							array_push($expand, array('folder' => $folderObject, 'props' => $subfolder));
						}

						if ($parentEntryid) {
							$subfolder[PR_PARENT_ENTRYID] = $parentEntryid;
						}

						// Add the folder to the return list.
						array_push($storeData["folders"]["item"], $this->setFolder($subfolder));
					}

				// When the server returned a different number of rows then was requested,
				// we have reached the end of the table and we should exit the loop.
				} while (count($rows) === $batchcount);

				// Reset $parentEntryid, because in the next loop we won't be needing it.
				$parentEntryid = false;
			}
		}

		/**
		 * Helper function to get the subfolders of a Public Store
		 *
		 * @access private
		 * @param object $folder Mapi Folder Object.
		 * @param object $store Message Store Object
		 * @param array $properties MAPI property mappings for folders
		 * @param array $storeData Reference to an array. The folder properties are added to this array.
		 */
		function getSubFoldersPublic($folder, $store, $properties, &$storeData)
		{
			$expand = Array(
				Array(
					'folder' => $folder,
					'props' => mapi_getprops($folder, Array(PR_ENTRYID, PR_SUBFOLDERS))
				)
			);

			/**
			 * remove hidden folders, folders with PR_ATTR_HIDDEN property set
			 * should not be shown to the client
			 */
			$restriction =	Array(RES_OR, Array(
				Array(RES_PROPERTY,
					Array(
						RELOP => RELOP_EQ,
						ULPROPTAG => PR_ATTR_HIDDEN,
						VALUE => Array( PR_ATTR_HIDDEN => false )
					)
				),
				Array(RES_NOT,
					Array(
						Array(RES_EXIST,
							Array(
								ULPROPTAG => PR_ATTR_HIDDEN
							)
						)
					)
				)
			));

			// CONVENIENT_DEPTH doesn't work on the IPM_SUBTREE, hence we will be recursivly
			// walking through the hierarchy. However, we have some special folders like the
			// "Favorites" and "Public Folders" from where we can switch to using
			// CONVENIENT_DEPTH. Obtain these special cases here.
			$specialEntryids = mapi_getprops($store, array(
				PR_IPM_FAVORITES_ENTRYID,
				PR_IPM_PUBLIC_FOLDERS_ENTRYID
			));

			// Start looping through the $expand array, during each loop we grab the first item in
			// the array and obtain the hierarchy table for that particular folder. If one of those
			// subfolders has subfolders of its own, it will be appended to $expand again to ensure
			// it will be expanded later.
			while (!empty($expand)) {
				$item = array_shift($expand);
				$columns = $properties;

				$hierarchyTable = mapi_folder_gethierarchytable($item['folder'], MAPI_DEFERRED_ERRORS);
				mapi_table_restrict($hierarchyTable, $restriction, TBL_BATCH);

				// Check if mapi_table_setcolumns exists (ZCP-7.1.1 and above), if so
				// then call mapi_table_setcolumns now, and set $columns to null.
				if (function_exists('mapi_table_setcolumns')) {
					mapi_table_setcolumns($hierarchyTable, $columns);
					$columns = null;
				}

				// Load the hierarchy in small batches
				$batchcount = 100;
				do {
					$rows = mapi_table_queryrows($hierarchyTable, $columns, 0, $batchcount);

					foreach($rows as $subfolder) {
						$specialFolder = false;

						// Check if this folder is special...
						if (!empty($specialEntryids)) {
							foreach ($specialEntryids as $key => $value) {
								// No need to do compareEntryId(), the special folders have static
								// entryids, and can be compared using ===.
								if (bin2hex($subfolder[PR_ENTRYID]) === bin2hex($value)) {
									// This is a special folder, obtain the $subfolder properties
									// using mapi_getprops() because of bug ZCP-10426 which says that
									// the wrong value for PR_ACCESS is returned in the hierarchytable.
									$specialFolder = mapi_msgstore_openentry($store, $subfolder[PR_ENTRYID]);
									$subfolder = mapi_getprops($specialFolder, $properties);

									// We found the folder, no need to loop over it next time.
									unset($specialEntryids[$key]);
									break;
								}
							}
						}

						// If the subfolders has subfolders of its own, append the folder
						// to the $expand array, so it can be expanded in the next loop.
						if ($subfolder[PR_SUBFOLDERS]) {
							if ($specialFolder) {
								// Special folders can be redirected again to getSubFolders(),
								// we need to pass the PR_ENTRYID of the folder in order to
								// fix the PR_PARENT_ENTRYID of the first layer of subfolders.
								$this->getSubFolders($specialFolder, $store, $properties, $storeData, $subfolder[PR_ENTRYID]);
							} else {
								$folderObject = mapi_msgstore_openentry($store, $subfolder[PR_ENTRYID]);
								array_push($expand, array('folder' => $folderObject, 'props' => $subfolder));
							}
						}

						// Subfolders in the Public store have the issue that the PR_PARENT_ENTRYID
						// doesn't need to be the same as the real parent. So fix that here...
						$subfolder[PR_PARENT_ENTRYID] = $item['props'][PR_ENTRYID];

						// Add the folder to the return list.
						array_push($storeData["folders"]["item"], $this->setFolder($subfolder));
					}

				// When the server returned a different number of rows then was requested,
				// we have reached the end of the table and we should exit the loop.
				} while (count($rows) === $batchcount);
			}
		}

		/**
		 * Convert MAPI properties into useful XML properties for a folder
		 *
		 * @access private
		 * @param array $folderProps Properties of a folder
		 * @return array List of properties of a folder
		 * @todo The name of this function is misleading because it doesn't 'set' anything, it just reads some properties.
		 */
		function setFolder($folderProps)
		{
			$props = array(
				// Identification properties
				"entryid" => bin2hex($folderProps[PR_ENTRYID]),
				"parent_entryid" => bin2hex($folderProps[PR_PARENT_ENTRYID]),
				"store_entryid" => bin2hex($folderProps[PR_STORE_ENTRYID]),
				// Scalar properties
				"props" => array(
					"display_name" => $folderProps[PR_DISPLAY_NAME],
					"object_type" => isset($folderProps[PR_OBJECT_TYPE]) ? $folderProps[PR_OBJECT_TYPE] : MAPI_FOLDER, // FIXME: Why isn't this always set?
					"content_count" => isset($folderProps[PR_CONTENT_COUNT]) ? $folderProps[PR_CONTENT_COUNT] : 0,
					"content_unread" => isset($folderProps[PR_CONTENT_UNREAD]) ? $folderProps[PR_CONTENT_UNREAD] : 0,
					"has_subfolder" => isset($folderProps[PR_SUBFOLDERS])? $folderProps[PR_SUBFOLDERS] : false,
					"container_class" => isset($folderProps[PR_CONTAINER_CLASS]) ? $folderProps[PR_CONTAINER_CLASS] : "IPF.Note",
					"access" => $folderProps[PR_ACCESS],
					"rights" => isset($folderProps[PR_RIGHTS]) ? $folderProps[PR_RIGHTS] : ecRightsNone
				)
			);

			$this->setExtendedFolderFlags($folderProps, $props);

			return $props;
		}

		/**
		 * Fetches extended flags for folder. If PR_EXTENDED_FLAGS is not set then we assume that client
		 * should handle which property to display
		 * @access private
		 * @param array $folderProps Properties of a folder
		 * @param array $props properties in which flags should be set
		 */
		function setExtendedFolderFlags($folderProps, &$props)
		{
			if (isset($folderProps[PR_EXTENDED_FOLDER_FLAGS])) {
				$flags = unpack("Cid/Cconst/Cflags", $folderProps[PR_EXTENDED_FOLDER_FLAGS]);

				// ID property is '1' this means 'Data' property contains extended flags
				if ($flags["id"] == 1)
					$props["props"]["extended_flags"] = $flags["flags"];
			}
		}

		/**
		 * Used to update the storeData with a folder and properties that will
		 * inform the user that the store could not be opened.
		 * @access private
		 * @param array &$storeData The store data which will be updated
		 * @param string $folderType The foldertype which was attempted to be loaded
		 * @param array $folderEntryID The entryid of the which was attempted to be opened
		 */
		function invalidateResponseStore(&$storeData, $folderType, $folderEntryID)
		{
			$folderName = "Folder";
			$containerClass = "IPF.Note";

			switch ($folderType) {
				case  "all":
					$folderName = "IPM_SUBTREE";
					$containerClass = "IPF.Note";
					break;
				case "calendar":
					$folderName = _("Calendar");
					$containerClass = "IPF.Appointment";
					break;
				case "contact":
					$folderName = _("Contacts");
					$containerClass = "IPF.Contact";
					break;
				case "inbox":
					$folderName = _("Inbox");
					$containerClass = "IPF.Note";
					break;
				case "note":
					$folderName = _("Notes");
					$containerClass = "IPF.StickyNote";
					break;
				case "task":
					$folderName = _("Tasks");
					$containerClass = "IPF.Task";
					break;
			}

			// Insert a fake folder which will be shown to the user
			// to acknowledge that he has a shared store, but also
			// to indicate that he can't open it.
			$tempFolderProps = $this->setFolder(array(
				PR_ENTRYID => $folderEntryID,
				PR_PARENT_ENTRYID => hex2bin($storeData["props"]["subtree_entryid"]),
				PR_STORE_ENTRYID => hex2bin($storeData["store_entryid"]),
				PR_DISPLAY_NAME => $folderName,
				PR_OBJECT_TYPE => MAPI_FOLDER,
				PR_SUBFOLDERS => false,
				PR_CONTAINER_CLASS => $containerClass,
				PR_ACCESS => 0
			));

			// Mark the folder as unavailable, this allows the client to properly
			// indicate to the user that this is a fake entry.
			$tempFolderProps['props']['is_unavailable'] = true;

			array_push($storeData["folders"]["item"], $tempFolderProps);

			/* TRANSLATORS: This indicates that the opened folder belongs to a particular user,
			 * for example: 'Calendar of Holiday', in this case %1$s is 'Calendar' (the foldername)
			 * and %2$s is 'Holiday' (the username).
			 */
			$storeData["props"]["display_name"] = ($folderType === "all") ? $storeData["props"]["display_name"] : sprintf(_('%1$s of %2$s'), $folderName, $storeData["props"]["mailbox_owner_name"]);
			$storeData["props"]["subtree_entryid"] = $tempFolderProps["parent_entryid"];
			$storeData["props"]["folder_type"] = $folderType;
		}

		/**
		 * Used to update the storeData with a folder and properties that will function as a
		 * placeholder for the IPMSubtree that could not be opened.
		 * @access private
		 * @param array &$storeData The store data which will be updated
		 * @param array $folderEntryID The entryid of the which was attempted to be opened
		 */
		function getDummyIPMSubtreeFolder(&$storeData, $folderEntryID)
		{
			// Insert a fake folder which will be shown to the user
			// to acknowledge that he has a shared store.
			$tempFolderProps = $this->setFolder(array(
				PR_ENTRYID => $folderEntryID,
				PR_PARENT_ENTRYID => hex2bin($storeData["props"]["subtree_entryid"]),
				PR_STORE_ENTRYID => hex2bin($storeData["store_entryid"]),
				PR_DISPLAY_NAME => "IPM_SUBTREE",
				PR_OBJECT_TYPE => MAPI_FOLDER,
				PR_SUBFOLDERS => true,
				PR_CONTAINER_CLASS => "IPF.Note",
				PR_ACCESS => 0
			));

			array_push($storeData["folders"]["item"], $tempFolderProps);
			$storeData["props"]["subtree_entryid"] = $tempFolderProps["parent_entryid"];
		}

		/**
		 * Create a MAPI folder
		 *
		 * This function simply creates a MAPI folder at a specific location with a specific folder
		 * type.
		 *
		 * @param object $store MAPI Message Store Object in which the folder lives
		 * @param string $parententryid The parent entryid in which the new folder should be created
		 * @param string $name The name of the new folder
		 * @param string $type The type of the folder (PR_CONTAINER_CLASS, so value should be 'IPM.Appointment', etc)
		 * @param array $folderProps reference to an array which will be filled with PR_ENTRYID and PR_STORE_ENTRYID of new folder
		 * @return boolean true if action succeeded, false if not
		 */
		function createFolder($store, $parententryid, $name, $type, &$folderProps)
		{
			$result = false;
			$folder = mapi_msgstore_openentry($store, $parententryid);

			if($folder) {
				/**
				 * @TODO: If parent folder has any sub-folder with the same name than this will return
				 * MAPI_E_COLLISION error, so show this error to client and don't close the dialog.
				 */
				$new_folder = mapi_folder_createfolder($folder, $name);

				if($new_folder) {
					mapi_setprops($new_folder, array(PR_CONTAINER_CLASS => $type));
					$result = true;

					$folderProps = mapi_getprops($new_folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
				}
			}

			return $result;
		}

		/**
		 * Rename a folder
		 *
		 * This function renames the specified folder. However, a conflict situation can arise
		 * if the specified folder name already exists. In this case, the folder name is postfixed with
		 * an ever-higher integer to create a unique folder name.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid The entryid of the folder to rename
		 * @param string $name The new name of the folder
		 * @param array $folderProps reference to an array which will be filled with PR_ENTRYID and PR_STORE_ENTRYID
		 * @return boolean true if action succeeded, false if not
		 */
		function renameFolder($store, $entryid, $name, &$folderProps)
		{
			$result = false;
			$folder = mapi_msgstore_openentry($store, $entryid);
			if($folder && !$this->isSpecialFolder($store, $entryid)) {
				$folderProps = mapi_getprops($folder, array(PR_ENTRYID, PR_STORE_ENTRYID, PR_DISPLAY_NAME));
				/*
				 * If parent folder has any sub-folder with the same name than this will return
				 * MAPI_E_COLLISION error while renaming folder, so show this error to client,
				 * and revert changes in view.
				 */
				try {
					mapi_setprops($folder, array(PR_DISPLAY_NAME => $name));
					mapi_savechanges($folder);
					$result = true;
				} catch (MAPIException $e) {
					if($e->getCode() == MAPI_E_COLLISION) {
						/*
						 * revert folder name to original one
						 * There is a bug in php-mapi that updates folder name in hierarchy table with null value
						 * so we need to revert those change by again setting the old folder name
						 * check https://jira.zarafa.com/browse/ZCP-11586
						 */
						mapi_setprops($folder, array(PR_DISPLAY_NAME => $folderProps[PR_DISPLAY_NAME]));
						mapi_savechanges($folder);
					}

					// rethrow exception so we will send error to client
					throw $e;
				}
			}

			return $result;
		}

		/**
		 * Check if a folder is 'special'
		 *
		 * All default MAPI folders such as 'inbox', 'outbox', etc have special permissions; you can not rename them for example. This
		 * function returns TRUE if the specified folder is 'special'.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid The entryid of the folder
		 * @return boolean true if folder is a special folder, false if not
		 */
		function isSpecialFolder($store, $entryid)
		{
			$msgstore_props = mapi_getprops($store, array(PR_MDB_PROVIDER));

			// "special" folders don't exists in public store
			if ($msgstore_props[PR_MDB_PROVIDER] == ZARAFA_STORE_PUBLIC_GUID) {
				return false;
			}

			// Check for the Special folders which are provided on the store
			$msgstore_props = mapi_getprops($store, array(
				PR_IPM_SUBTREE_ENTRYID,
				PR_IPM_OUTBOX_ENTRYID,
				PR_IPM_SENTMAIL_ENTRYID,
				PR_IPM_WASTEBASKET_ENTRYID,
				PR_IPM_PUBLIC_FOLDERS_ENTRYID,
				PR_IPM_FAVORITES_ENTRYID
			));

			if (array_search($entryid, $msgstore_props)) {
				return true;
			}

			// Check for the Special folders which are provided on the root folder
			$root = mapi_msgstore_openentry($store, null);
			$rootProps = mapi_getprops($root, array(
				PR_IPM_APPOINTMENT_ENTRYID,
				PR_IPM_CONTACT_ENTRYID,
				PR_IPM_DRAFTS_ENTRYID,
				PR_IPM_JOURNAL_ENTRYID,
				PR_IPM_NOTE_ENTRYID,
				PR_IPM_TASK_ENTRYID,
				PR_ADDITIONAL_REN_ENTRYIDS
			));

			if (array_search($entryid, $rootProps)) {
				return true;
			}

			// The PR_ADDITIONAL_REN_ENTRYIDS are a bit special
			if (isset($rootProps[PR_ADDITIONAL_REN_ENTRYIDS]) && is_array($rootProps[PR_ADDITIONAL_REN_ENTRYIDS])) {
				if (array_search($entryid, $rootProps[PR_ADDITIONAL_REN_ENTRYIDS])) {
					return true;
				}
			}

			// Check if the given folder is the inbox, note that we are unsure
			// if we have permissions on that folder, so we need a try catch.
			try {
				$inbox = mapi_msgstore_getreceivefolder($store);
				$props = mapi_getprops($inbox, array(PR_ENTRYID));

				if ($props[PR_ENTRYID] == $entryid) {
					return true;
				}
			} catch (MAPIException $e) {
				if($e->getCode() !== MAPI_E_NO_ACCESS) {
					throw $e;
				}
			}

			return false;
		}

		/**
		 * Delete a folder
		 *
		 * Deleting a folder normally just moves the folder to the wastebasket, which is what this function does. However,
		 * if the folder was already in the wastebasket, then the folder is really deleted.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $parententryid The parent in which the folder should be deleted
		 * @param string $entryid The entryid of the folder which will be deleted
		 * @param array $folderProps reference to an array which will be filled with PR_ENTRYID, PR_STORE_ENTRYID of the deleted object
		 * @param boolean $softDelete flag for indicating that folder should be soft deleted which can be recovered from
		 * restore deleted items
		 * @param boolean $hardDelete flag for indicating that folder should be hard deleted from system and can not be
		 * recovered from restore soft deleted items
		 * @return boolean true if action succeeded, false if not
		 * @todo subfolders of folders in the wastebasket should also be hard-deleted
		 */
		function deleteFolder($store, $parententryid, $entryid, &$folderProps, $softDelete = false, $hardDelete = false)
		{
			$result = false;
			$msgprops = mapi_getprops($store, array(PR_IPM_WASTEBASKET_ENTRYID));
			$folder = mapi_msgstore_openentry($store, $parententryid);

			if($folder && !$this->isSpecialFolder($store, $entryid)) {
				if($hardDelete === true) {
					// hard delete the message if requested
					// beware that folder can not be recovered after this and will be deleted from system entirely
					if(mapi_folder_deletefolder($folder, $entryid, DEL_MESSAGES | DEL_FOLDERS | DELETE_HARD_DELETE)) {
						$result = true;

						// if exists, also delete settings made for this folder (client don't need an update for this)
						$GLOBALS["settings"]->delete("zarafa/v1/state/folders/" . bin2hex($entryid));
					}
				} else {
					if(isset($msgprops[PR_IPM_WASTEBASKET_ENTRYID])) {
						// TODO: check if not only $parententryid=wastebasket, but also the parents of that parent...
						// if folder is already in wastebasket or softDelete is requested then delete the message
						if($msgprops[PR_IPM_WASTEBASKET_ENTRYID] == $parententryid || $softDelete === true) {
							if(mapi_folder_deletefolder($folder, $entryid, DEL_MESSAGES | DEL_FOLDERS)) {
								$result = true;

								// if exists, also delete settings made for this folder (client don't need an update for this)
								$GLOBALS["settings"]->delete("zarafa/v1/state/folders/" . bin2hex($entryid));
							}
						} else {
							// move the folder to wastebasket
							$wastebasket = mapi_msgstore_openentry($store, $msgprops[PR_IPM_WASTEBASKET_ENTRYID]);

							$deleted_folder = mapi_msgstore_openentry($store, $entryid);
							$props = mapi_getprops($deleted_folder, array(PR_DISPLAY_NAME));

							try {
								/*
								 * To decrease overload of checking for conflicting folder names on modification of every folder
								 * we should first try to copy folder and if it returns MAPI_E_COLLISION then
								 * only we should check for the conflicting folder names and generate a new name
								 * and copy folder with the generated name.
								 */
								mapi_folder_copyfolder($folder, $entryid, $wastebasket, $props[PR_DISPLAY_NAME], FOLDER_MOVE);
								$folderProps = mapi_getprops($deleted_folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
								$result = true;
							} catch (MAPIException $e) {
								if($e->getCode() == MAPI_E_COLLISION) {
									$foldername = $this->checkFolderNameConflict($store, $wastebasket, $props[PR_DISPLAY_NAME]);

									mapi_folder_copyfolder($folder, $entryid, $wastebasket, $foldername, FOLDER_MOVE);
									$folderProps = mapi_getprops($deleted_folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
									$result = true;
								} else {
									// all other errors should be propagated to higher level exception handlers
									throw $e;
								}
							}
						}
					} else {
						if(mapi_folder_deletefolder($folder, $entryid, DEL_MESSAGES | DEL_FOLDERS)) {
							$result = true;

							// if exists, also delete settings made for this folder (client don't need an update for this)
							$GLOBALS["settings"]->delete("zarafa/v1/state/folders/" . bin2hex($entryid));
						}
					}
				}
			}

			return $result;
		}

		/**
		 * Empty folder
		 *
		 * Removes all items from a folder. This is a real delete, not a move.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid The entryid of the folder which will be emptied
		 * @param array $folderProps reference to an array which will be filled with PR_ENTRYID and PR_STORE_ENTRYID of the emptied folder
		 * @param Boolean $hardDelete flag to indicate if messages will be hard deleted and can not be recoved using restore soft deleted items
		 * @return boolean true if action succeeded, false if not
		 */
		function emptyFolder($store, $entryid, &$folderProps, $hardDelete = false)
		{
			$result = false;
			$folder = mapi_msgstore_openentry($store, $entryid);

			if($folder) {
				$flag = DEL_ASSOCIATED;

				if($hardDelete) {
					$flag |= DELETE_HARD_DELETE;
				}

				$result = mapi_folder_emptyfolder($folder, $flag);

				// Update freebusy in case we just emptied the calendar folder
				$GLOBALS["operations"]->publishFreeBusy($store, $entryid);

				$folderProps = mapi_getprops($folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
				$result = true;
			}

			return $result;
		}

		/**
		 * Copy or move a folder
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $parentfolderentryid The parent entryid of the folder which will be copied or moved
		 * @param string $sourcefolderentryid The entryid of the folder which will be copied or moved
		 * @param string $destfolderentryid The entryid of the folder which the folder will be copied or moved to
		 * @param boolean $moveFolder true - move folder, false - copy folder
		 * @param array $folderProps reference to an array which will be filled with entryids
		 * @return boolean true if action succeeded, false if not
		 */
		function copyFolder($store, $parentfolderentryid, $sourcefolderentryid, $destfolderentryid, $deststore, $moveFolder, &$folderProps)
		{
			$result = false;
			$sourceparentfolder = mapi_msgstore_openentry($store, $parentfolderentryid);
			$destfolder = mapi_msgstore_openentry($deststore, $destfolderentryid);
			if(!$this->isSpecialFolder($store, $sourcefolderentryid) && $sourceparentfolder && $destfolder && $deststore) {
				$folder = mapi_msgstore_openentry($store, $sourcefolderentryid);
				$props = mapi_getprops($folder, array(PR_DISPLAY_NAME));
				try {
					/*
		 			 * To decrease overload of checking for conflicting folder names on modification of every folder
		 			 * we should first try to copy/move folder and if it returns MAPI_E_COLLISION then
		 			 * only we should check for the conflicting folder names and generate a new name
		 			 * and copy/move folder with the generated name.
		 			 */
					if($moveFolder) {
						mapi_folder_copyfolder($sourceparentfolder, $sourcefolderentryid, $destfolder, $props[PR_DISPLAY_NAME], FOLDER_MOVE);
						$folderProps = mapi_getprops($folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
						$result = true;
					} else {
						mapi_folder_copyfolder($sourceparentfolder, $sourcefolderentryid, $destfolder, $props[PR_DISPLAY_NAME], COPY_SUBFOLDERS);
						$result = true;
					}
				} catch (MAPIException $e) {
					if($e->getCode() == MAPI_E_COLLISION) {
						$foldername = $this->checkFolderNameConflict($deststore, $destfolder, $props[PR_DISPLAY_NAME]);
						if($moveFolder) {
							mapi_folder_copyfolder($sourceparentfolder, $sourcefolderentryid, $destfolder, $foldername, FOLDER_MOVE);
							$folderProps = mapi_getprops($folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
							$result = true;
						} else {
							mapi_folder_copyfolder($sourceparentfolder, $sourcefolderentryid, $destfolder, $foldername, COPY_SUBFOLDERS);
							$result = true;
						}
					} else {
						// all other errors should be propagated to higher level exception handlers
						throw $e;
					}
				}
			}
			return $result;
		}

		/**
		 * Set the readflags of all messages in a folder to 'read'
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid The entryid of the folder
		 * @param array $folderProps reference to an array which will be filled with PR_ENTRYID and PR_STORE_ENTRYID of the folder
		 * @return boolean true if action succeeded, false if not
		 * @todo This function is message a 'set unread' option
		 */
		function setReadFlags($store, $entryid, &$folderProps)
		{
			$result = false;
			$folder = mapi_msgstore_openentry($store, $entryid);

			if($folder) {
				if(mapi_folder_setreadflags($folder, array(), SUPPRESS_RECEIPT)) {
					$result = true;

					$folderProps = mapi_getprops($folder, array(PR_ENTRYID, PR_STORE_ENTRYID));
				}
			}

			return $result;
		}

		/**
		 * Read MAPI table
		 *
		 * This function performs various operations to open, setup, and read all rows from a MAPI table.
		 *
		 * The output from this function is an XML array structure which can be sent directly to XML serialisation.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid The entryid of the folder to read the table from
		 * @param array $properties The set of properties which will be read
		 * @param array $sort The set properties which the table will be sort on (formatted as a MAPI sort order)
		 * @param integer $start Starting row at which to start reading rows
		 * @param integer $rowcount Number of rows which should be read
		 * @param array $restriction Table restriction to apply to the table (formatted as MAPI restriction)
		 * @param array $folderProps reference to an array which will be filled with PR_ENTRYID and PR_STORE_ENTRYID of the folder
		 * @return array XML array structure with row data
		 */
		function getTable($store, $entryid, $properties, $sort, $start, $rowcount = false, $restriction = false)
		{
			$data = array();
			$folder = mapi_msgstore_openentry($store, $entryid);

			if($folder) {
				$table = mapi_folder_getcontentstable($folder, MAPI_DEFERRED_ERRORS);

				if(!$rowcount) {
					$rowcount = 50; // FIXME: $GLOBALS["settings"]->get("global/rowcount", 50);
				}

				if(is_array($restriction)) {
					mapi_table_restrict($table, $restriction, TBL_BATCH);
				}

				if (is_array($sort) && !empty($sort)){
					/**
					 * If the sort array contains the PR_SUBJECT column we should change this to
					 * PR_NORMALIZED_SUBJECT to make sure that when sorting on subjects: "sweet" and
					 * "RE: sweet", the first one is displayed before the latter one. If the subject
					 * is used for sorting the PR_MESSAGE_DELIVERY_TIME must be added as well as
					 * Outlook behaves the same way in this case.
					 */
					if(isset($sort[PR_SUBJECT])){
						$sortReplace = Array();
						foreach($sort as $key => $value){
							if($key == PR_SUBJECT){
								$sortReplace[PR_NORMALIZED_SUBJECT] = $value;
								$sortReplace[PR_MESSAGE_DELIVERY_TIME] = TABLE_SORT_DESCEND;
							}else{
								$sortReplace[$key] = $value;
							}
						}
						$sort = $sortReplace;
					}

					mapi_table_sort($table, $sort, TBL_BATCH);
				}

				$data["item"] = array();

				/**
				 * Retrieving the entries should be done in batches to prevent large ammounts of
				 * items in one list clogging up the memory limit. This is especially important when
				 * dealing with contactlists in the addressbook. Those lists can contain 10K items.
				 */
				$batchcount = 50;
				$batchposition = $start;
				$position = $start;
				$end = $start + $rowcount;
				$columns = $properties;

				// Check if mapi_table_setcolumns exists (ZCP-7.1.1 and above), if so
				// then call mapi_table_setcolumns now, and set $columns to null.
				if (function_exists('mapi_table_setcolumns')) {
					mapi_table_setcolumns($table, $columns);
					$columns = null;
				}

				// Check if mapi_table_seekrow exists (ZCP-7.1.1 and above), if so
				// then call mapi_table_seekrow now, and set $position to 0.
				if (function_exists('mapi_table_seekrow')) {
					mapi_table_seekrow($table, BOOKMARK_BEGINNING, $position);
					$position = 0;
				}

				do {
					// When we open the last batch, make sure we end at the $end position,
					// and don't add any additional items.
					if (($batchposition + $batchcount) > $end) {
						$batchcount = $end - $batchposition;
					}

					$rows = mapi_table_queryrows($table, $columns, $position, $batchcount);
					foreach($rows as $row){
						array_push($data["item"], Conversion::mapMAPI2XML($properties, $row));
					}

					// Reset the $position to 0, we only need to perform
					// a seekrow action once. (When mapi_table_seekrow exists, then $position
					// would already have been 0, but for other cases it should still be
					// reset here).
					$position = 0;

					// Move the $batchposition to the next count, so we can determine the
					// correct $batchcount for the final loop.
					$batchposition += $batchcount;

				// When the server returned a different number of rows then was requested,
				// we have reached the end of the table and we should exit the loop.
				} while (count($rows) == $batchcount && $batchposition !== $end);

				// Update the page information
				$data["page"] = array();
				$data["page"]["start"] = $start;
				$data["page"]["rowcount"] = $rowcount;
				$data["page"]["totalrowcount"] = mapi_table_getrowcount($table);
			}

			return $data;
		}

		/**
		 * Returns TRUE of the MAPI message only has inline attachments
		 *
		 * @param mapimessage $message The MAPI message object to check
		 * @return boolean TRUE if the item contains only inline attachments, FALSE otherwise
		 * @deprecated This function is not used, because it is much too slow to run on all messages in your inbox
		 */
		function hasOnlyInlineAttachments($message)
		{
			$attachmentTable = mapi_message_getattachmenttable($message);
			if($attachmentTable) {
				$attachments = mapi_table_queryallrows($attachmentTable, array(PR_ATTACHMENT_HIDDEN));
				foreach($attachments as $attachmentRow)	{
					if(!isset($attachmentRow[PR_ATTACHMENT_HIDDEN]) || !$attachmentRow[PR_ATTACHMENT_HIDDEN]) {
						return false;
					}
				}
			}

			return true;
		}

		/**
		 * Read message properties
		 *
		 * Reads a message and returns the data as an XML array structure with all data from the message that is needed
		 * to show a message (for example in the preview pane)
		 *
		 * @param object $store MAPI Message Store Object
		 * @param object $message The MAPI Message Object
		 * @param array $properties Mapping of properties that should be read
		 * @param boolean $html2text true - body will be converted from html to text, false - html body will be returned
		 * @return array item properties
		 * @todo Function name is misleading as it doesn't just get message properties
		 */
		function getMessageProps($store, $message, $properties, $html2text = false)
		{
			$props = array();

			if($message) {
				$messageprops = mapi_getprops($message, $properties);
				$props = Conversion::mapMAPI2XML($properties, $messageprops);

				// Get actual SMTP address for sent_representing_email_address and received_by_email_address
				$smtpprops = mapi_getprops($message, array(PR_SENT_REPRESENTING_ENTRYID, PR_RECEIVED_BY_ENTRYID, PR_SENDER_ENTRYID));

				/*
				 * Check that we have PR_SENT_REPRESENTING_ENTRYID for the item, and also
				 * Check that we have sent_representing_email_address property there in the message,
				 * but for contacts we are not using sent_representing_* properties so we are not
				 * getting it from the message. So basically this will be used for mail items only
				 */
				if(isset($smtpprops[PR_SENT_REPRESENTING_ENTRYID]) && isset($props["props"]["sent_representing_email_address"])) {
					$props["props"]["sent_representing_email_address"] = $this->getEmailAddressFromEntryID($smtpprops[PR_SENT_REPRESENTING_ENTRYID]);
				}

				if(isset($smtpprops[PR_SENDER_ENTRYID]) && isset($props["props"]["sender_email_address"])) {
					$props["props"]["sender_email_address"] = $this->getEmailAddressFromEntryID($smtpprops[PR_SENDER_ENTRYID]);
				}

				if(isset($smtpprops[PR_RECEIVED_BY_ENTRYID]) && isset($props["props"]["received_by_email_address"])) {
					$props["props"]["received_by_email_address"] = $this->getEmailAddressFromEntryID($smtpprops[PR_RECEIVED_BY_ENTRYID]);
				}

				// Get body content
				$plaintext = $this->isPlainText($message);
				$tmpProps = mapi_getprops($message, array(PR_BODY, PR_HTML));

				$htmlcontent = '';
				$plaincontent = '';
				if (!$plaintext){
					$cpprops = mapi_message_getprops($message, array(PR_INTERNET_CPID));
					$codepage = isset($cpprops[PR_INTERNET_CPID]) ? $cpprops[PR_INTERNET_CPID] : 1252;
					if(isset($tmpProps[PR_HTML]) || propIsError(PR_HTML, $tmpProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
						// only open proeprty if it exists
						$htmlcontent = Conversion::convertCodepageStringToUtf8($codepage, mapi_message_openproperty($message, PR_HTML));
					}

					if(!empty($htmlcontent)) {
						$filter = new filter();

						if(!$html2text) {
							$msgstore_props = mapi_getprops($store, array(PR_ENTRYID));

							$htmlcontent = $filter->safeHTML($htmlcontent);
							$props["props"]["isHTML"] = true;
						} else {
							$htmlcontent = '';
						}
					}

					$htmlcontent = trim($htmlcontent, "\0");
				}

				if(isset($tmpProps[PR_BODY]) || propIsError(PR_BODY, $tmpProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
					// only open proeprty if it exists
					$plaincontent = mapi_message_openproperty($message, PR_BODY);
					$plaincontent = trim($plaincontent, "\0");
				}

				if (!empty($htmlcontent)) {
					$props["props"]["html_body"] = $htmlcontent;
					$props["props"]["isHTML"] = true;
				} else {
					$props["props"]["isHTML"] = false;
				}
				$props["props"]["body"] = $plaincontent;

				// Get reply-to information, otherwise consider the sender to be the reply-to person.
				$props['reply-to'] = array( 'item' => array() );
				$messageprops = mapi_getprops($message, array(PR_REPLY_RECIPIENT_ENTRIES));
				if (isset($messageprops[PR_REPLY_RECIPIENT_ENTRIES])) {
					$props['reply-to']['item'] = $this->readReplyRecipientEntry($messageprops[PR_REPLY_RECIPIENT_ENTRIES]);
				} else {
					if (isset($props['props']['sent_representing_email_address']) && !empty($props['props']['sent_representing_email_address'])) {
						$props['reply-to']['item'][] = array(
							'rowid' => 0,
							'props' => array(
								'entryid' => $props['props']['sent_representing_entryid'],
								'display_name' => $props['props']['sent_representing_name'],
								'smtp_address' => $props['props']['sent_representing_email_address'],
								'address_type' => $props['props']['sent_representing_address_type'],
								'object_type' => MAPI_MAILUSER,
								'search_key' => isset($props['props']['sent_representing_search_key']) ? $props['props']['sent_representing_search_key'] : ''
							)
						);
					} else if (!empty($props['props']['sender_email_address'])) {
						$props['reply-to']['item'][] = array(
							'rowid' => 0,
							'props' => array(
								'entryid' => $props['props']['sender_entryid'],
								'display_name' => $props['props']['sender_name'],
								'smtp_address' => $props['props']['sender_email_address'],
								'address_type' => $props['props']['sender_address_type'],
								'object_type' => MAPI_MAILUSER,
								'search_key' => $props['props']['sender_search_key']
							)
						);
					}
				}

				// Get recipients
				$recipients = $GLOBALS["operations"]->getRecipientsInfo($store, $message);
				if(!empty($recipients)) {
					$props["recipients"] = array(
						"item" => $recipients
					);
				}

				// Get attachments
				$attachments = $GLOBALS["operations"]->getAttachmentsInfo($store, $message);
				if(!empty($attachments)) {
					$props["attachments"] = array(
						"item" => $attachments
					);
				}

				// for distlists, we need to get members data
				if(isset($props["props"]["oneoff_members"]) && isset($props["props"]["members"])) {
					// remove non-client props
					unset($props["props"]["members"]);
					unset($props["props"]["oneoff_members"]);

					// get members
					$members = $GLOBALS["operations"]->getMembersFromDistributionList($store, $message, $properties);
					if(!empty($members)) {
						$props["members"] = array(
							"item" => $members
						);
					}
				}
			}

			return $props;
		}

		/**
		 * Get and convert properties of a message into an XML array structure
		 *
		 * @param object $store MAPI Message Store Object
		 * @param object $item The MAPI Object
		 * @param array $properties Mapping of properties that should be read
		 * @return array XML array structure
		 * @todo Function name is misleading, especially compared to getMessageProps()
		 */
		function getProps($store, $item, $properties)
		{
			$props = array();

			if($item) {
				$itemprops = mapi_getprops($item, $properties);
				$props = Conversion::mapMAPI2XML($properties, $itemprops);
			}

			return $props;
		}

		/**
		 * Get embedded message data
		 *
		 * Returns the same data as getMessageProps, but then for a specific sub/sub/sub message
		 * of a MAPI message.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param object $message MAPI Message Object
		 * @param array $properties a set of properties which will be selected
		 * @param array $parentMessage MAPI Message Object of parent
		 * @param array $attach_num a list of attachment numbers (aka 2,1 means 'attachment nr 1 of attachment nr 2')
		 * @return array item XML array structure of the embedded message
		 */
		function getEmbeddedMessageProps($store, $message, $properties, $parentMessage, $attach_num)
		{
			$msgprops = mapi_getprops($message, Array(PR_MESSAGE_CLASS));

			switch($msgprops[PR_MESSAGE_CLASS]) {
				case 'IPM.Note':
					$html2text = false;
					break;
				default:
					$html2text = true;
			}

			$props = $this->getMessageProps($store, $message, $properties, $html2text);

			// sub message will not be having entryid, so use parent's entryid
			$parentProps = mapi_getprops($parentMessage, array(PR_ENTRYID, PR_PARENT_ENTRYID, PR_STORE_ENTRYID));
			$props['entryid'] = bin2hex($parentProps[PR_ENTRYID]);
			$props['parent_entryid'] = bin2hex($parentProps[PR_PARENT_ENTRYID]);
			$props['store_entryid'] = bin2hex($parentProps[PR_STORE_ENTRYID]);
			$props['attach_num'] = $attach_num;

			return $props;
		}

		/**
		 * Create a MAPI message
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $parententryid The entryid of the folder in which the new message is to be created
		 * @return mapimessage Created MAPI message resource
		 */
		function createMessage($store, $parententryid)
		{
			$folder = mapi_msgstore_openentry($store, $parententryid);
			return mapi_folder_createmessage($folder);
		}

		/**
		 * Open a MAPI message
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid entryid of the message
		 * @param array $attach_num a list of attachment numbers (aka 2,1 means 'attachment nr 1 of attachment nr 2')
		 * @param boolean $parse_smime (optional) call parse_smime on the opened message or not
		 * @return object MAPI Message
		 */
		function openMessage($store, $entryid, $attach_num = false, $parse_smime = false)
		{
			$message = mapi_msgstore_openentry($store, $entryid);

			// Needed for S/MIME messages with embedded message attachments
			if($parse_smime) {
				parse_smime($store, $message);
			}

			if($message && $attach_num) {
				for($index = 0, $count = count($attach_num); $index < $count; $index++) {
					// attach_num cannot have value of -1
					// if we get that then we are trying to open an embedded message which
					// is not present in the attachment table to parent message (because parent message is unsaved yet)
					// so return the message which is opened using entryid which will point to actual message which is
					// attached as embedded message
					if($attach_num[$index] === -1) {
						return $message;
					}

					$attachment = mapi_message_openattach($message, $attach_num[$index]);

					if($attachment) {
						$message = mapi_attach_openobj($attachment);
					} else {
						return false;
					}
				}
			}

			return $message;
		}

		/**
		 * Save a MAPI message
		 *
		 * The to-be-saved message can be of any type, including e-mail items, appointments, contacts, etc. The message may be pre-existing
		 * or it may be a new message.
		 *
		 * The dialog_attachments parameter represents a unique ID which for the dialog in the client for which this function was called; This
		 * is used as follows; Whenever a user uploads an attachment, the attachment is stored in a temporary place on the server. At the same time,
		 * the temporary server location of the attachment is saved in the session information, accompanied by the $dialog_attachments unique ID. This
		 * way, when we save the message into MAPI, we know which attachment was previously uploaded ready for this message, because when the user saves
		 * the message, we pass the same $dialog_attachments ID as when we uploaded the file.
		 *
		 * @param object $store MAPI Message Store Object
		 * @param binary $entryid entryid of the message
		 * @param binary $parententryid Parent entryid of the message
		 * @param array $props The MAPI properties to be saved
		 * @param array $messageProps reference to an array which will be filled with PR_ENTRYID and PR_STORE_ENTRYID of the saved message
		 * @param array $recipients XML array structure of recipients for the recipient table
		 * @param array $attachments attachments array containing unique check number which checks if attachments should be added
		 * @param array $propertiesToDelete Properties specified in this array are deleted from the MAPI message
		 * @param MAPIMessage $copyFromMessage resource of the message from which we should
		 * copy attachments and/or recipients to the current message.
		 * @param boolean $copyAttachments If set we copy all attachments from the $copyFromMessage.
		 * @param boolean $copyRecipients If set we copy all recipients from the $copyFromMessage.
		 * @param boolean $copyInlineAttachmentsOnly if true then copy only inline attachments.
		 * @param boolean $saveChanges if true then save all change in mapi message
		 * @param boolean $send true if this function is called from submiteMessage else false.
		 * @return mapimessage Saved MAPI message resource
		 */
		function saveMessage($store, $entryid, $parententryid, $props, &$messageProps, $recipients = array(), $attachments = array(), $propertiesToDelete = array(), $copyFromMessage = false, $copyAttachments = false, $copyRecipients = false, $copyInlineAttachmentsOnly = false, $saveChanges = true, $send = false)
		{
			$message = false;

			// Check if an entryid is set, otherwise create a new message
			if($entryid && !empty($entryid)) {
				$message = $this->openMessage($store, $entryid);
			} else {
				$message = $this->createMessage($store, $parententryid);
			}

			if($message) {
				$property = false;
				$body = "";

				// Check if the body is set.
				if (isset($props[PR_BODY])) {
					$body = $props[PR_BODY];
					$property = PR_BODY;
					$bodyPropertiesToDelete = array(PR_HTML, PR_RTF_COMPRESSED);

					if(isset($props[PR_HTML])) {
						$subject = '';
						if(isset($props[PR_SUBJECT])){
							$subject = $props[PR_SUBJECT];
						// If subject is not updated we need to get it from the message
						}else{
							$subjectProp = mapi_getprops($message, Array(PR_SUBJECT));
							if(isset($subjectProp[PR_SUBJECT])){
								$subject = $subjectProp[PR_SUBJECT];
							}
						}
						$body = $this->generateBodyHTML($props[PR_BODY], $subject);
						$property = PR_HTML;
						$bodyPropertiesToDelete = array(PR_BODY, PR_RTF_COMPRESSED);
						unset($props[PR_HTML]);
					}
					unset($props[PR_BODY]);

					$propertiesToDelete = array_unique(array_merge($propertiesToDelete, $bodyPropertiesToDelete));
				}

				if(!isset($props[PR_SENT_REPRESENTING_ENTRYID]) &&
				   isset($props[PR_SENT_REPRESENTING_EMAIL_ADDRESS]) && !empty($props[PR_SENT_REPRESENTING_EMAIL_ADDRESS]) &&
				   isset($props[PR_SENT_REPRESENTING_ADDRTYPE]) && !empty($props[PR_SENT_REPRESENTING_ADDRTYPE]) &&
				   isset($props[PR_SENT_REPRESENTING_NAME]) && !empty($props[PR_SENT_REPRESENTING_NAME])) {
					// Set FROM field properties
					$props[PR_SENT_REPRESENTING_ENTRYID] = mapi_createoneoff($props[PR_SENT_REPRESENTING_NAME], $props[PR_SENT_REPRESENTING_ADDRTYPE], $props[PR_SENT_REPRESENTING_EMAIL_ADDRESS]);
				}

				/*
				 * Delete PR_SENT_REPRESENTING_ENTRYID and PR_SENT_REPRESENTING_SEARCH_KEY properties, if PR_SENT_REPRESENTING_* properties are configured with empty string.
				 * Because, this is the case while user removes recipient from FROM field and send that particular draft without saving it.
				 */
				if(isset($props[PR_SENT_REPRESENTING_EMAIL_ADDRESS]) && empty($props[PR_SENT_REPRESENTING_EMAIL_ADDRESS]) &&
				   isset($props[PR_SENT_REPRESENTING_ADDRTYPE]) && empty($props[PR_SENT_REPRESENTING_ADDRTYPE]) &&
				   isset($props[PR_SENT_REPRESENTING_NAME]) && empty($props[PR_SENT_REPRESENTING_NAME])) {
					array_push($propertiesToDelete, PR_SENT_REPRESENTING_ENTRYID, PR_SENT_REPRESENTING_SEARCH_KEY);
				}

				// remove mv properties when needed
				foreach($props as $propTag=>$propVal){
					switch(mapi_prop_type($propTag)) {
						case PT_SYSTIME:
							// Empty PT_SYSTIME values mean they should be deleted (there is no way to set an empty PT_SYSTIME)
						//case PT_STRING8:	// not enabled at this moment
							// Empty Strings
						case PT_MV_LONG:
							// Empty multivalued long
						case PT_MV_STRING8:
							// Empty multivalued string
							if(empty($propVal)) {
								$propertiesToDelete[] = $propTag;
							}
							break;
					}
				}

				foreach($propertiesToDelete as $prop){
					unset($props[$prop]);
				}

				// Set the properties
				mapi_setprops($message, $props);

				// Delete the properties we don't need anymore
				mapi_deleteprops($message, $propertiesToDelete);

				if ($property != false){
					// Stream the body to the PR_BODY or PR_HTML property
					$stream = mapi_openproperty($message, $property, IID_IStream, 0, MAPI_CREATE | MAPI_MODIFY);
					mapi_stream_setsize($stream, strlen($body));
					mapi_stream_write($stream, $body);
					mapi_stream_commit($stream);
				}

				/*
				 * Save recipients
				 *
				 * If we are sending mail from delegator's folder, then we need to copy
				 * all recipients from original message first - need to pass message
				 *
				 * if delegate has added or removed any recipients then they will be
				 * added/removed using recipients array.
				 */
				if($copyRecipients !== false && $copyFromMessage !== false) {
					$this->copyRecipients($message, $copyFromMessage);
				}

				$this->setRecipients($message, $recipients, $send);

				// Save the attachments with the $dialog_attachments, for attachments we have to obtain
				// some additional information from the state.
				if (!empty($attachments)) {
					$attachment_state = new AttachmentState();
					$attachment_state->open();

					if($copyFromMessage !== false) {
						$this->copyAttachments($message, $attachments, $copyFromMessage, $copyInlineAttachmentsOnly, $attachment_state);
					}

					$this->setAttachments($message, $attachments, $attachment_state);

					$attachment_state->close();
				}

				// Set 'hideattacments' if message has only inline attachments.
				$properties = $GLOBALS['properties']->getMailProperties();
				if($this->hasOnlyInlineAttachments($message)){
					mapi_setprops($message, array($properties['hide_attachments'] => true));
				} else {
					mapi_deleteprops($message, array($properties['hide_attachments']));
				}

				// Save changes
				if ($saveChanges) {
					mapi_savechanges($message);
				}

				// Get the PR_ENTRYID, PR_PARENT_ENTRYID and PR_STORE_ENTRYID properties of this message
				$messageProps = mapi_getprops($message, array(PR_ENTRYID, PR_PARENT_ENTRYID, PR_STORE_ENTRYID));
			}

			return $message;
		}

		/**
		 * Save an appointment item.
		 *
		 * This is basically the same as saving any other type of message with the added complexity that
		 * we support saving exceptions to recurrence here. This means that if the client sends a basedate
		 * in the action, that we will attempt to open an existing exception and change that, and if that
		 * fails, create a new exception with the specified data.
		 *
		 * @param mapistore $store MAPI store of the message
		 * @param string $entryid entryid of the message
		 * @param string $parententryid Parent entryid of the message (folder entryid, NOT message entryid)
		 * @param array $action Action array containing XML request
		 * @param string $actionType The action type which triggered this action
		 * @param boolean $directBookingMeetingRequest Indicates if a Meeting Request should use direct booking or not. Defaults to true.
		 * @return array of PR_ENTRYID, PR_PARENT_ENTRYID and PR_STORE_ENTRYID properties of modified item
		 */
		function saveAppointment($store, $entryid, $parententryid, $action, $actionType = 'save', $directBookingMeetingRequest=true)
		{
			$exception = false;
			$messageProps = array();
			// It stores the values that is exception allowed or not false -> not allowed
			$isExceptionAllowed = true;
			$delete = $actionType == 'delete';	// Flag for MeetingRequest Class whether to send update or cancel mail.
			$basedate = false;	// Flag for MeetingRequest Class whether to send an exception or not.
			$isReminderTimeAllowed = true;	// Flag to check reminder minutes is in range of the occurences
			$properties = $GLOBALS['properties']->getAppointmentProperties();
			$send = false;
			$oldProps = array();

			if(isset($action['message_action']) && isset($action['message_action']['send'])) {
				$send = $action['message_action']['send'];
			}

			if(!empty($action['recipients'])) {
				$recips = $action['recipients'];
			} else {
				$recips = false;
			}

			if($store && $parententryid) {
				//@FIXME: check for $action['props'] array
				if(isset($entryid) && $entryid) {
					// Modify existing or add/change exception
					$message = mapi_msgstore_openentry($store, $entryid);

					if($message) {
						$props = mapi_getprops($message, $properties);
						// Check if appointment is an exception to a recurring item
						if(isset($action['basedate']) && $action['basedate'] > 0) {
							// Create recurrence object
							$recurrence = new Recurrence($store, $message);

							$basedate = $action['basedate'];
							$exceptionatt = $recurrence->getExceptionAttachment($basedate);
							if($exceptionatt) {
								//get properties of existing exception.
								$exceptionattProps = mapi_getprops($exceptionatt, array(PR_ATTACH_NUM));
								$attach_num = $exceptionattProps[PR_ATTACH_NUM];
							}

							if ($delete === true) {
								$isExceptionAllowed = $recurrence->createException(array(), $basedate, true);
							} else {
								$exception_recips = array();
								if (isset($recips['add'])) {
									$exception_recips['add'] = $this->createRecipientList($recips['add'], 'add', true, true);
								}
								if (isset($recips['remove'])) {
									$exception_recips['remove'] = $this->createRecipientList($recips['remove'], 'remove');
								}
								if (isset($recips['modify'])) {
									$exception_recips['modify'] = $this->createRecipientList($recips['modify'], 'modify', true, true);
								}

								if(isset($action['props']['reminder_minutes']) && isset($action['props']['startdate'])){
									$isReminderTimeAllowed = $recurrence->isValidReminderTime($basedate, $action['props']['reminder_minutes'], $action['props']['startdate']);
								}

								// As the reminder minutes occurs before other occurences don't modify the item.
								if($isReminderTimeAllowed){
									if($recurrence->isException($basedate)){
										$oldProps = $recurrence->getExceptionProperties($recurrence->getChangeException($basedate));
										//to get the old exceptions properties
										if(isset($action['drag']) && $action['drag']){
											$previousExceptionProps = $recurrence->getChangeException($basedate);
										}

										$isExceptionAllowed = $recurrence->modifyException(Conversion::mapXML2MAPI($properties, $action['props']), $basedate, $exception_recips);
									} else {
										$oldProps[$properties['startdate']] = $recurrence->getOccurrenceStart($basedate);
										$oldProps[$properties['duedate']] = $recurrence->getOccurrenceEnd($basedate);

										$isExceptionAllowed = $recurrence->createException(Conversion::mapXML2MAPI($properties, $action['props']), $basedate, false, $exception_recips);
									}
									mapi_savechanges($message);
								}
							}
						} else {
							$oldProps = mapi_getprops($message, array($properties['startdate'], $properties['duedate']));

							// Modifying non-exception (the series) or normal appointment item
							$message = $GLOBALS['operations']->saveMessage($store, $entryid, $parententryid, Conversion::mapXML2MAPI($properties, $action['props']), $messageProps, $recips ? $recips : array(), isset($action['attachments']) ? $action['attachments'] : array(), array(), false, false, false, false, false, false, $send);

							// Only save recurrence if it has been changed by the user (because otherwise we'll reset
							// the exceptions)
							if(isset($action['props']['recurring_reset']) && $action['props']['recurring_reset'] == true) {
								$recur = new Recurrence($store, $message);

								if(isset($action['props']['timezone'])) {
									$tzprops = Array('timezone','timezonedst','dststartmonth','dststartweek','dststartday','dststarthour','dstendmonth','dstendweek','dstendday','dstendhour');

									// Get timezone info
									$tz = Array();
									foreach($tzprops as $tzprop) {
										$tz[$tzprop] = $action['props'][$tzprop];
									}
								}

								// Act like the 'props' are the recurrence pattern; it has more information but that
								// is ignored
								$recur->setRecurrence(isset($tz) ? $tz : false, $action['props']);
							}
						}

						// Get the properties of the main object of which the exception was changed, and post
						// that message as being modified. This will cause the update function to update all
						// occurrences of the item to the client
						$messageProps = mapi_getprops($message, array(PR_ENTRYID, PR_PARENT_ENTRYID, PR_STORE_ENTRYID));

						// if opened appointment is exception then it will add 
						// the attach_num and basedate in messageProps.
						if(isset($attach_num)) {
							$messageProps[PR_ATTACH_NUM] = array($attach_num);
							$messageProps[$properties["basedate"]] = $action['basedate'];
						}
					}
				} else {
					$tz = null;
					//Set sender of new Appointment.
					$this->setSenderAddress($store, $action);

					$message = $GLOBALS['operations']->saveMessage($store, $entryid, $parententryid, Conversion::mapXML2MAPI($properties, $action['props']), $messageProps, $recips ? $recips : array(), isset($action['attachments']) ? $action['attachments'] : array(), array(), false, false, false, false, false, false, $send);

					if(isset($action['props']['timezone'])) {
						$tzprops = Array('timezone','timezonedst','dststartmonth','dststartweek','dststartday','dststarthour','dstendmonth','dstendweek','dstendday','dstendhour');

						// Get timezone info
						$tz = Array();
						foreach($tzprops as $tzprop) {
							$tz[$tzprop] = $action['props'][$tzprop];
						}
					}

					// Set recurrence
					if(isset($action['props']['recurring']) && $action['props']['recurring'] == true) {
						$recur = new Recurrence($store, $message);
						$recur->setRecurrence($tz, $action['props']);
					}
				}
			}

			$result = false;
			// Check to see if it should be sent as a meeting request
			if($send === true && $isExceptionAllowed){
				$request = new Meetingrequest($store, $message, $GLOBALS['mapisession']->getSession(), $directBookingMeetingRequest);

				/**
				 * check write access for delegate, make sure that we will not send meeting request
				 * if we don't have permission to save calendar item
				 */
				if($request->checkFolderWriteAccess($parententryid, $store) !== true) {
					// Throw an exception that we don't have write permissions on calendar folder,
					// error message will be filled by module
					throw new MAPIException(null, MAPI_E_NO_ACCESS);
				}

				$request->updateMeetingRequest($basedate);

				$isRecurrenceChanged = isset($action['props']['recurring_reset']) && $action['props']['recurring_reset'] == true;
				$request->checkSignificantChanges($oldProps, $basedate, $isRecurrenceChanged);

				// Update extra body information
				if(isset($action['message_action']['meetingTimeInfo']) && !empty($action['message_action']['meetingTimeInfo'])) {
					// Append body if the request action requires this
					if(isset($action['message_action']) && isset($action['message_action']['append_body'])) {

						$bodyProps = mapi_getprops($message, array(PR_BODY));
						if(isset($bodyProps[PR_BODY]) || propIsError(PR_BODY, $bodyProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
							$stream = mapi_openproperty($message, PR_BODY, IID_IStream, 0, 0);
							$stat = mapi_stream_stat($stream);
							mapi_stream_seek($stream, 0, STREAM_SEEK_SET);
							$body = '';
							for($i=0;$i<$stat['cb'];$i+=1024){
								$body .= mapi_stream_read($stream, 1024);
							}
							$bodyProps[PR_BODY] = $body;
						}

						if(isset($action['message_action']['meetingTimeInfo']) && isset($bodyProps[PR_BODY])){
							$action['message_action']['meetingTimeInfo'] .= $bodyProps[PR_BODY];
						}
					}

					$request->setMeetingTimeInfo($action['message_action']['meetingTimeInfo']);
					unset($action['message_action']['meetingTimeInfo']);
				}

				$modifiedRecipients = false;
				$deletedRecipients = false;
				if ($recips) {
					if (isset($action['message_action']['send_update']) && $action['message_action']['send_update'] == 'modified') {
						if (isset($recips['add']) && !empty($recips['add'])) {
							$modifiedRecipients = $modifiedRecipients ? $modifiedRecipients : array();
							$modifiedRecipients = array_merge($modifiedRecipients, $this->createRecipientList($recips['add'], 'add'));
						}

						if (isset($recips['modify']) && !empty($recips['modify'])) {
							$modifiedRecipients = $modifiedRecipients ? $modifiedRecipients : array();
							$modifiedRecipients = array_merge($modifiedRecipients, $this->createRecipientList($recips['modify'], 'modify'));
						}
					}

					if (isset($recips['remove']) && !empty($recips['remove'])) {
						$deletedRecipients = $deletedRecipients ? $deletedRecipients : array();
						$deletedRecipients = array_merge($deletedRecipients, $this->createRecipientList($recips['remove'], 'remove'));
					}
				}

				$sendMeetingRequestResult = $request->sendMeetingRequest($delete, false, $basedate, $modifiedRecipients, $deletedRecipients);

				if ($recips) {
					$this->addEmailsToRecipientHistory($recips);
				}

				if($sendMeetingRequestResult === true){
					mapi_savechanges($message);

					// We want to sent the 'request_sent' property, to have it properly
					// deserialized we must also send some type properties.
					$props = mapi_getprops($message, array( PR_MESSAGE_CLASS, PR_OBJECT_TYPE ));
					$messageProps[PR_MESSAGE_CLASS] = $props[PR_MESSAGE_CLASS];
					$messageProps[PR_OBJECT_TYPE] = $props[PR_OBJECT_TYPE];

					// Indicate that the message was correctly sent
					$messageProps[$properties['request_sent']] = true;

					// Return message properties that can be sent to the bus to notify changes
					$result = $messageProps;
				}else{
					$sendMeetingRequestResult[PR_ENTRYID] = $messageProps[PR_ENTRYID];
					$sendMeetingRequestResult[PR_PARENT_ENTRYID] = $messageProps[PR_PARENT_ENTRYID];
					$sendMeetingRequestResult[PR_STORE_ENTRYID] = $messageProps[PR_STORE_ENTRYID];
					$result = $sendMeetingRequestResult;
				}
			} else {

				mapi_savechanges($message);

				if(isset($isExceptionAllowed)){
					if($isExceptionAllowed === false) {
						$messageProps['isexceptionallowed'] = false;
					}
				}

				if(isset($isReminderTimeAllowed)){
					if($isReminderTimeAllowed === false) {
						$messageProps['remindertimeerror'] = false;
					}
				}
				// Return message properties that can be sent to the bus to notify changes
				$result = $messageProps;
			}

			if ($store && $parententryid) {
				// Publish updated free/busy information
				$GLOBALS['operations']->publishFreeBusy($store, $parententryid);
			}

			return $result;
		}

		/**
		 * Set sent_representing_email_address property of Appointment.
		 *
		 * Before saving any new appointment, sent_representing_email_address property of appointment
		 * should contain email_address of user, who is the owner of store(in which the appointment
		 * is created).
		 *
		 * @param mapistore $store  MAPI store of the message
		 * @param array     $action reference to action array containing XML request
		 */
		function setSenderAddress($store, &$action)
		{
			$storeProps = mapi_getprops($store, array(PR_MAILBOX_OWNER_ENTRYID));
			// check for public store
			if(!isset($storeProps[PR_MAILBOX_OWNER_ENTRYID])) {
				$store = $GLOBALS["mapisession"]->getDefaultMessageStore();
				$storeProps = mapi_getprops($store, array(PR_MAILBOX_OWNER_ENTRYID));
			}
			$mailuser = mapi_ab_openentry($GLOBALS["mapisession"]->getAddressbook(), $storeProps[PR_MAILBOX_OWNER_ENTRYID]);
			if($mailuser){
				$userprops = mapi_getprops($mailuser, array(PR_ADDRTYPE, PR_DISPLAY_NAME, PR_EMAIL_ADDRESS, PR_SMTP_ADDRESS));
				$action["props"]["sent_representing_entryid"]       = bin2hex($storeProps[PR_MAILBOX_OWNER_ENTRYID]);
				// we do conversion here, because before passing props to saveMessage() props are converted from utf8-to-w
				$action["props"]["sent_representing_name"]          = $userprops[PR_DISPLAY_NAME];
				$action["props"]["sent_representing_address_type"]      = $userprops[PR_ADDRTYPE];
				if($userprops[PR_ADDRTYPE] == 'SMTP'){
					$emailAddress = $userprops[PR_EMAIL_ADDRESS];
				}else{
					$emailAddress = $userprops[PR_SMTP_ADDRESS];
				}
				$action["props"]["sent_representing_email_address"] = $emailAddress;
				$action["props"]["sent_representing_search_key"]    = bin2hex(strtoupper($userprops[PR_ADDRTYPE] . ':' . $emailAddress)) . '00';
			}
		}

		/**
		 * Get sender structure of the MAPI Message.
		 *
		 * @param mapimessage $mapiMessage  MAPI Message resource from which we need to get the sender.
		 * @return array with properties
		 */
		function getSenderAddress($mapiMessage)
		{
			$messageProps  = mapi_getprops($mapiMessage, array(PR_SENT_REPRESENTING_ENTRYID, PR_SENDER_ENTRYID));
			$senderEntryID = isset($messageProps[PR_SENT_REPRESENTING_ENTRYID])? $messageProps[PR_SENT_REPRESENTING_ENTRYID] : $messageProps[PR_SENDER_ENTRYID];
			$senderUser = mapi_ab_openentry($GLOBALS["mapisession"]->getAddressbook(), $senderEntryID);
			if($senderUser) {
				$userprops = mapi_getprops($senderUser, array(PR_ADDRTYPE, PR_DISPLAY_NAME, PR_EMAIL_ADDRESS, PR_SMTP_ADDRESS, PR_OBJECT_TYPE,PR_RECIPIENT_TYPE, PR_DISPLAY_TYPE, PR_DISPLAY_TYPE_EX, PR_ENTRYID));

				$senderStructure = array();
				$senderStructure["props"]['entryid']         = bin2hex($userprops[PR_ENTRYID]);
				$senderStructure["props"]['display_name']    = isset($userprops[PR_DISPLAY_NAME]) ? $userprops[PR_DISPLAY_NAME] : '';
				$senderStructure["props"]['email_address']   = isset($userprops[PR_EMAIL_ADDRESS]) ? $userprops[PR_EMAIL_ADDRESS] : '';
				$senderStructure["props"]['smtp_address']    = isset($userprops[PR_SMTP_ADDRESS]) ? $userprops[PR_SMTP_ADDRESS] : '';
				$senderStructure["props"]['address_type']    = isset($userprops[PR_ADDRTYPE]) ? $userprops[PR_ADDRTYPE] : '';
				$senderStructure["props"]['object_type']     = $userprops[PR_OBJECT_TYPE];
				$senderStructure["props"]['recipient_type']  = MAPI_TO;
				$senderStructure["props"]['display_type']    = isset($userprops[PR_DISPLAY_TYPE])    ? $userprops[PR_DISPLAY_TYPE]    : MAPI_MAILUSER;
				$senderStructure["props"]['display_type_ex'] = isset($userprops[PR_DISPLAY_TYPE_EX]) ? $userprops[PR_DISPLAY_TYPE_EX] : MAPI_MAILUSER;
			}
			return $senderStructure;
		}

		/**
		 * Submit a message for sending
		 *
		 * This function is an extension of the saveMessage() function, with the extra functionality
		 * that the item is actually sent and queued for moving to 'Sent Items'. Also, the e-mail addresses
		 * used in the message are processed for later auto-suggestion.
		 *
		 * @see Operations::saveMessage() for more information on the parameters, which are identical.
		 *
		 * @param mapistore $store MAPI Message Store Object
		 * @param binary $entryid Entryid of the message
		 * @param array $props The properties to be saved
		 * @param array $messageProps reference to an array which will be filled with PR_ENTRYID, PR_PARENT_ENTRYID and PR_STORE_ENTRYID
		 * @param array $recipients XML array structure of recipients for the recipient table
		 * @param array $attachments array of attachments consisting unique ID of attachments for this message
		 * @param MAPIMessage $copyFromMessage resource of the message from which we should
		 * copy attachments and/or recipients to the current message.
		 * @param boolean $copyAttachments If set we copy all attachments from the $copyFromMessage.
		 * @param boolean $copyRecipients If set we copy all recipients from the $copyFromMessage.
		 * @param boolean $copyInlineAttachmentsOnly if true then copy only inline attachments.
		 * @return boolean true if action succeeded, false if not
		 */
		function submitMessage($store, $entryid, $props, &$messageProps, $recipients = array(), $attachments = array(), $copyFromMessage = false, $copyAttachments = false, $copyRecipients = false, $copyInlineAttachmentsOnly = false)
		{
			$result = false;
			$message = false;
			$origStore = $store;

			// Get the outbox and sent mail entryid, ignore the given $store, use the default store for submitting messages
			$store = $GLOBALS["mapisession"]->getDefaultMessageStore();
			$storeprops = mapi_getprops($store, array(PR_IPM_OUTBOX_ENTRYID, PR_IPM_SENTMAIL_ENTRYID, PR_ENTRYID));
			$origStoreprops = mapi_getprops($origStore, array(PR_ENTRYID));

			if(isset($storeprops[PR_IPM_OUTBOX_ENTRYID])) {
				if(isset($storeprops[PR_IPM_SENTMAIL_ENTRYID])) {
					$props[PR_SENTMAIL_ENTRYID] = $storeprops[PR_IPM_SENTMAIL_ENTRYID];
				}

				// Check if replying then set PR_INTERNET_REFERENCES and PR_IN_REPLY_TO_ID properties in props.
				// flag is probably used wrong here but the same flag indicates if this is reply or replyall
				if($copyInlineAttachmentsOnly){
					$origMsgProps = mapi_getprops($copyFromMessage, array(PR_INTERNET_MESSAGE_ID, PR_INTERNET_REFERENCES));
					if(isset($origMsgProps[PR_INTERNET_MESSAGE_ID])) {
						// The references header should indicate the message-id of the original
						// header plus any of the references which were set on the previous mail.
						$props[PR_INTERNET_REFERENCES] = $origMsgProps[PR_INTERNET_MESSAGE_ID];
						if (isset($origMsgProps[PR_INTERNET_REFERENCES])) {
							$props[PR_INTERNET_REFERENCES] = $origMsgProps[PR_INTERNET_REFERENCES] . ' ' . $props[PR_INTERNET_REFERENCES];
						}
						$props[PR_IN_REPLY_TO_ID] = $origMsgProps[PR_INTERNET_MESSAGE_ID];
					}
				}

				if (!$GLOBALS["entryid"]->compareStoreEntryIds(bin2hex($origStoreprops[PR_ENTRYID]), bin2hex($storeprops[PR_ENTRYID]))) {
					// set properties for "on behalf of" mails
					$origStoreProps = mapi_getprops($origStore, array(PR_MAILBOX_OWNER_ENTRYID, PR_MDB_PROVIDER));

					// set PR_SENDER_* properties, which contains currently logged users data
					$ab = $GLOBALS['mapisession']->getAddressbook();
					$abitem = mapi_ab_openentry($ab, $GLOBALS["mapisession"]->getUserEntryID());
					$abitemprops = mapi_getprops($abitem, array(PR_DISPLAY_NAME, PR_EMAIL_ADDRESS, PR_SEARCH_KEY));

					$props[PR_SENDER_ENTRYID] = $GLOBALS["mapisession"]->getUserEntryID();
					$props[PR_SENDER_NAME] = $abitemprops[PR_DISPLAY_NAME];
					$props[PR_SENDER_EMAIL_ADDRESS] = $abitemprops[PR_EMAIL_ADDRESS];
					$props[PR_SENDER_ADDRTYPE] = "ZARAFA";
					$props[PR_SENDER_SEARCH_KEY] = $abitemprops[PR_SEARCH_KEY];

					/**
					 * if delegate store then set PR_SENT_REPRESENTING_* properties
					 * based on delegate store's owner data
					 * if public store then set PR_SENT_REPRESENTING_* properties based on
					 * default store's owner data
					 */
					if($origStoreProps[PR_MDB_PROVIDER] === ZARAFA_STORE_DELEGATE_GUID) {
						$abitem = mapi_ab_openentry($ab, $origStoreProps[PR_MAILBOX_OWNER_ENTRYID]);
						$abitemprops = mapi_getprops($abitem, array(PR_DISPLAY_NAME, PR_EMAIL_ADDRESS, PR_SEARCH_KEY));

						$props[PR_SENT_REPRESENTING_ENTRYID] = $origStoreProps[PR_MAILBOX_OWNER_ENTRYID];
						$props[PR_SENT_REPRESENTING_NAME] = $abitemprops[PR_DISPLAY_NAME];
						$props[PR_SENT_REPRESENTING_EMAIL_ADDRESS] = $abitemprops[PR_EMAIL_ADDRESS];
						$props[PR_SENT_REPRESENTING_ADDRTYPE] = "ZARAFA";
						$props[PR_SENT_REPRESENTING_SEARCH_KEY] = $abitemprops[PR_SEARCH_KEY];
					} else if($origStoreProps[PR_MDB_PROVIDER] === ZARAFA_STORE_PUBLIC_GUID) {
						$props[PR_SENT_REPRESENTING_ENTRYID] = $props[PR_SENDER_ENTRYID];
						$props[PR_SENT_REPRESENTING_NAME] = $props[PR_SENDER_NAME];
						$props[PR_SENT_REPRESENTING_EMAIL_ADDRESS] = $props[PR_SENDER_EMAIL_ADDRESS];
						$props[PR_SENT_REPRESENTING_ADDRTYPE] = $props[PR_SENDER_ADDRTYPE];
						$props[PR_SENT_REPRESENTING_SEARCH_KEY] = $props[PR_SEARCH_KEY];
					}

					/**
					 * we are sending mail from delegate's account, so we can't use delegate's outbox and sent items folder
					 * so we have to copy the mail from delegate's store to logged user's store and in outbox folder and then
					 * we can send mail from logged user's outbox folder
					 *
					 * if we set $entryid to false before passing it to saveMessage function then it will assume
					 * that item doesn't exist and it will create a new item (in outbox of logged in user)
					 */
					if($entryid) {
						$oldEntryId = $entryid;
						$entryid = false;

						// if we are sending mail from drafts folder then we have to copy
						// its recipients and attachments also. $origStore and $oldEntryId points to mail
						// saved in delegators draft folder
						if($copyFromMessage === false) {
							$copyFromMessage = mapi_msgstore_openentry($origStore, $oldEntryId);
							$copyRecipients = true;

							// Decode smime signed messages on this message
							parse_smime($origStore, $copyFromMessage);
						}
					}

					if($copyFromMessage) {
						// Get properties of original message, to copy recipients and attachments in new message
						$copyMessageProps = mapi_getprops($copyFromMessage);
						$oldParentEntryId = $copyMessageProps[PR_PARENT_ENTRYID];

						// unset id properties before merging the props, so we will be creating new item instead of sending same item
						unset($copyMessageProps[PR_ENTRYID]);
						unset($copyMessageProps[PR_PARENT_ENTRYID]);
						unset($copyMessageProps[PR_STORE_ENTRYID]);

						// Merge original message props with props sent by client
						$props = $props + $copyMessageProps;
					}

					// Save the new message properties
					$message = $this->saveMessage($store, $entryid, $storeprops[PR_IPM_OUTBOX_ENTRYID], $props, $messageProps, $recipients, $attachments, array(), $copyFromMessage, $copyAttachments, $copyRecipients, $copyInlineAttachmentsOnly, true, true);

					// FIXME: currently message is deleted from original store and new message is created
					// in current user's store, but message should be moved

					// delete message from it's original location
					if(!empty($oldEntryId) && !empty($oldParentEntryId)) {
						$folder = mapi_msgstore_openentry($origStore, $oldParentEntryId);
						mapi_folder_deletemessages($folder, array($oldEntryId), DELETE_HARD_DELETE);
					}
				}else{
					// When the message is in your own store, just move it to your outbox. We move it manually so we know the new entryid after it has been moved.
					$outbox = mapi_msgstore_openentry($store, $storeprops[PR_IPM_OUTBOX_ENTRYID]);

					// Open the old and the new message
					$newmessage = mapi_folder_createmessage($outbox);
					$oldEntryId = $entryid;

					// Remember the new entryid
					$newprops = mapi_getprops($newmessage, array(PR_ENTRYID));
					$entryid = $newprops[PR_ENTRYID];

					if(!empty($oldEntryId)) {
						$message = mapi_msgstore_openentry($store, $oldEntryId);

						// Copy the entire message
						mapi_copyto($message, array(), array(), $newmessage);

						// Delete the old message
						mapi_folder_deletemessages($outbox, array($oldEntryId));
					}

					// save changes to new message created in outbox
					mapi_message_savechanges($newmessage);

					// Save the new message properties
					$message = $this->saveMessage($store, $entryid, $storeprops[PR_IPM_OUTBOX_ENTRYID], $props, $messageProps, $recipients, $attachments, array(), $copyFromMessage, $copyAttachments, $copyRecipients, $copyInlineAttachmentsOnly, true, true);
				}

				if($message) {
					// Allowing to hook in just before the data sent away to be sent to the client
					$GLOBALS['PluginManager']->triggerHook('server.core.operations.submitmessage', array(
						'moduleObject' => $this,
						'store' => $store,
						'entryid' => $entryid,
						'message' => &$message,
					));
					// Submit the message (send)
					mapi_message_submitmessage($message);

					$tmp_props = mapi_getprops($message, array(PR_PARENT_ENTRYID));
					$messageProps[PR_PARENT_ENTRYID] = $tmp_props[PR_PARENT_ENTRYID];
					$result = true;

					$this->addEmailsToRecipientHistory($recipients);
				}
			}

			return $result;
		}

		/**
		 * Delete messages
		 *
		 * This function does what is needed when a user presses 'delete' on a MAPI message. This means that:
		 *
		 * - Items in the own store are moved to the wastebasket
		 * - Items in the wastebasket are deleted
		 * - Items in other users stores are moved to our own wastebasket
		 * - Items in the public store are deleted
		 *
		 * @param mapistore $store MAPI Message Store Object
		 * @param string $parententryid parent entryid of the messages to be deleted
		 * @param array $entryids a list of entryids which will be deleted
		 * @param boolean $softDelete flag for soft-deleteing (when user presses Shift+Del)
		 * @return boolean true if action succeeded, false if not
		 */
		function deleteMessages($store, $parententryid, $entryids, $softDelete = false)
		{
			$result = false;
			if(!is_array($entryids)) {
				$entryids = array($entryids);
			}

			$folder = mapi_msgstore_openentry($store, $parententryid);

			$msgprops = mapi_getprops($store, array(PR_IPM_WASTEBASKET_ENTRYID, PR_MDB_PROVIDER));

			switch($msgprops[PR_MDB_PROVIDER]){
				case ZARAFA_STORE_DELEGATE_GUID:
					// with a store from an other user we need our own waste basket...
					if(isset($msgprops[PR_IPM_WASTEBASKET_ENTRYID]) && $msgprops[PR_IPM_WASTEBASKET_ENTRYID] == $parententryid || $softDelete == true) {
						// except when it is the waste basket itself
						$result = mapi_folder_deletemessages($folder, $entryids);
					}else{
						$defaultstore = $GLOBALS["mapisession"]->getDefaultMessageStore();
						$msgprops = mapi_getprops($defaultstore, array(PR_IPM_WASTEBASKET_ENTRYID, PR_MDB_PROVIDER));

						if(isset($msgprops[PR_IPM_WASTEBASKET_ENTRYID]) && $msgprops[PR_IPM_WASTEBASKET_ENTRYID] != $parententryid) {
							try {
								$result = $this->copyMessages($store, $parententryid, $defaultstore, $msgprops[PR_IPM_WASTEBASKET_ENTRYID], $entryids, array(), true);
							} catch (MAPIException $e) {
								$e->setHandled();
								// if moving fails, try normal delete
								$result = mapi_folder_deletemessages($folder, $entryids);
							}
						}else{
							$result = mapi_folder_deletemessages($folder, $entryids);
						}
					}
					break;
				case ZARAFA_STORE_ARCHIVER_GUID:
				case ZARAFA_STORE_PUBLIC_GUID:
					// always delete in public store and archive store
					$result = mapi_folder_deletemessages($folder, $entryids);
					break;

				case ZARAFA_SERVICE_GUID:
					// delete message when in your own waste basket, else move it to the waste basket
					if(isset($msgprops[PR_IPM_WASTEBASKET_ENTRYID]) && $msgprops[PR_IPM_WASTEBASKET_ENTRYID] == $parententryid  || $softDelete == true) {
						$result = mapi_folder_deletemessages($folder, $entryids);
					}else{
						try {
							$result = $this->copyMessages($store, $parententryid, $store, $msgprops[PR_IPM_WASTEBASKET_ENTRYID], $entryids, array(), true);
						} catch (MAPIException $e) {
							$e->setHandled();
							// if moving fails, try normal delete
							$result = mapi_folder_deletemessages($folder, $entryids);
						}
					}
					break;
			}

			return $result;
		}

		/**
		 * Copy or move messages
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $parententryid parent entryid of the messages
		 * @param string $destentryid destination folder
		 * @param array $entryids a list of entryids which will be copied or moved
		 * @param array $ignoreProps a list of proptags which should not be copied over
		 * to the new message
		 * @param boolean $moveMessages true - move messages, false - copy messages
		 * @return boolean true if action succeeded, false if not
		 */
		function copyMessages($store, $parententryid, $destStore, $destentryid, $entryids, $ignoreProps, $moveMessages)
		{
			$sourcefolder = mapi_msgstore_openentry($store, $parententryid);
			$destfolder = mapi_msgstore_openentry($destStore, $destentryid);

			if(!is_array($entryids)) {
				$entryids = array($entryids);
			}

			foreach ($entryids as $entryid) {
				$oldmessage = mapi_msgstore_openentry($store, $entryid);
				$newmessage = mapi_folder_createmessage($destfolder);

				mapi_copyto($oldmessage, array(), $ignoreProps, $newmessage, 0);
				mapi_savechanges($newmessage);
			}

			if ($moveMessages) {
				// while moving message we actually copy that particular message into
				// destination folder, and remove it from source folder. so we must have
				// to hard delete the message.
				mapi_folder_deletemessages($sourcefolder, $entryids, DELETE_HARD_DELETE);
			}

			return true;
		}

		/**
		 * Set message read flag
		 *
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid entryid of the message
		 * @param array $flags Array of options, may contain "unread" and "noreceipt". The absence of these flags indicate the opposite ("read" and "sendreceipt").
		 * @param array $messageProps reference to an array which will be filled with PR_ENTRYID, PR_STORE_ENTRYID and PR_PARENT_ENTRYID of the message
		 * @param array $props properties of the message
		 * @return boolean true if action succeeded, false if not
		 */
		function setMessageFlag($store, $entryid, $flags, $msg_action = false, &$props = false)
		{
			$message = $this->openMessage($store, $entryid);

			if($message) {
				/**
				 * convert flags of PR_MESSAGE_FLAGS property to flags that is
				 * used in mapi_message_setreadflag
				 */
				$flag = MAPI_DEFERRED_ERRORS;		// set unread flag, read receipt will be sent

				if(($flags & MSGFLAG_RN_PENDING) && isset($msg_action['send_read_receipt']) && $msg_action['send_read_receipt'] == false) {
					$flag |= SUPPRESS_RECEIPT;
				} else {
					if(!($flags & MSGFLAG_READ)) {
						$flag |= CLEAR_READ_FLAG;
					}
				}

				mapi_message_setreadflag($message, $flag);

				if(is_array($props)) {
					$props = mapi_getprops($message, array(PR_ENTRYID, PR_STORE_ENTRYID, PR_PARENT_ENTRYID));
				}
			}

			return true;
		}

		/**
		 * Create a unique folder name based on a provided new folder name
		 *
		 * checkFolderNameConflict() checks if a folder name conflict is caused by the given $foldername.
		 * This function is used for copying of moving a folder to another folder. It returns
		 * a unique foldername.
		 *
		 * @access private
		 * @param object $store MAPI Message Store Object
		 * @param object $folder MAPI Folder Object
		 * @param string $foldername the folder name
		 * @return string correct foldername
		 */
		function checkFolderNameConflict($store, $folder, $foldername)
		{
			$folderNames = array();

			$hierarchyTable = mapi_folder_gethierarchytable($folder, MAPI_DEFERRED_ERRORS);
			mapi_table_sort($hierarchyTable, array(PR_DISPLAY_NAME => TABLE_SORT_ASCEND), TBL_BATCH);

			$subfolders = mapi_table_queryallrows($hierarchyTable, array(PR_ENTRYID));

			if (is_array($subfolders)) {
				foreach($subfolders as $subfolder)
				{
					$folderObject = mapi_msgstore_openentry($store, $subfolder[PR_ENTRYID]);
					$folderProps = mapi_folder_getprops($folderObject, array(PR_DISPLAY_NAME));

					array_push($folderNames, strtolower($folderProps[PR_DISPLAY_NAME]));
				}
			}

			if(array_search(strtolower($foldername), $folderNames) !== false) {
				$i = 1;

				while(array_search((strtolower($foldername) . $i), $folderNames) !== false)
				{
					$i++;
				}

				$foldername .= $i;
			}

			return $foldername;
		}

		/**
		 * Set the recipients of a MAPI message
		 *
		 * @access private
		 * @param object $message MAPI Message Object
		 * @param array $recipients XML array structure of recipients
		 * @param boolean $send true if we are going to send this message else false
		 */
		function setRecipients($message, $recipients, $send = false)
		{
			if(empty($recipients)) {
				// no recipients are sent from client
				return;
			}

			$newRecipients = array();
			$removeRecipients = array();
			$modifyRecipients = array();

			if(isset($recipients['add']) && !empty($recipients['add'])) {
				$newRecipients = $this->createRecipientList($recipients['add'], 'add', false, $send);
			}

			if(isset($recipients['remove']) && !empty($recipients['remove'])) {
				$removeRecipients = $this->createRecipientList($recipients['remove'], 'remove');
			}

			if(isset($recipients['modify']) && !empty($recipients['modify'])) {
				$modifyRecipients = $this->createRecipientList($recipients['modify'], 'modify', false, $send);
			}

			if(!empty($removeRecipients)){
				mapi_message_modifyrecipients($message, MODRECIP_REMOVE, $removeRecipients);
			}

			if(!empty($modifyRecipients)){
				mapi_message_modifyrecipients($message, MODRECIP_MODIFY, $modifyRecipients);
			}

			if(!empty($newRecipients)){
				mapi_message_modifyrecipients($message, MODRECIP_ADD, $newRecipients);
			}
		}

		/**
		 * Copy recipients from original message
		 *
		 * If we are sending mail from a delegator's folder, we need to copy all recipients from the original message
		 * @access private
		 * @param object $message MAPI Message Object
		 * @param MAPIMessage $copyFromMessage If set we copy all recipients from this message
		 */
		function copyRecipients($message, $copyFromMessage = false)
		{
			$recipienttable = mapi_message_getrecipienttable($copyFromMessage);
			$messageRecipients = mapi_table_queryallrows($recipienttable, $GLOBALS["properties"]->getRecipientProperties());
			if(!empty($messageRecipients)) {
				mapi_message_modifyrecipients($message, MODRECIP_ADD, $messageRecipients);
			}
		}

		/**
		 * Delete properties in a message
		 *
		 * @todo Why does this function call savechange while most other functions
		 *       here do not? (for example setRecipients)
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid Entryid of the message in which to delete the properties
		 * @param array $props array of property tags which to be deleted
		 */
		function deleteProps($store, $entryid, $props)
		{
			$message = $this->openMessage($store, $entryid);
			mapi_deleteprops($message, $props);
			mapi_savechanges($message);
		}

		/**
		 * Set attachments in a MAPI message
		 *
		 * This function reads any attachments that have been previously uploaded and copies them into
		 * the passed MAPI message resource. For a description of the dialog_attachments variable and
		 * generally how attachments work when uploading, see Operations::saveMessage()
		 *
		 * @see Operations::saveMessage()
		 * @param object $message MAPI Message Object
		 * @param array $attachments XML array structure of attachments
		 * @param AttachmentState $attachment_state The state object in which the attachments are saved
		 * between different requests.
		 */
		function setAttachments($message, $attachments = array(), $attachment_state)
		{
			// Check if attachments should be deleted. This is set in the "upload_attachment.php" file
			if (isset($attachments['dialog_attachments'])) {
				$deleted = $attachment_state->getDeletedAttachments($attachments['dialog_attachments']);
				if ($deleted) {
					foreach ($deleted as $attach_num) {
						mapi_message_deleteattach($message, (int) $attach_num);
					}
					$attachment_state->clearDeletedAttachments($attachments['dialog_attachments']);
				}
			}

			$addedInlineAttachmentCidMapping = Array();
			if(is_array($attachments) && !empty($attachments)) {
				// Set contentId to saved attachments.
				if(isset($attachments['add']) && is_array($attachments['add']) && !empty($attachments['add'])) {
					foreach($attachments['add'] as $key => $attach) {
						if($attach && isset($attach['inline']) && $attach['inline']) {
							$addedInlineAttachmentCidMapping[ $attach['attach_num'] ] = $attach['cid'];
							$msgattachment = mapi_message_openattach($message, $attach['attach_num']);
							if($msgattachment) {
								$props = array(PR_ATTACH_CONTENT_ID => $attach['cid'], PR_ATTACHMENT_HIDDEN => true);
								mapi_setprops($msgattachment, $props);
								mapi_savechanges($msgattachment);
							}
						}
					}
				}

				// Delete saved inline images if removed from body.
				if(isset($attachments['remove']) && is_array($attachments['remove']) && !empty($attachments['remove'])) {
					foreach($attachments['remove'] as $key => $attach) {
						if($attach && isset($attach['inline']) && $attach['inline']) {
							$msgattachment = mapi_message_openattach($message, $attach['attach_num']);
							if($msgattachment) {
								mapi_message_deleteattach($message, $attach['attach_num']);
								mapi_savechanges($message);
							}
						}
					}
				}
			}

			if($attachments['dialog_attachments']) {
				$dialog_attachments = $attachments['dialog_attachments'];
			} else {
				return;
			}

			$files = $attachment_state->getAttachmentFiles($dialog_attachments);
			if ($files) {
				// Loop through the uploaded attachments
				foreach ($files as $tmpname => $fileinfo) {
					if($fileinfo['sourcetype'] === 'embedded') {
						// open message which needs to be embedded
						$copyFromStore = $GLOBALS['mapisession']->openMessageStore(hex2bin($fileinfo['store_entryid']));
						$copyFrom = mapi_msgstore_openentry($copyFromStore , hex2bin($fileinfo['entryid']));

						$msgProps = mapi_getprops($copyFrom, array(PR_SUBJECT));

						// get message and copy it to attachment table as embedded attachment
						$props = array();
						$props[PR_ATTACH_METHOD] = ATTACH_EMBEDDED_MSG;
						$props[PR_DISPLAY_NAME] = !empty($msgProps[PR_SUBJECT]) ? $msgProps[PR_SUBJECT] : _('Untitled');

						// Create new attachment.
						$attachment = mapi_message_createattach($message);
						mapi_message_setprops($attachment, $props);

						$imessage = mapi_attach_openobj($attachment, MAPI_CREATE | MAPI_MODIFY);

						// Copy the properties from the source message to the attachment
						mapi_copyto($copyFrom, array(), array(), $imessage, 0); // includes attachments and recipients

						// save changes in the embedded message and the final attachment
						mapi_savechanges($imessage);
						mapi_savechanges($attachment);
					} else {
						$filepath = $attachment_state->getAttachmentPath($tmpname);
						if (is_file($filepath)) {

							// Set contentId if attachment is inline
							$cid = '';
							if(isset($addedInlineAttachmentCidMapping[ $tmpname ])){
								$cid = $addedInlineAttachmentCidMapping[ $tmpname ];
							}

							// Set attachment properties
							$props = Array(
								PR_ATTACH_LONG_FILENAME => $fileinfo["name"],
								PR_DISPLAY_NAME => $fileinfo["name"],
								PR_ATTACH_METHOD => ATTACH_BY_VALUE,
								PR_ATTACH_DATA_BIN => "",
								PR_ATTACH_MIME_TAG => $fileinfo["type"],
								PR_ATTACHMENT_HIDDEN => !empty($cid) ? true : false
							);

							if(isset($fileinfo['sourcetype']) && $fileinfo['sourcetype'] === 'contactphoto') {
								$props[PR_ATTACHMENT_HIDDEN] = true;
								$props[PR_ATTACHMENT_CONTACTPHOTO] = true;
							}

							if (!empty($cid)) {
								$props[PR_ATTACH_CONTENT_ID] = $cid;
							}

							// Create attachment and set props
							$attachment = mapi_message_createattach($message);
							mapi_setprops($attachment, $props);

							// Stream the file to the PR_ATTACH_DATA_BIN property
							$stream = mapi_openproperty($attachment, PR_ATTACH_DATA_BIN, IID_IStream, 0, MAPI_CREATE | MAPI_MODIFY);
							$handle = fopen($filepath, "r");
							while (!feof($handle))
							{
								$contents = fread($handle, BLOCK_SIZE);
								mapi_stream_write($stream, $contents);
							}

							// Commit the stream and save changes
							mapi_stream_commit($stream);
							mapi_savechanges($attachment);
							fclose($handle);
							unlink($filepath);
						}
					}
				}

				// Delete all the files in the state.
				$attachment_state->clearAttachmentFiles($dialog_attachments);
			}
		}

		/**
		 * Copy attachments from original message
		 *
		 * @see Operations::saveMessage()
		 *
		 * @param object $message MAPI Message Object
		 * @param string $dialog_attachments For a description of the dialog_attachments variable and generally how attachments work when uploading, see Operations::saveMessage()
		 * @param MAPIMessage $copyFromMessage if set, copy the attachments from this message in addition to the uploaded attachments
		 * @param boolean $copyInlineAttachmentsOnly if true then copy only inline attachments.
		 * @param AttachmentState $attachment_state The state object in which the attachments are saved
		 * between different requests.
		 */
		function copyAttachments($message, $attachments = false, $copyFromMessage = false, $copyInlineAttachmentsOnly = false, $attachment_state)
		{
			$attachmentTable = mapi_message_getattachmenttable($copyFromMessage);
			if ($attachmentTable && isset($attachments['dialog_attachments'])) {
				$existingAttachments = mapi_table_queryallrows($attachmentTable, array(PR_ATTACH_NUM, PR_ATTACH_SIZE, PR_ATTACH_LONG_FILENAME, PR_ATTACHMENT_HIDDEN, PR_DISPLAY_NAME, PR_ATTACH_METHOD));
				$deletedAttachments = $attachment_state->getDeletedAttachments($attachments['dialog_attachments']);

				$plainText = $this->isPlainText($message);

				$properties = $GLOBALS['properties']->getMailProperties();
				$blockStatus = mapi_getprops($copyFromMessage, array(PR_BLOCK_STATUS));
				$blockStatus = Conversion::mapMAPI2XML($properties, $blockStatus);
				$isSafeSender = false;

				// Here if message is HTML and block status is empty then and then call isSafeSender function
				// to check that sender or sender's domain of original message was part of safe sender list.
				if(!$plainText && empty($blockStatus)) {
					$isSafeSender = $this->isSafeSender($copyFromMessage);
				}

				foreach($existingAttachments as $props) {
					// check if this attachment is "deleted"

					if ($deletedAttachments && in_array($props[PR_ATTACH_NUM], $deletedAttachments)) {
						// skip attachment, remove reference from state as it no longer applies.
						$attachment_state->removeDeletedAttachment($attachments['dialog_attachments'], $props[PR_ATTACH_NUM]);
						continue;
					}

					$old = mapi_message_openattach($copyFromMessage, $props[PR_ATTACH_NUM]);
					$oldProps = mapi_getprops($old, array(PR_ATTACH_CONTENT_ID));
					$isSetContentID = isset($oldProps[PR_ATTACH_CONTENT_ID]);

					/**
					 * If reply/reply all message, then copy only inline attachments.
					 */
					if($copyInlineAttachmentsOnly) {
						/**
						 * if message is reply/reply all and format is plain text than ignore inline attachments 
						 * and normal attachments to copy from original mail.
						 */
						if($plainText || !$isSetContentID) {
							continue;
						}
					} else if($plainText && $isSetContentID) {
						/**
						 * If message is forward and format of message is plain text then ignore only inline attachments from the 
						 * original mail.
						 */
						continue;
					}

					/**
					 * if message is reply/reply all or forward and format of message is HTML but 
					 * - inline attachments are not downloaded from external source 
					 * - sender of original message is not safe sender 
					 * - domain of sender is not part of safe sender list
					 * then ignore inline attachments from original message.
					 * 
					 * NOTE : blockStatus is only generated when user has download inline image from external source.
					 * it should remains empty if user add the sender in to safe sender list.
					 */
					if(!$plainText && $isSetContentID && empty($blockStatus) && !$isSafeSender) {
						continue;
					}

					$new = mapi_message_createattach($message);
					mapi_copyto($old, array(), array(), $new, 0);
					mapi_savechanges($new);
				}
			}
		}

		/**
		 * Function was used to identify the sender or domain of original mail in safe sender list.
		 * @param MAPIMessage $copyFromMessage resource of the message from which we should get
		 * the sender of message.
		 * @return boolean true if sender of original mail was safe sender else false.
		 */
		function isSafeSender($copyFromMessage)
		{
			$safeSenderList = $GLOBALS['settings']->get('zarafa/v1/contexts/mail/safe_senders_list');
			$senderEntryid = mapi_getprops($copyFromMessage, array(PR_SENT_REPRESENTING_ENTRYID));
			$senderEntryid = $senderEntryid[PR_SENT_REPRESENTING_ENTRYID];
			$mailuser = mapi_ab_openentry($GLOBALS["mapisession"]->getAddressbook(), $senderEntryid);
			$addressType = mapi_getprops($mailuser,array(PR_ADDRTYPE));

			// Here it will check that sender of original mail was address book user. 
			// If PR_ADDRTYPE is ZARAFA, it means sender of original mail was address book contact.
			if($addressType[PR_ADDRTYPE] === 'ZARAFA'){
				$address = mapi_getprops($mailuser,array(PR_SMTP_ADDRESS));
				$address = $address[PR_SMTP_ADDRESS];
			} else if($addressType[PR_ADDRTYPE] === 'SMTP') {

				//If PR_ADDRTYPE is SMTP, it means sender of original mail was external sender.
				$address = mapi_getprops($mailuser,array(PR_EMAIL_ADDRESS));
				$address = $address[PR_EMAIL_ADDRESS];
			}

			// Obtain the Domain address from smtp/email address.
			$domain = substr($address, (strpos($address,"@") + 1));

			if(!empty($safeSenderList)){
				foreach($safeSenderList as $safeSender) {
					if($safeSender === $address || $safeSender === $domain) {
						return true;
					}
				}
			}
			return false;
		}

		/**
		 * get attachments information of a particular message
		 *
		 * @param MapiStore $store MAPI Store Object
		 * @param MapiMessage $message MAPI Message Object
		 * @param Boolean $excludeHidden exclude hidden attachments
		 */
		function getAttachmentsInfo($store, $message, $excludeHidden = false)
		{
			$attachmentsInfo = array();

			$hasattachProp = mapi_getprops($message, array(PR_HASATTACH));
			if (isset($hasattachProp[PR_HASATTACH]) && $hasattachProp[PR_HASATTACH]) {
				$attachmentTable = mapi_message_getattachmenttable($message);

				$attachments = mapi_table_queryallrows($attachmentTable, array(PR_ATTACH_NUM, PR_ATTACH_SIZE, PR_ATTACH_LONG_FILENAME,
																			PR_ATTACH_FILENAME, PR_ATTACHMENT_HIDDEN, PR_DISPLAY_NAME, PR_ATTACH_METHOD,
																			PR_ATTACH_CONTENT_ID, PR_ATTACH_MIME_TAG,
																			PR_ATTACHMENT_CONTACTPHOTO, PR_OBJECT_TYPE));
				foreach($attachments as $attachmentRow) {
					$props = array();

					if(isset($attachmentRow[PR_ATTACH_MIME_TAG])) {
						if($attachmentRow[PR_ATTACH_MIME_TAG]) {
							$props["filetype"] = $attachmentRow[PR_ATTACH_MIME_TAG];
						}

						$smimeTags = array('multipart/signed', 'application/pkcs7-mime', 'application/x-pkcs7-mime');
						if(in_array($attachmentRow[PR_ATTACH_MIME_TAG], $smimeTags)) {
							// Ignore the message with attachment types set as smime as they are for smime
							continue;
						}
					}

					$props["object_type"] = $attachmentRow[PR_OBJECT_TYPE];
					$props["attach_num"] = $attachmentRow[PR_ATTACH_NUM];
					$props["attach_method"] = $attachmentRow[PR_ATTACH_METHOD];
					$props["size"] = $attachmentRow[PR_ATTACH_SIZE];

					if(isset($attachmentRow[PR_ATTACH_CONTENT_ID]) && $attachmentRow[PR_ATTACH_CONTENT_ID]) {
						$props["cid"] = $attachmentRow[PR_ATTACH_CONTENT_ID];
					}

					$props["hidden"] = isset($attachmentRow[PR_ATTACHMENT_HIDDEN]) ? $attachmentRow[PR_ATTACHMENT_HIDDEN] : false;
					if($excludeHidden && $props["hidden"]) {
						continue;
					}

					if(isset($attachmentRow[PR_ATTACH_LONG_FILENAME])) {
						$props["name"] = $attachmentRow[PR_ATTACH_LONG_FILENAME];
					} else if(isset($attachmentRow[PR_ATTACH_FILENAME])) {
						$props["name"] = $attachmentRow[PR_ATTACH_FILENAME];
					} else if(isset($attachmentRow[PR_DISPLAY_NAME])) {
						$props["name"] = $attachmentRow[PR_DISPLAY_NAME];
					} else {
						$props["name"] = "untitled";
					}

					if(isset($attachmentRow[PR_ATTACHMENT_CONTACTPHOTO]) && $attachmentRow[PR_ATTACHMENT_CONTACTPHOTO]) {
						$props["attachment_contactphoto"] = $attachmentRow[PR_ATTACHMENT_CONTACTPHOTO];
						$props["hidden"] = true;

						//Open contact photo attachement in binary format.
						$attach = mapi_message_openattach($message, $props["attach_num"]);
						$photo = mapi_attach_openbin($attach,PR_ATTACH_DATA_BIN);

						// Process photo and restrict its size to 96.
						if ($photo) {
							$compressionRatio=1;
							for ($length=2, $len = strlen($photo); $length <= $len;) {
								$partinfo = unpack("Cmarker/Ccode/nlength",substr($photo,$length,4));
								if ($partinfo['marker'] != 0xff) break; // error in structure???
								if ($partinfo['code'] >= 0xc0 &&
									$partinfo['code'] <= 0xc3) { // this is the size block
									$photo_size = unpack("Cunknown/ny/nx",substr($photo,$length+4,5));
									// find the resize factor, picture should be not higher than 96 pixel.
									$compressionRatio = ceil($photo_size['y']/96);
									break;
								} else { // jump to next block
									$length = $length+$partinfo['length']+2;
								}
							}
							if ($partinfo['marker'] == 0xff) {
								$props["attachment_contactphoto_sizex"] = (int)($photo_size['x'] / $compressionRatio);
								$props["attachment_contactphoto_sizey"] = (int)($photo_size['y'] / $compressionRatio);
							}
						}
					}

					if ($props["attach_method"] == ATTACH_EMBEDDED_MSG){
						// open attachment to get the message class
						$attach = mapi_message_openattach($message, $props["attach_num"]);
						$embMessage = mapi_attach_openobj($attach);
						$embProps = mapi_getprops($embMessage, array(PR_MESSAGE_CLASS));
						if (isset($embProps[PR_MESSAGE_CLASS])) {
							$props["attach_message_class"] = $embProps[PR_MESSAGE_CLASS];
						}
					}

					array_push($attachmentsInfo, array( "props" => $props ));
				}
			}

			return $attachmentsInfo;
		}

		/**
		 * get recipients information of a particular message
		 *
		 * @param MapiStore $store MAPI Store Object
		 * @param MapiMessage $message MAPI Message Object
		 * @param Boolean $excludeDeleted exclude deleted recipients
		 */
		function getRecipientsInfo($store, $message, $excludeDeleted = true)
		{
			$recipientsInfo = array();

			$recipientTable = mapi_message_getrecipienttable($message);
			if($recipientTable) {
				$recipients = mapi_table_queryallrows($recipientTable, $GLOBALS['properties']->getRecipientProperties());

				foreach($recipients as $recipientRow) {
					if ($excludeDeleted && isset($recipientRow[PR_RECIPIENT_FLAGS]) && (($recipientRow[PR_RECIPIENT_FLAGS] & recipExceptionalDeleted) == recipExceptionalDeleted)) {
						continue;
					}

					$props = array();
					$props['rowid'] = $recipientRow[PR_ROWID];
					$props['search_key'] = isset($recipientRow[PR_SEARCH_KEY]) ? bin2hex($recipientRow[PR_SEARCH_KEY]) : '';
					$props['display_name'] = isset($recipientRow[PR_DISPLAY_NAME]) ? $recipientRow[PR_DISPLAY_NAME] : '';
					$props['email_address'] = isset($recipientRow[PR_EMAIL_ADDRESS]) ? $recipientRow[PR_EMAIL_ADDRESS] : '';
					$props['smtp_address'] = isset($recipientRow[PR_SMTP_ADDRESS]) ? $recipientRow[PR_SMTP_ADDRESS] : '';
					$props['address_type'] = isset($recipientRow[PR_ADDRTYPE]) ? $recipientRow[PR_ADDRTYPE] : '';
					$props['object_type'] = $recipientRow[PR_OBJECT_TYPE];
					$props['recipient_type'] = $recipientRow[PR_RECIPIENT_TYPE];
					$props['display_type'] = isset($recipientRow[PR_DISPLAY_TYPE]) ? $recipientRow[PR_DISPLAY_TYPE] : DT_MAILUSER;

					// PR_DISPLAY_TYPE_EX is special property and is not present in ContentsTable so we need to
					// get it by using OpenEntry
					$props['display_type_ex'] = DT_MAILUSER;
					if($props['address_type'] === 'ZARAFA') {
						try {
							$mailuser = mapi_ab_openentry($GLOBALS["mapisession"]->getAddressbook(), $recipientRow[PR_ENTRYID]);
							$userprops = mapi_getprops($mailuser, array(PR_DISPLAY_TYPE_EX));
							$props['display_type_ex'] = $userprops[PR_DISPLAY_TYPE_EX];
						} catch (MAPIException $e) {
							// if any invalid entryid is passed in this function then it should silently ignore it
							// and continue with execution
							if($e->getCode() == MAPI_E_UNKNOWN_ENTRYID) {
								$e->setHandled();
							}
						}
					}

					if(isset($recipientRow[PR_RECIPIENT_FLAGS])) {
						$props['recipient_flags'] = $recipientRow[PR_RECIPIENT_FLAGS];
					}

					if(isset($recipientRow[PR_ENTRYID])) {
						$props['entryid'] = bin2hex($recipientRow[PR_ENTRYID]);

						// Get the SMTP address from the addressbook if no address is found
						if(empty($props['smtp_address']) && $recipientRow[PR_ADDRTYPE] == 'ZARAFA') {
							$props['smtp_address'] = $GLOBALS['operations']->getEmailAddressFromEntryID($recipientRow[PR_ENTRYID]);
						}
					}

					// smtp address is still empty(in case of external email address) than
					// value of email address is copied into smtp address.
					if($props['address_type'] == 'SMTP' && empty($props['smtp_address'])) {
						$props['smtp_address'] = $props['email_address'];
					}

					// Set propose new time properties
					if(isset($recipientRow[PR_PROPOSEDNEWTIME]) && isset($recipientRow[PR_PROPOSEDNEWTIME_START]) && isset($recipientRow[PR_PROPOSEDNEWTIME_END])) {
						$props['proposednewtime_start'] = $recipientRow[PR_PROPOSEDNEWTIME_START];
						$props['proposednewtime_end'] = $recipientRow[PR_PROPOSEDNEWTIME_END];
						$props['proposednewtime'] = $recipientRow[PR_PROPOSEDNEWTIME];
					} else {
						$props['proposednewtime'] = false;
					}

					$props['recipient_trackstatus'] = !empty($recipientRow[PR_RECIPIENT_TRACKSTATUS]) ? $recipientRow[PR_RECIPIENT_TRACKSTATUS] : olRecipientTrackStatusNone;
					$props['recipient_trackstatus_time'] = !empty($recipientRow[PR_RECIPIENT_TRACKSTATUS_TIME]) ? $recipientRow[PR_RECIPIENT_TRACKSTATUS_TIME] : null;

					array_push($recipientsInfo, array( "props" => $props ));
				}
			}

			return $recipientsInfo;
		}

		/**
		 * Create a MAPI recipient list from an XML array structure
		 *
		 * This functions is used for setting the recipient table of a message.
		 * @param array $recipientList a list of recipients as XML array structure
		 * @param string $opType the type of operation that will be performed on this recipient list (add, remove, modify).
		 * @param boolean $send true if we are going to send this message else false.
		 * @return array list of recipients with the correct MAPI properties ready for mapi_message_modifyrecipients()
		 */
		function createRecipientList($recipientList, $opType = 'add', $isException = false, $send = false)
		{
			$recipients = array();
			$addrbook = $GLOBALS["mapisession"]->getAddressbook();

			foreach($recipientList as $recipientItem) {
				if ($isException) {
					// We do not add organizer to exception msg in organizer's calendar.
					if (isset($recipientItem[PR_RECIPIENT_FLAGS]) && $recipientItem[PR_RECIPIENT_FLAGS] == (recipSendable | recipOrganizer))
						continue;

					$recipient[PR_RECIPIENT_FLAGS] = (recipSendable | recipExceptionalResponse | recipReserved);
				}

				if(!empty($recipientItem["smtp_address"]) && empty($recipientItem["email_address"])){
					$recipientItem["email_address"] = $recipientItem["smtp_address"];
				}

				// When saving a mail we can allow an empty email address or entryid, but not when sending it
				if(empty($recipientItem["display_name"]) || ($send && empty($recipientItem["email_address"]) && empty($recipientItem['entryid']))) {
					return;
				}

				// to modify or remove recipients we need PR_ROWID property
				if($opType !== 'add' && ( !isset($recipientItem['rowid']) || !is_numeric($recipientItem['rowid']) )) {
					continue;
				}

				if (isset($recipientItem['search_key']) && !empty($recipientItem['search_key'])) {
					// search keys sent from client are in hex format so convert it to binary format
					$recipientItem['search_key'] = hex2bin($recipientItem['search_key']);
				}

				if(isset($recipientItem["entryid"]) && !empty($recipientItem["entryid"])) {
					// entryids sent from client are in hex format so convert it to binary format
					$recipientItem["entryid"] = hex2bin($recipientItem["entryid"]);

				// Only resolve the recipient when no entryid is set
				}else{
					/**
					 * For external contacts (DT_REMOTE_MAILUSER) email_address contains display name of contact
					 * which is obviously not unique so for that we need to resolve address based on smtp_address
					 * if provided
					 */
					$addressToResolve = $recipientItem["email_address"];
					if(!empty($recipientItem["smtp_address"])) {
						$addressToResolve = $recipientItem["smtp_address"];
					}

					// Resolve the recipient
					$user = array( array( PR_DISPLAY_NAME => $addressToResolve ) );
					try {
						// resolve users based on email address with strict matching
						$user = mapi_ab_resolvename($addrbook, $user, EMS_AB_ADDRESS_LOOKUP);
						$recipientItem["display_name"] = $user[0][PR_DISPLAY_NAME];
						$recipientItem["entryid"] = $user[0][PR_ENTRYID];
						$recipientItem["search_key"] = $user[0][PR_SEARCH_KEY];
						$recipientItem["email_address"] = $user[0][PR_EMAIL_ADDRESS];
						$recipientItem["address_type"] = $user[0][PR_ADDRTYPE];
					} catch (MAPIException $e) {
						// recipient is not resolved or it got multiple matches,
						// so ignore this error and continue with normal processing
						$e->setHandled();
					}
				}

				$recipient = array();
				$recipient[PR_DISPLAY_NAME] = $recipientItem["display_name"];
				$recipient[PR_DISPLAY_TYPE] = $recipientItem["display_type"];
				$recipient[PR_DISPLAY_TYPE_EX] = $recipientItem["display_type_ex"];
				$recipient[PR_EMAIL_ADDRESS] = $recipientItem["email_address"];
				$recipient[PR_SMTP_ADDRESS] = $recipientItem["smtp_address"];
				if(isset($recipientItem["search_key"])) {
					$recipient[PR_SEARCH_KEY] = $recipientItem["search_key"];
				}
				$recipient[PR_ADDRTYPE] = $recipientItem["address_type"];
				$recipient[PR_OBJECT_TYPE] = $recipientItem["object_type"];
				$recipient[PR_RECIPIENT_TYPE] = $recipientItem["recipient_type"];
				if($opType != 'add') {
					$recipient[PR_ROWID] = $recipientItem["rowid"];
				}

				if (isset($recipientItem["recipient_status"]) && !empty($recipientItem["recipient_status"])){
					$recipient[PR_RECIPIENT_TRACKSTATUS] = $recipientItem["recipient_status"];
				}

				if(isset($recipientItem["recipient_flags"]) && !empty($recipient["recipient_flags"])){
					$recipient[PR_RECIPIENT_FLAGS] = $recipientItem["recipient_flags"];
				}else{
					$recipient[PR_RECIPIENT_FLAGS] = recipSendable;
				}

				if(isset($recipientItem["proposednewtime"]) && !empty($recipientItem["proposednewtime"]) && isset($recipientItem["proposednewtime_start"]) && isset($recipientItem["proposednewtime_end"])){
					$recipient[PR_PROPOSEDNEWTIME] = $recipientItem["proposednewtime"];
					$recipient[PR_PROPOSEDNEWTIME_START] = $recipientItem["proposednewtime_start"];
					$recipient[PR_PROPOSEDNEWTIME_END] = $recipientItem["proposednewtime_end"];
				} else {
					$recipient[PR_PROPOSEDNEWTIME] = false;
				}

				// Use given entryid if possible, otherwise create a one-off entryid
				if(isset($recipientItem["entryid"]) && !empty($recipientItem["entryid"])) {
					$recipient[PR_ENTRYID] = $recipientItem["entryid"];
				} else if ($send) {
					// only create one-off entryid when we are actually sending the message not saving it
					$recipient[PR_ENTRYID] = mapi_createoneoff($recipient[PR_DISPLAY_NAME], $recipient[PR_ADDRTYPE], $recipient[PR_EMAIL_ADDRESS]);
				}

				array_push($recipients, $recipient);
			}

			return $recipients;
		}

		/**
		 * Parse reply-to value from PR_REPLY_RECIPIENT_ENTRIES property
		 * @param string $flatEntryList the PR_REPLY_RECIPIENT_ENTRIES value
		 * @return array list of recipients in XML array structure
		 */
		function readReplyRecipientEntry($flatEntryList)
		{
			$addressbook = $GLOBALS["mapisession"]->getAddressbook();
			$entryids = array();

			// Unpack number of entries, the byte count and the entries
			$unpacked = unpack('V1cEntries/V1cbEntries/a*', $flatEntryList);

			// $unpacked consists now of the following fields:
			//	'cEntries' => The number of entryids in our list
			//	'cbEntries' => The total number of bytes inside 'abEntries'
			//	'abEntries' => The list of Entryids
			//
			// Each 'abEntries' can be broken down into groups of 2 fields
			//	'cb' => The length of the entryid
			//	'entryid' => The entryid

			$position = 8; // sizeof(cEntries) + sizeof(cbEntries);

			for ($i = 0, $len = $unpacked['cEntries']; $i < $len; $i++) {
				// Obtain the size for the current entry
				$size = unpack('a' . $position . '/V1cb/a*', $flatEntryList);

				// We have the size, now can can obtain the bytes
				$entryid = unpack('a' . $position . '/V1cb/a' . $size['cb'] . 'entryid/a*', $flatEntryList);

				// unpack() will remove the NULL characters, readd
				// them until we match the 'cb' length.
				while ($entryid['cb'] > strlen($entryid['entryid'])) {
					$entryid['entryid'] .= chr(0x00);
				}

				$entryids[] = $entryid['entryid'];

				// sizeof(cb) + strlen(entryid)
				$position += 4 + $entryid['cb'];
			}

			$recipients = Array();
			foreach ($entryids as $entryid)
			{
				$entry = mapi_ab_openentry($addressbook, $entryid);
				$props = mapi_getprops($entry, array( PR_ENTRYID, PR_SEARCH_KEY, PR_OBJECT_TYPE, PR_DISPLAY_NAME, PR_ADDRTYPE, PR_EMAIL_ADDRESS ));

				// Put data in recipient array
				$recipients[] = Array(
					'rowid' => count($recipients),
					'props' => Array(
						'entryid' => bin2hex($props[PR_ENTRYID]),
						'object_type' => isset($props[PR_OBJECT_TYPE]) ? $props[PR_OBJECT_TYPE] : MAPI_MAILUSER,
						'search_key' => isset($props[PR_SEARCH_KEY]) ? $props[PR_SEARCH_KEY] : '',
						'display_name' => isset($props[PR_DISPLAY_NAME]) ? $props[PR_DISPLAY_NAME] : '',
						'address_type' => isset($props[PR_ADDRTYPE]) ? $props[PR_ADDRTYPE] : 'SMTP',
						'email_address' => isset($props[PR_EMAIL_ADDRESS]) ? $props[PR_EMAIL_ADDRESS] : '',
						'smtp_address' => isset($props[PR_EMAIL_ADDRESS]) ? $props[PR_EMAIL_ADDRESS] : '',
					)
				);
			}

			return $recipients;
		}

		/**
		 * Build full-page HTML from the FCK Editor fragment
		 *
		 * This function basically takes the generated HTML from FCK editor and embeds it in
		 * a standonline HTML page (including header and CSS) to form.
		 *
		 * @param string $fck_html This is the HTML created by the FCK Editor
		 * @param string $title  Optional, this string is placed in the <title>
		 * @return string full HTML message
		 */
		function generateBodyHTML($fck_html, $title = "Zarafa WebApp"){
			$html = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">"
					."<html>\n"
					."<head>\n"
					."  <meta name=\"Generator\" content=\"Zarafa WebApp v".phpversion("mapi")."\">\n"
					."  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n"
					."  <title>".htmlspecialchars($title)."</title>\n";

			$html .= "</head>\n"
					."<body>\n"
					. $fck_html . "\n"
					."</body>\n"
					."</html>";

			return $html;
		}

		/**
		 * Calculate the total size for all items in the given folder
		 *
		 * @param mapifolder $folder The folder for which the size must be calculated
		 * @return number The folder size
		 */
		function calcFolderMessageSize($folder)
		{
			$columns = array(PR_MESSAGE_SIZE);
			$batchcount = 50;
			$size = 0;

			$table = mapi_folder_getcontentstable($folder, MAPI_DEFERRED_ERRORS);

			// Check if mapi_table_setcolumns exists (ZCP-7.1.1 and above), if so
			// then call mapi_table_setcolumns now, and set $columns to null.
			if (function_exists('mapi_table_setcolumns')) {
				mapi_table_setcolumns($table, $columns);
				$columns = null;
			}

			do {
				$messages = mapi_table_queryrows($table, $columns, 0, $batchcount);
				foreach($messages as $message){
					if (isset($message[PR_MESSAGE_SIZE])){
						$size += $message[PR_MESSAGE_SIZE];
					}
				}

				// When the server returned a different number of rows then was requested,
				// we have reached the end of the table and we should exit the loop.
			} while (count($messages) == $batchcount);

			return $size;
		}

		/**
		 * Save task item.
		 *
		 * just one step more before saving task message that to support recurrence and task request here. We need
		 * to regenerate task if it is recurring and client has changed either set as complete or delete or
		 * given new start or end date.
		 *
		 * @param mapistore $store MAPI store of the message
		 * @param string $parententryid Parent entryid of the message (folder entryid, NOT message entryid)
		 * @param array $action Action array containing XML request
		 * @return array of PR_ENTRYID, PR_PARENT_ENTRYID and PR_STORE_ENTRYID properties of modified item
		 */
		function saveTask($store, $parententryid, $entryid, $action)
		{
			$properties = $GLOBALS["properties"]->getTaskProperties();
			$send = isset($action["send"]) ? $action["send"] : false;

			if($store && $parententryid) {
				if(isset($action["props"])) {

					$props = $action["props"];

					if (!isset($action["props"]["entryid"])) {

						// Fetch message store properties of a current store.
						$msgstoreProps = mapi_getprops($store, array(PR_USER_ENTRYID, PR_MDB_PROVIDER, PR_MAILBOX_OWNER_ENTRYID));

						// Get current session and open addressbook
						$addrbook = $GLOBALS["mapisession"]->getAddressbook();

						// Store PR_SENT_REPRESENTING_* properties for task according to store type.
						switch ($msgstoreProps[PR_MDB_PROVIDER])
						{
							case ZARAFA_STORE_PUBLIC_GUID:
								try {
									// Open addressbook entry for current user.
									$userObject = mapi_ab_openentry($addrbook, $msgstoreProps[PR_USER_ENTRYID]);
									$userProps = mapi_getprops($userObject);
									// Store PR_SENDER_* properties for task in props variable.
									$props["sender_email_address"] = $userProps[PR_EMAIL_ADDRESS];
									$props["sender_name"] = $userProps[PR_DISPLAY_NAME];
									$props["sender_address_type"] = $userProps[PR_ADDRTYPE];
									$props["sender_entryid"] = bin2hex($userProps[PR_ENTRYID]);
									$props["sender_search_key"] = bin2hex($userProps[PR_SEARCH_KEY]);

									/**
									 * store type is "public"
									 * Store PR_SENT_REPRESENTING_* properties for task in props variable.
									 */
									$props["sent_representing_entryid"] = bin2hex($userProps[PR_ENTRYID]);
									$props["sent_representing_name"] = $userProps[PR_DISPLAY_NAME];
									$props["sent_representing_address_type"] = $userProps[PR_ADDRTYPE];
									$props["sent_representing_email_address"] = $userProps[PR_EMAIL_ADDRESS];
									$props["sent_representing_search_key"] = bin2hex($userProps[PR_SEARCH_KEY]);
								} catch (MAPIException $e) {
									$e->setHandled();
								}
								break;
							case ZARAFA_SERVICE_GUID:
								// store type is "default"
							case ZARAFA_STORE_DELEGATE_GUID:
								/**
								 * store type is "delegate"
								 * Open addressbook entry for mailbox owner.
								 */
								try {
									$ownerObject = mapi_ab_openentry($addrbook, $msgstoreProps[PR_MAILBOX_OWNER_ENTRYID]);
									$ownerProps = mapi_getprops($ownerObject);
										// Store PR_SENT_REPRESENTING_* properties for task in props variable.
										$props["sent_representing_entryid"] = bin2hex($ownerProps[PR_ENTRYID]);
										$props["sent_representing_name"] = $ownerProps[PR_DISPLAY_NAME];
										$props["sent_representing_address_type"] = $ownerProps[PR_ADDRTYPE];
										$props["sent_representing_email_address"] = $ownerProps[PR_EMAIL_ADDRESS];
										$props["sent_representing_search_key"] = bin2hex($ownerProps[PR_SEARCH_KEY]);
								} catch (MAPIException $e) {
									$e->setHandled();
								}
								break;
						}
					}

					$messageProps = array();
					$recips = array();
					if(isset($action["recipients"]) && is_array($action["recipients"])) {
						$recips = $action["recipients"];
					} else {
						$recips = false;
					}

					if (isset($action["props"]["entryid"]) && !empty($action["props"]["entryid"])) {
						$message = mapi_msgstore_openentry($store, hex2bin($action["props"]["entryid"]));

						if ($message) {
							$messageProps = mapi_getprops($message, array(PR_ENTRYID, PR_PARENT_ENTRYID, PR_STORE_ENTRYID, $properties['recurring']));

							if ((isset($messageProps[$properties['recurring']]) && $messageProps[$properties['recurring']]) ||
								(isset($props['recurring']) && $props['recurring'])) {
								$recur = new TaskRecurrence($store, $message);

								if (isset($props['recurring_reset']) && $props['recurring_reset'] == 1) {
									$msgProps = $recur->setRecurrence($props);
								} else if ((isset($props['complete']) && $props['complete'] == 1)) {
									$msgProps = $recur->markOccurrenceComplete($props);
								}
							}
							mapi_savechanges($message);

							$messageProps = Conversion::mapXML2MAPI($properties, $props);

							$message = $GLOBALS["operations"]->saveMessage($store, $entryid, $parententryid, $messageProps, $messageProps, $recips ? $recips : array(), isset($action['attachments']) ? $action['attachments'] : array(), array());

							if (isset($msgProps) && $msgProps) {
								$messageProps = $msgProps;
							}
						}
					} else {
						$messageProps = Conversion::mapXML2MAPI($properties, $props);
						//New message
						$message = $GLOBALS["operations"]->saveMessage($store, $entryid, $parententryid, $messageProps, $messageProps, $recips ? $recips : array(), isset($action['attachments']) ? $action['attachments'] : array(), array());

						// Set recurrence
						if (isset($action['props']['recurring']) && $action['props']['recurring'] == 1) {
							$recur = new TaskRecurrence($store, $message);
							$recur->setRecurrence($props);
						}
					}

					if ($message) {
						// The task may be a delegated task, do an update if needed (will fail for non-delegated tasks)
						$tr = new TaskRequest($store, $message, $GLOBALS["mapisession"]->getSession());

						// @TODO: check whether task is request and not a normal task
						switch($send)
						{
							case "accept":
								$result = $tr->doAccept(_("Task Accepted:") . " ");
								break;
							case "decline":
								$result = $tr->doDecline(_("Task Declined:") . " ");
								break;
							case "request":
								$tr->sendTaskRequest(_("Task Request:") . " ");
								break;
							case "unassign":
								$tr->createUnassignedCopy();
								break;
							case "reclaim":
								$tr->reclaimownership();
								break;
							default:
								if (isset($props["messagechanged"]) && $props["messagechanged"])
									$tr->doUpdate(_("Task Updated:") . " ", _("Task Completed:") . " ");
						}

						// Notify Inbox that task request has been deleted
						if (isset($result) && is_array($result))
							$GLOBALS["bus"]->notify(bin2hex($result[PR_PARENT_ENTRYID]), TABLE_DELETE, $result);
					}
				}
			}

			mapi_savechanges($message);

			// Return message properties that can be sent to the bus to notify changes
			return $messageProps;
		}

		/**
		 * Deletes a task.
		 *
		 * deletes occurrence if task is a recurring item.
		 * @param mapistore $store MAPI Message Store Object
		 * @param string $parententryid parent entryid of the messages to be deleted
		 * @param array $entryids a list of entryids which will be deleted
		 * @param boolean $softDelete flag for soft-deleteing (when user presses Shift+Del)
		 * @return boolean true if action succeeded, false if not
		 */
		function deleteTask($store, $parententryid, $entryids, $action)
		{
			$result = false;

			// If user wants to delete only occurrence then delete this occurrence
			if (!is_array($entryids) && isset($action['deleteFlag'])) {
				$message = mapi_msgstore_openentry($store, $entryids);

				if ($message) {
					if ($action['deleteFlag'] == 'occurrence') {
						$recur = new TaskRecurrence($store, $message);
						$occurrenceDeleted = $recur->deleteOccurrence($action);
					} else if ($action['deleteFlag'] == 'decline' || $action['deleteFlag'] == 'complete') {
						$taskReq = new TaskRequest($store, $message, $GLOBALS["mapisession"]->getSession());

						if ($action['deleteFlag'] == 'decline') $taskReq->doDecline(_("Task Declined:") . " ");
						else if ($action['deleteFlag'] == 'complete') $taskReq->sendCompleteUpdate(_("Task Updated:") . " ", $action, _("Task Completed:") . " ");
					}
				}
			}

			// Deleting occurrence failed, maybe that was its last occurrence, so now we delete whole series.
			if (!isset($occurrenceDeleted) || !$occurrenceDeleted) {
				// If softdelete is set then set it in softDelete variable and pass it for deleteing message.
				$softDelete = isset($action["softdelete"]) ? $action["softdelete"] : false;
				$result = $GLOBALS["operations"]->deleteMessages($store, $parententryid, $entryids, $softDelete);
			} else {
				$result = array('occurrenceDeleted' => true);
			}

			return $result;
		}

		/**
		* Create a flat entrylist (used for PR_REPLY_RECIPIENT_ENTRIES) from a list of recipients
		*
		* These flatentrylists are used in PR_REPLY_RECIPIENT_ENTRIES, remember to
		* keep this property synchronized with PR_REPLY_RECIPIENT_NAMES.
		*
		* @param String $recipientArray The array with recipients to convert
		* @return boolean Returns the resulting flatentrylist
		*/
		function writeFlatEntryList($recipientArray)
		{
			$oneOffs = Array();
			foreach ($recipientArray as $recipient)
			{
				// Add display name if it doesn't exist
				if (!array_key_exists(PR_DISPLAY_NAME, $recipient)||empty($recipient[PR_DISPLAY_NAME]))
					$recipient[PR_DISPLAY_NAME] = $recipient[PR_EMAIL_ADDRESS];
				$oneOffs[] = mapi_createoneoff($recipient[PR_DISPLAY_NAME], $recipient[PR_ADDRTYPE], $recipient[PR_EMAIL_ADDRESS]);
			}

			// Construct string from array with (padded) One-Off entry identifiers
			//
			// Remember, if you want to take the createOneOff part above out: that code
			// produces a padded OneOff and we add the right amount of null characters
			// below.
			//
			// So below is a wrong method for composing a flatentrylist from oneoffs and
			// above is a wrong method form composing a oneoff.
			$flatEntryString = "";
			for ($i = 0, $len = count($oneOffs); $i < $len; $i++)
			{
				$flatEntryString .= pack("Va*", strlen($oneOffs[$i]), $oneOffs[$i]);
				// Fill to 4-byte boundary
				$rest = strlen($oneOffs[$i])%4;
				for ($j=0;$j<$rest;$j++)
					$flatEntryString .= "\0";
			}
			// Pack the string with the number of flatentries and the stringlength
			return pack("V2a*", count($oneOffs), strlen($flatEntryString), $flatEntryString);
		}

		/**
		* Get a text body for a Non-Delivery report
		*
		* This function reads the necessary properties from the passed message and constructs
		* a user-readable NDR message from those properties
		*
		* @param mapimessage $message The NDR message to read the information from
		* @return string NDR body message as plaintext message.
		*/
		function getNDRbody($message)
		{
			$message_props  = mapi_getprops($message, array(PR_ORIGINAL_SUBJECT,PR_ORIGINAL_SUBMIT_TIME, PR_BODY));
			$body = '';

			// use PR_BODY if it's there, otherwise create a recipient failed message
			if(isset($message_props[PR_BODY]) || propIsError(PR_BODY, $message_props) == MAPI_E_NOT_ENOUGH_MEMORY) {
				$body = mapi_openproperty($message, PR_BODY);
			}

			if (empty($body)) {
				$body = _("Your message did not reach some or all of the intended recipients")."\n\n";
				$body .= "\t"._("Subject").": ".$message_props[PR_ORIGINAL_SUBJECT]."\n";
				$body .= "\t"._("Sent").":    ".strftime("%a %x %X",$message_props[PR_ORIGINAL_SUBMIT_TIME])."\n\n";
				$body .= _("The following recipient(s) could not be reached").":\n";

				$recipienttable = mapi_message_getrecipienttable($message);
				$recipientrows = mapi_table_queryallrows($recipienttable,array(PR_DISPLAY_NAME,PR_REPORT_TIME,PR_REPORT_TEXT));
				foreach ($recipientrows as $recipient){
					$body .= "\n\t".$recipient[PR_DISPLAY_NAME]." on ".strftime("%a %x %X",$recipient[PR_REPORT_TIME])."\n";
					$body .= "\t\t".$recipient[PR_REPORT_TEXT]."\n";
				}
			}

			// Bon voyage!
			return $body;
		}

		/**
		* Detect plaintext body type of message
		*
		* @param mapimessage $message MAPI message resource to check
		* @return boolean TRUE if the message is a plaintext message, FALSE if otherwise
		*/
		function isPlainText($message)
		{
			// first check if property exists or not, otherwise
			// mapi_message_openproperty will throw an exception
			$props = mapi_getprops($message, array(PR_RTF_COMPRESSED));

			if(isset($props[PR_RTF_COMPRESSED]) || propIsError(PR_RTF_COMPRESSED, $props) == MAPI_E_NOT_ENOUGH_MEMORY) {
				$rtf = mapi_message_openproperty($message, PR_RTF_COMPRESSED);

				if (!$rtf)
					return true; // no RTF is found, so we use plain text

				// get first line of the RTF (removing all other lines after opening/decompressing)
				$rtf = preg_replace("/(\n.*)/m","", mapi_decompressrtf($rtf));

				// check if "\fromtext" exists, if so, it was plain text
				return strpos($rtf,"\\fromtext") !== false;
			}

			// no RTF is found, so we use plain text
			return true;
		}

		/**
		* Parse email recipient list and add all e-mail addresses to the recipient history
		*
		* The recipient history is used for auto-suggestion when writing e-mails. This function
		* opens the recipient history property (PR_EC_RECIPIENT_HISTORY_JSON) and updates or appends
		* it with the passed email addresses.
		*
		* @param emailAddresses XML array structure with recipients
		*/
		function addEmailsToRecipientHistory($emailAddresses){
			if(is_array($emailAddresses) && !empty($emailAddresses)) {
				// Retrieve the recipient history
				$store = $GLOBALS["mapisession"]->getDefaultMessageStore();
				$storeProps  = mapi_getprops($store, array(PR_EC_RECIPIENT_HISTORY_JSON));
				$recipient_history = false;

				if(isset($storeProps[PR_EC_RECIPIENT_HISTORY_JSON]) || propIsError(PR_EC_RECIPIENT_HISTORY_JSON, $storeProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
					$stream = mapi_openproperty($store, PR_EC_RECIPIENT_HISTORY_JSON, IID_IStream, 0, 0);

					$stat = mapi_stream_stat($stream);
					mapi_stream_seek($stream, 0, STREAM_SEEK_SET);
					$datastring = '';
					for($i=0;$i<$stat['cb'];$i+=1024){
						$datastring .= mapi_stream_read($stream, 1024);
					}

					if(!empty($datastring)) {
						$recipient_history = json_decode_data($datastring, true);
					}
				}

				/**
				 * recipient structure passed to this function will be wrapped in add, modify and remove tags
				 * so we need to remove that wrapping of identifiers.
				 */
				$tmpEmailAddresses = $emailAddresses;
				$emailAddresses = array();
				foreach($tmpEmailAddresses as $key => $recipients) {
					if(!empty($recipients)) {
						$emailAddresses = array_merge($emailAddresses, $recipients);
					}
				}

				$l_aNewHistoryItems = Array();
				// Loop through all new recipients
				for($i = 0, $len = count($emailAddresses); $i < $len; $i++){
					if ($emailAddresses[$i]['address_type'] == 'SMTP') {
						$emailAddress = $emailAddresses[$i]['smtp_address'];
						if (empty($emailAddress)) {
							$emailAddress = $emailAddresses[$i]['email_address'];
						}
					} else { // address_type == 'ZARAFA' || address_type == 'MAPIPDL'
						$emailAddress = $emailAddresses[$i]['email_address'];
						if (empty($emailAddress)) {
							$emailAddress = $emailAddresses[$i]['smtp_address'];
						}
					}

					// If no email address property is found, then we can't
					// generate a valid suggestion.
					if (empty($emailAddress)) {
						continue;
					}


					$l_bFoundInHistory = false;
					// Loop through all the recipients in history
					if(is_array($recipient_history) && !empty($recipient_history['recipients'])) {
						for($j = 0, $lenJ = count($recipient_history['recipients']); $j < $lenJ;$j++){
							// Email address already found in history
							$l_bFoundInHistory = false;

							// The address_type property must exactly match,
							// when it does, a recipient matches the suggestion
							// if it matches to either the email_address or smtp_address.
							if ($emailAddresses[$i]['address_type'] === $recipient_history['recipients'][$j]['address_type']) {
								if ($emailAddress == $recipient_history['recipients'][$j]['email_address'] ||
								    $emailAddress == $recipient_history['recipients'][$j]['smtp_address']) {
									$l_bFoundInHistory = true;
								}
							}

							if($l_bFoundInHistory == true){
								// Check if a name has been supplied.
								$newDisplayName = trim($emailAddresses[$i]['display_name']);
								if(!empty($newDisplayName)){
									$oldDisplayName = trim($recipient_history['recipients'][$j]['display_name']);

									// Check if the name is not the same as the email address
									if ($newDisplayName != $emailAddresses[$i]['smtp_address']) {
										$recipient_history['recipients'][$j]['display_name'] = $newDisplayName;
									// Check if the recipient history has no name for this email
									} else if(empty($oldDisplayName)) {
										$recipient_history['recipients'][$j]['display_name'] = $newDisplayName;
									}
								}
								$recipient_history['recipients'][$j]['count']++;
								$recipient_history['recipients'][$j]['last_used'] = time();
								break;
							}
						}
					}
					if(!$l_bFoundInHistory && !isset($l_aNewHistoryItems[$emailAddress])){
						$l_aNewHistoryItems[$emailAddress] = Array(
							'display_name' => $emailAddresses[$i]['display_name'],
							'smtp_address' => $emailAddresses[$i]['smtp_address'],
							'email_address' => $emailAddresses[$i]['email_address'],
							'address_type' => $emailAddresses[$i]['address_type'],
							'count' => 1,
							'last_used' => time(),
							'object_type' => $emailAddresses[$i]['object_type']
						);
					}
				}
				if(!empty($l_aNewHistoryItems)){
					foreach($l_aNewHistoryItems as $l_aValue){
						$recipient_history['recipients'][] = $l_aValue;
					}
				}

				$l_sNewRecipientHistoryJSON = json_encode($recipient_history);

				$stream = mapi_openproperty($store, PR_EC_RECIPIENT_HISTORY_JSON, IID_IStream, 0, MAPI_CREATE | MAPI_MODIFY);
				mapi_stream_setsize($stream, strlen($l_sNewRecipientHistoryJSON));
				mapi_stream_write($stream, $l_sNewRecipientHistoryJSON);
				mapi_stream_commit($stream);
				mapi_savechanges($store);
			}
		}

		/**
		* Extract all email addresses from a list of recipients
		*
		* @param string $p_sRecipients String containing e-mail addresses, as typed by user (eg. '<john doe> john@doe.org; jane@doe.org')
		* @return array Array of e-mail address parts (eg. 'john@doe.org', 'jane@doe.org')
		*
		* this function is currently unused
		*/
		function extractEmailAddresses($p_sRecipients){
			$l_aRecipients = explode(';', $p_sRecipients);
			$l_aReturn = Array();
			for($i = 0, $len = count($l_aRecipients); $i < $len; $i++){
				$l_aRecipients[$i] = trim($l_aRecipients[$i]);
				$l_sRegex = '/^([^<]*<){0,1}(([a-z0-9=_\+\.\-\'\/])+\@(([a-z0-9\-])+\.)+([a-z0-9]{2,5})+)>{0,1}$/';
				preg_match($l_sRegex, $l_aRecipients[$i], $l_aMatches);
				$l_aReturn[] = $l_aMatches[0];
			}
			return $l_aReturn;
		}

		/**
		* Get the SMTP e-mail of an addressbook entry
		*
		* @param string $entryid Addressbook entryid of object
		* @return string SMTP e-mail address of that entry or FALSE on error
		*/
		function getEmailAddressFromEntryID($entryid) {
			try {
				$mailuser = mapi_ab_openentry($GLOBALS["mapisession"]->getAddressbook(), $entryid);
			} catch (MAPIException $e) {
				// if any invalid entryid is passed in this function then it should silently ignore it
				// and continue with execution
				if($e->getCode() == MAPI_E_UNKNOWN_ENTRYID) {
					$e->setHandled();
					return "";
				}
			}

			if(!isset($mailuser)) {
				return "";
			}

			$abprops = mapi_getprops($mailuser, array(PR_SMTP_ADDRESS, PR_EMAIL_ADDRESS));
			if(isset($abprops[PR_SMTP_ADDRESS])) {
				return $abprops[PR_SMTP_ADDRESS];
			} else if(isset($abprops[PR_EMAIL_ADDRESS])) {
				return $abprops[PR_EMAIL_ADDRESS];
			} else {
				return "";
			}
		}

		/**
		* Send a meeting cancellation
		*
		* This function sends a meeting cancellation for the meeting references by the passed entryid. It
		* will send the meeting cancellation and move the item itself to the waste basket.
		*
		* @param mapistore $store The store in which the meeting request resides
		* @param string $entryid Entryid of the appointment for which the cancellation should be sent.
		* @param Object $action data sent by client.
		* @param boolean $directBookingMeetingRequest Indicates if a Meeting Request should use direct booking or not
		*/
		function cancelInvitation($store, $entryid, $action, $directBookingMeetingRequest) {
			$message = $GLOBALS['operations']->openMessage($store, $entryid);

			// @TODO move this to meeting request class ?
			$req = new Meetingrequest($store, $message, $GLOBALS['mapisession']->getSession(), $directBookingMeetingRequest);

			// Update extra body information
			if(isset($action['message_action']['meetingTimeInfo']) && !empty($action['message_action']['meetingTimeInfo'])) {
				$req->setMeetingTimeInfo($action["message_action"]['meetingTimeInfo']);
				unset($action["message_action"]['meetingTimeInfo']);
			}

			// get basedate from action data and pass to meeting request class
			$basedate = !empty($action['basedate']) ? $action['basedate'] : false;

			$req->doCancelInvitation($basedate);

			if($basedate !== false) {
				// if basedate is specified then we have created exception in recurring meeting request
				// so send notification of creation of exception
				$messageProps = mapi_getprops($message, array(PR_ENTRYID, PR_STORE_ENTRYID, PR_PARENT_ENTRYID));
				$GLOBALS["bus"]->notify(bin2hex($messageProps[PR_PARENT_ENTRYID]), TABLE_SAVE, $messageProps);
			} else {
				// for normal/recurring meetings send delete notification
				$messageProps = mapi_getprops($message, array(PR_ENTRYID, PR_STORE_ENTRYID, PR_PARENT_ENTRYID));
				$GLOBALS["bus"]->notify(bin2hex($messageProps[PR_PARENT_ENTRYID]), TABLE_DELETE, $messageProps);
			}
		}

		/**
		* Remove all appointments for a certain meeting request
		*
		* This function searches the default calendar for all meeting requests for the specified
		* meeting. All those appointments are then removed.
		*
		* @param mapistore $store Mapi store in which the meeting request and the calendar reside
		* @param string $entryid Entryid of the meeting request or appointment for which all items should be deleted
		* @param string $basedate if specified contains starttime of day of an occurrence
		* @param boolean $directBookingMeetingRequest Indicates if a Meeting Request should use direct booking or not
		*/
		function removeFromCalendar($store, $entryid, $basedate, $directBookingMeetingRequest) {
			$message = $GLOBALS["operations"]->openMessage($store, $entryid);

			$req = new Meetingrequest($store, $message, $GLOBALS["mapisession"]->getSession(), $directBookingMeetingRequest);

			$req->doRemoveFromCalendar($basedate);

			// Notify the bus that the message has been deleted
			$messageProps = mapi_getprops($message, array(PR_ENTRYID, PR_STORE_ENTRYID, PR_PARENT_ENTRYID));
			$GLOBALS["bus"]->notify(bin2hex($messageProps[PR_PARENT_ENTRYID]), $basedate? TABLE_SAVE : TABLE_DELETE, $messageProps);
		}

		/**
		* Get addressbook hierarchy
		*
		* This function returns the entire hierarchy of the addressbook, with global addressbooks, and contacts
		* folders.
		*
		* The output array contains an associative array for each found contact folder. Each entry contains
		* "display_name" => Name of the folder, "entryid" => entryid of the folder, "parent_entryid" => parent entryid
		* "storeid" => store entryid, "type" => gab | contacts
		*
		* @param array Associative array with store information
		* @return array Array of associative arrays with addressbook container information
		* @todo Fix bizarre input parameter format
		*/
		function getAddressbookHierarchy($hideContacts = false)
		{
			$ab = $GLOBALS["mapisession"]->getAddressbook();
			$dir = mapi_ab_openentry($ab);
			$table = mapi_folder_gethierarchytable($dir, MAPI_DEFERRED_ERRORS | CONVENIENT_DEPTH);

			if($hideContacts){
				// Restrict on the addressbook provider GUID if the contact folders need to be hidden
				$restriction = array(RES_PROPERTY,
					array(
						RELOP => RELOP_EQ,
						ULPROPTAG => PR_AB_PROVIDER_ID,
						VALUE => array(
							PR_AB_PROVIDER_ID => MUIDECSAB
						)
					)
				);
				mapi_table_restrict($table, $restriction);
			}

			$items = mapi_table_queryallrows($table, array(PR_DISPLAY_NAME, PR_ENTRYID, PR_PARENT_ENTRYID, PR_DEPTH, PR_AB_PROVIDER_ID));

			$folders = array();

			$parent = false;
			foreach($items as $item){
				// TODO: fix for missing PR_PARENT_ENTRYID, see #2190
				if ($item[PR_DEPTH]==0)
					$parent = $item[PR_ENTRYID];

				$item[PR_PARENT_ENTRYID] = $parent;

				$folders[] = array(
					"props" => array(
						"display_name"	=> $item[PR_DISPLAY_NAME],
						"entryid"		=> bin2hex($item[PR_ENTRYID]),
						"parent_entryid"=> bin2hex($item[PR_PARENT_ENTRYID]),
						"depth"			=> $item[PR_DEPTH],
						"type"			=> $item[PR_AB_PROVIDER_ID] == MUIDECSAB ? "gab" : 'contacts',
						"object_type"	=> MAPI_ABCONT
					)
				);
			}

			return $folders;
		}

		/**
		 * Publishing the FreeBusy information of the default calendar. The
		 * folderentryid argument is used to check if the default calendar
		 * should be updated or not.
		 *
		 * @param $store MAPIobject Store object of the store that needs publishing
		 * @param $folderentryid binary entryid of the folder that needs to be updated.
		 */
		function publishFreeBusy($store, $folderentryid=false){
			// Publish updated free/busy information
			// First get default calendar from the root folder
			$rootFolder = mapi_msgstore_openentry($store, null);
			$rootFolderProps = mapi_getprops($rootFolder, array(PR_IPM_APPOINTMENT_ENTRYID));

			// If no folderentryid supplied or if the supplied entryid matches the default calendar.
			if (!$folderentryid ||
			    (isset($rootFolderProps[PR_IPM_APPOINTMENT_ENTRYID]) &&
			    $GLOBALS["entryid"]->compareEntryIds($rootFolderProps[PR_IPM_APPOINTMENT_ENTRYID], $folderentryid)))
			{
				// Get the calendar and owner entryID
				$calendar = mapi_msgstore_openentry($store, $rootFolderProps[PR_IPM_APPOINTMENT_ENTRYID]);
				$storeProps = mapi_msgstore_getprops($store, array(PR_MAILBOX_OWNER_ENTRYID));
				if (isset($storeProps[PR_MAILBOX_OWNER_ENTRYID])){
					// Lets share!
					$pub = new FreeBusyPublish($GLOBALS["mapisession"]->getSession(), $store, $calendar, $storeProps[PR_MAILBOX_OWNER_ENTRYID]);
					$pub->publishFB(time() - (7 * 24 * 60 * 60), 6 * 30 * 24 * 60 * 60); // publish from one week ago, 6 months ahead
				}
			}
		}

		/**
		 * Function which fetches all members of a distribution list recursively.
		 *
		 * @param {MAPIStore} $store MAPI Message Store Object
		 * @param {MAPIMessage} $message the distribution list message
		 * @param {Array} $properties array of properties to get properties of distlist
		 * @param {Boolean} $isRecursive function will be called recursively if there is/are
		 * distribution list inside the distlist to expand all the members,
		 * pass true to expand distlist recursively, false to not expand.
		 * @param {Array} $listEntryIDs list of already expanded Distribution list from contacts folder,
		 * This parameter is used for recursive call of the function
		 * @return object $items all members of a distlist.
		 */
		function getMembersFromDistributionList($store, $message, $properties, $isRecursive = false, $listEntryIDs = array())
		{
			$items = array();

			$props = mapi_getprops($message, array($properties['oneoff_members'], $properties['members'], PR_ENTRYID));

			// only continue when we have something to expand
			if(!isset($props[$properties['oneoff_members']]) || !isset($props[$properties['members']])) {
				return array();
			}

			if($isRecursive) {
				// when opening sub message we will not have entryid, so use entryid only when we have it
				if(isset($props[PR_ENTRYID])) {
					// for preventing recursion we need to store entryids, and check if the same distlist is going to be expanded again
					if (in_array($props[PR_ENTRYID], $listEntryIDs)){
						// don't expand a distlist that is already expanded
						return array();
					}

					$listEntryIDs[] = $props[PR_ENTRYID];
				}
			}

			$members = $props[$properties['members']];

			// parse oneoff members
			$oneoffmembers = array();
			foreach($props[$properties['oneoff_members']] as $key=>$item){
				$oneoffmembers[$key] = mapi_parseoneoff($item);
			}

			foreach($members as $key=>$item){
				$parts = unpack('Vnull/A16guid/Ctype/A*entryid', $item);
				$memberItem = array();
				$memberItem['props'] = array();
				$memberItem['props']['distlist_type'] = $parts['type'];

				if ($parts['guid'] === hex2bin('812b1fa4bea310199d6e00dd010f5402')){
					// custom e-mail address (no user or contact)
					$oneoff = mapi_parseoneoff($item);

					$memberItem['props']['display_name'] = $oneoff['name'];
					$memberItem['props']['address_type'] = $oneoff['type'];
					$memberItem['props']['email_address'] = $oneoff['address'];
					$memberItem['props']['entryid'] = bin2hex($members[$key]);

					$items[] = $memberItem;
				}else{
					if($parts['type'] === DL_DIST && $isRecursive) {
						// Expand distribution list to get distlist members inside the distributionlist.
						$distlist = mapi_msgstore_openentry($store, $parts['entryid']);
						$items = array_merge($items, $this->getMembersFromDistributionList($store, $distlist, $properties, true, $listEntryIDs));
					} else {
						$memberItem['props']['entryid'] = bin2hex($parts['entryid']);
						$memberItem['props']['display_name'] = $oneoffmembers[$key]['name'];
						$memberItem['props']['address_type'] = $oneoffmembers[$key]['type'];
						// distribution lists don't have valid email address so ignore that property

						if($parts['type'] !== DL_DIST) {
							$memberItem['props']['email_address'] = $oneoffmembers[$key]['address'];
						}

						$items[] = $memberItem;
					}
				}
			}

			return $items;
		}
	}
?>
