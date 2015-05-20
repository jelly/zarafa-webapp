<?php
	/**
	 * ListModule
	 * Superclass of every module, which retreives a MAPI message list. It 
	 * extends the Module class.
	 */
	class ListModule extends Module
	{
		/**
		 * @var array list of columns which are selected in the previous request.
		 */
		var $properties;
		
		/**
		 * @var array sort.
		 */
		var $sort;
		
		/**
		 * @var int startrow in the table.
		 */
		var $start;
		
		/**
		 * @var array contains (when needed) a restriction used when searching
		 */
		var $searchRestriction;

		/**
		 * @var bool contains check whether a search result is listed or just the contents of a normal folder
		 */
		var $searchFolderList;

		/**
		 * @var array stores search criteria of previous request
		 */
		var $searchCriteriaCheck;

		/**
		 * @var array stores entryids and last modification time of 
		 * messages that are already sent to the server
		 */
		var $searchResults;

		/**
		 * @var MAPIFolder resource of the freebusy folder which holds
		 * information regarding delegation details, this variable will
		 * only be populated when user is a delegate
		 */
		var $localFreeBusyFolder;

		/**
		 * @var BinString binary string of PR_MDB_PROVIDER property
		 * of a store, this variable will only be populated when user is a delegate
		 */
		var $storeProviderGuid;

		/**
		 * Constructor
		 * @param int $id unique id.
		 * @param array $data list of all actions.
		 */
		function ListModule($id, $data, $events = false)
		{
			$this->start = 0;
			
			$this->searchRestriction = false;
			$this->searchFolderList = false;
			$this->localFreeBusyFolder = false;
			$this->storeProviderGuid = false;

			$this->sort = array();

			parent::Module($id, $data);
		}
		
		/**
		 * Executes all the actions in the $data variable.
		 * @return boolean true on success of false on fialure.
		 */
		function execute()
		{
			foreach($this->data as $actionType => $action)
			{
				if(isset($actionType)) {
					try {
						$store = $this->getActionStore($action);
						$parententryid = $this->getActionParentEntryID($action);
						$entryid = $this->getActionEntryID($action);

						switch($actionType)
						{
							case "list":
								$this->getDelegateFolderInfo($store);
								$this->messageList($store, $entryid, $action, $actionType);
								break;
							default:
								$this->handleUnknownActionType($actionType);
						}
					} catch (MAPIException $e) {
						$this->processException($e, $actionType, $store, $parententryid, $entryid, $action);
					} catch (SearchException $e) {
						$this->processException($e, $actionType, $store, $parententryid, $entryid, $action);
					}
				}
			}
		}

		/**
		 * Function does customization of MAPIException based on module data.
		 * like, here it will generate display message based on actionType
		 * for particular exception.
		 * 
		 * @param object $e Exception object
		 * @param string $actionType the action type, sent by the client
		 * @param MAPIobject $store Store object of the current user.
		 * @param string $parententryid parent entryid of the message.
		 * @param string $entryid entryid of the message/folder.
		 * @param array $action the action data, sent by the client
		 */
		function handleException(&$e, $actionType = null, $store = null, $parententryid = null, $entryid = null, $action = null)
		{
			if (is_null($e->displayMessage)) {
				switch($actionType) {
					case "list":
						if ($e->getCode() == MAPI_E_NO_ACCESS) {
							$e->setDisplayMessage(_("You have insufficient privileges to see the contents of this folder."));
						} else {
							$e->setDisplayMessage(_("Could not load the contents of this folder."));
						}
						break;
				}
			}

			parent::handleException($e, $actionType, $store, $parententryid, $entryid, $action);
		}

		/**
		 * Function which retrieves a list of messages in a folder
		 * @param object $store MAPI Message Store Object
		 * @param string $entryid entryid of the folder
		 * @param array $action the action data, sent by the client
		 * @param string $actionType the action type, sent by the client
		 * @return boolean true on success or false on failure
		 */
		function messageList($store, $entryid, $action, $actionType)
		{
			$this->searchFolderList = false; // Set to indicate this is not the search result, but a normal folder content

			if($store && $entryid) {
				// Restriction
				$this->parseSearchRestriction($action);

				// Sort
				$this->parseSortOrder($action, null, true);

				// Get the table and merge the arrays
				$data = $GLOBALS["operations"]->getTable($store, $entryid, $this->properties, $this->sort, $this->start, false, $this->searchRestriction);

				// Open the folder.
				$folder = mapi_msgstore_openentry($store, $entryid);
				$data["folder"] = array();
				
				// Obtain some statistics from the folder contents
				$contentcount = mapi_getprops($folder, array(PR_CONTENT_COUNT, PR_CONTENT_UNREAD));
				if (isset($contentcount[PR_CONTENT_COUNT])) {
					$data["folder"]["content_count"] = $contentcount[PR_CONTENT_COUNT];
				}
				if (isset($contentcount[PR_CONTENT_UNREAD])) {
					$data["folder"]["content_unread"] = $contentcount[PR_CONTENT_UNREAD];
				}

				// Disable private items
				for($index = 0, $len = count($data["item"]); $index < $len; $index++) {
					$data["item"][$index] = $this->processPrivateItem($data["item"][$index]);

					if(empty($data["item"][$index])) {
						// remove empty results from data
						unset($data["item"][$index]);
					}
				}

				// unset will remove the value but will not regenerate array keys, so we need to
				// do it here
				$data["item"] = array_values($data["item"]);

				$this->addActionData("list", $data);
				$GLOBALS["bus"]->addData($this->getResponseData());
			}
		}

		/**
		 *	Function will set search restrictions on search folder and start search process
		 *	and it will also parse visible columns and sorting data when sending results to client
		 *	@param		object		$store		MAPI Message Store Object
		 *	@param		hexString	$entryid	entryid of the folder
		 *	@param		object		$action		the action data, sent by the client
		 *  @param		string		$actionType	the action type, sent by the client
		 */
		function search($store, $entryid, $action, $actionType)
		{
			$useSearchFolder = isset($action["use_searchfolder"]) ? $action["use_searchfolder"] : false;
			if(!$useSearchFolder) {
				/**
				 * store doesn't support search folders so we can't use this
				 * method instead we will pass restriction to messageList and
				 * it will give us the restricted results
				 */
				return $this->messageList($store, $entryid, $action, $actionType);
			}

			$this->searchFolderList = true; // Set to indicate this is not the normal folder, but a search folder
			$this->searchRestriction = false;

			// Parse Restriction
			$this->parseSearchRestriction($action);
			if($this->searchRestriction == false) {
				// if error in creating restriction then send error to client
				$errorInfo = array();
				$errorInfo["error_message"] = _("Error in search, please try again") . ".";
				$errorInfo["original_error_message"] = "Error in parsing restrictions.";

				return $this->sendSearchErrorToClient($store, $entryid, $action, $errorInfo);
			}

			// create or open search folder
			$searchFolder = $this->createSearchFolder($store);
			if($searchFolder === false) {
				// if error in creating search folder then send error to client
				$errorInfo = array();
				$errorInfo["error_message"] = _("Error in search, please try again") . ".";
				$errorInfo["original_error_message"] = "Error in creating search folder.";

				return $this->sendSearchErrorToClient($store, $entryid, $action, $errorInfo);
			}

			$subfolder_flag = 0;
			if(isset($action["subfolders"]) && $action["subfolders"] == "true") {
				$subfolder_flag = RECURSIVE_SEARCH;
			}

			if(!is_array($entryid)) {
				$entryids = array($entryid);
			} else {
				$entryids = $entryid;
			}

			$searchFolderEntryId = $this->sessionData['searchFolderEntryId'];

			// check if searchcriteria has changed
			$restrictionCheck = md5(serialize($this->searchRestriction) . $searchFolderEntryId . $subfolder_flag);

			// check if there is need to set searchcriteria again
			if(!isset($this->sessionData['searchCriteriaCheck']) || $restrictionCheck != $this->sessionData['searchCriteriaCheck']) {
				if (!empty($this->sessionData['searchOriginalEntryids'])) {
					// get entryids of original folders, and use it to set new search criteria
					$entryids = Array();
					for($index = 0; $index < count($this->sessionData['searchOriginalEntryids']); $index++) {
						$entryids[] = hex2bin($this->sessionData['searchOriginalEntryids'][$index]);
					}
				} else {
					// store entryids of original folders, so that can be used for re-setting the search criteria if needed
					$this->sessionData['searchOriginalEntryids'] = Array();
					for($index = 0, $len = count($entryids); $index < $len; $index++) {
						$this->sessionData['searchOriginalEntryids'][] = bin2hex($entryids[$index]);
					}
				}

				mapi_folder_setsearchcriteria($searchFolder, $this->searchRestriction, $entryids, $subfolder_flag);
				$this->sessionData['searchCriteriaCheck'] = $restrictionCheck;
			}

			unset($action["restriction"]);

			// Sort
			$this->parseSortOrder($action);

			// Create the data array, which will be send back to the client
			$data = array();

			// Wait until we have some data, no point in returning before we have data. Stop waiting after 10 seconds
			$start = time();
			$table = mapi_folder_getcontentstable($searchFolder, MAPI_DEFERRED_ERRORS);

			// Sleep for 0.2 seconds initially, since it usually takes ~  0.2 seconds to fill the search folder. 
			sleep(0.2);
			
			while(time() - $start < 10) {
				$count = mapi_table_getrowcount($table);
				$result = mapi_folder_getsearchcriteria($searchFolder);

				// Stop looping if we have data or the search is finished
				if($count > 0)
					break;
					
				if(($result["searchstate"] & SEARCH_REBUILD) == 0)
					break; // Search is done
				
				sleep(0.1);
			}

			// Get the table and merge the arrays
			$table = $GLOBALS["operations"]->getTable($store, hex2bin($searchFolderEntryId), $this->properties, $this->sort, $this->start);
			$data = array_merge($data, $table);

			// remember which entryid's are send to the client
			$searchResults = array();
			foreach($table["item"] as $item) {
				// store entryid => last_modification_time mapping
				$searchResults[$item["entryid"]] = $item["props"]["last_modification_time"];
			}

			// store search results into session data
			if(!isset($this->sessionData['searchResults'])) {
				$this->sessionData['searchResults'] = array();
			}
			$this->sessionData['searchResults'][$searchFolderEntryId] = $searchResults;

			$result = mapi_folder_getsearchcriteria($searchFolder);

			$data["search_meta"] = array();
			$data["search_meta"]["searchfolder_entryid"] = $searchFolderEntryId;
			$data["search_meta"]["searchstate"] = $result["searchstate"];
			$data["search_meta"]["results"] = count($searchResults);

			$this->addActionData("search", $data);
			$GLOBALS["bus"]->addData($this->getResponseData());

			return true;
		}

		/**
		 *	Function will check for the status of the search on server
		 *	and it will also send intermediate results of search, so we don't have to wait
		 *	untill search is finished on server to send results
		 *	@param		object		$store		MAPI Message Store Object
		 *	@param		hexString	$entryid	entryid of the folder
		 *	@param		object		$action		the action data, sent by the client
		 */
		function updatesearch($store, $entryid, $action)
		{
			if(!isset($entryid) || !$entryid) {
				// if no entryid is present then we can't do anything here
				return;
			}

			$listData = array();
			$searchFolder = mapi_msgstore_openentry($store, $entryid);
			$searchResult = mapi_folder_getsearchcriteria($searchFolder);
			$searchState = $searchResult["searchstate"];
			$table = mapi_folder_getcontentstable($searchFolder, MAPI_DEFERRED_ERRORS);

			if(is_array($this->sort) && !empty($this->sort)) {
				// this sorting will be done on currently fetched results, not all results
				// @TODO find a way to do sorting on all search results
				mapi_table_sort($table, $this->sort, TBL_BATCH);
			}

			$rowCount = 50; // FIXME: $GLOBALS["settings"]->get("global/rowcount", 50);

			$searchResults = array();
			$entryid = bin2hex($entryid);
			if(isset($this->sessionData['searchResults'][$entryid])) {
				$searchResults = $this->sessionData['searchResults'][$entryid];
			}

			// searchResults contains entryids of messages
			// that are already sent to the server
			$numberOfResults = count($searchResults);

			if($numberOfResults < $rowCount) {
				$items = mapi_table_queryallrows($table, array(PR_ENTRYID, PR_LAST_MODIFICATION_TIME));

				foreach($items as $props) {
					$sendItemToClient = false;

					if(!array_key_exists(bin2hex($props[PR_ENTRYID]), $searchResults)) {
						$sendItemToClient = true;
					} else {
						/**
						 * it could happen that an item in search folder has been changed
						 * after we have sent it to client, so we have to again send it
						 * so we will have to use last_modification_time of item to check
						 * that item has been modified since we have sent it to client
						 */
						// TODO if any item is deleted from search folder it will be not notified to client
						if($searchResults[bin2hex($props[PR_ENTRYID])] < $props[PR_LAST_MODIFICATION_TIME]) {
							$sendItemToClient = true;
						}
					}

					if($sendItemToClient) {
						// only get primitive properties, no need to get body, attachments or recipient information
						$message = $GLOBALS["operations"]->openMessage($store, $props[PR_ENTRYID]);
						array_push($listData, $GLOBALS["operations"]->getProps($store, $message, $this->properties));

						// store entryid => last_modification_time mapping
						$searchResults[bin2hex($props[PR_ENTRYID])] = $props[PR_LAST_MODIFICATION_TIME];
					}

					// when we have more results then fit in the client, we break here,
					// we only need to update the counters from this point
					$numberOfResults = count($searchResults);
					if($numberOfResults >= $rowCount) {
						break; 
					}
				}
			}

			$totalRowCount = mapi_table_getrowcount($table);

			$data = array();
			$data["search_meta"] = array();
			$data["search_meta"]["searchfolder_entryid"] = $entryid;
			$data["search_meta"]["searchstate"] = $searchState;
			$data["search_meta"]["results"] = $numberOfResults;		// actual number of items that we are sending to client

			$data["page"] = array();
			$data["page"]["start"] = 0;
			$data["page"]["rowcount"] = $rowCount;
			$data["page"]["totalrowcount"] = $totalRowCount;	// total number of items

			if(!empty($listData)) {
				$data["item"] = array_merge(array(), $listData);
			}

			// search is finished so we no more need entryids of search results so clear it up
			if($searchState & SEARCH_REBUILD === 0) {
				// remove search result entryids stored in session
				unset($this->sessionData['searchResults'][$entryid]);
			} else {
				// store data for next request
				$this->sessionData['searchResults'][$entryid] = $searchResults;
			}

			$this->addActionData("updatesearch", $data);
			$GLOBALS["bus"]->addData($this->getResponseData());

			return true;
		}

		/**
		 *	Function will stop search on the server if search folder exists
		 *	@param		object		$store		MAPI Message Store Object
		 *	@param		hexString	$entryid	entryid of the folder
		 *	@param		object		$action		the action data, sent by the client
		 */
		function stopSearch($store, $entryid, $action)
		{
			// if no entryid is present in the request then get the search folder entryid from session data
			$entryid = !empty($entryid) ? $entryid : hex2bin($this->sessionData['searchFolderEntryId']);

			if(empty($entryid)) {
				// still no entryid? sorry i can't help you anymore
				$this->addActionData("stopsearch", array( 'success' => false ));
				$GLOBALS["bus"]->addData($this->getResponseData());
				return;
			}

			// remove search result entryids stored in session
			unset($this->sessionData['searchResults'][bin2hex($entryid)]);
			unset($this->sessionData['searchCriteriaCheck']);
			unset($this->sessionData['searchFolderEntryId']);
			unset($this->sessionData['searchOriginalEntryids']);

			$searchFolder = mapi_msgstore_openentry($store, $entryid);
			$searchResult = mapi_folder_getsearchcriteria($searchFolder);

			// check if search folder exists and search is in progress
			if($searchResult !== false && ($searchResult["searchstate"] & SEARCH_REBUILD !== 0)) {
				mapi_folder_setsearchcriteria($searchFolder, $searchResult['restriction'], $searchResult['folderlist'], STOP_SEARCH);
			}

			/**
			 * when stopping search process, we have to remove search folder also,
			 * so next search request with same restriction will not get uncompleted results
			 */
			$this->deleteSearchFolder($store, $entryid, $action);

			// send success message to client
			$this->addActionData("stopsearch", array( 'success' => true ));
			$GLOBALS["bus"]->addData($this->getResponseData());
		}

		/**
		 * Function will delete search folder
		 * @param		object			$store		MAPI Message Store Object
		 * @param		hexString		$entryid	entryid of the folder
		 * @param		array			$action		the action data, sent by the client
		 * @return		boolean						true on success or false on failure
		 */
		function deleteSearchFolder($store, $entryid, $action)
		{
			if($entryid && $store) {
				$storeProps = mapi_getprops($store, array(PR_FINDER_ENTRYID));

				$finderFolder = mapi_msgstore_openentry($store, $storeProps[PR_FINDER_ENTRYID]);

				if(mapi_last_hresult() != NOERROR){
					return;
				}

				$hierarchyTable = mapi_folder_gethierarchytable($finderFolder, MAPI_DEFERRED_ERRORS);

				$restriction = array(RES_CONTENT,
										array(
											FUZZYLEVEL	=> FL_FULLSTRING,
											ULPROPTAG	=> PR_ENTRYID,
											VALUE		=> array(PR_ENTRYID => $entryid)
											)
									);

				mapi_table_restrict($hierarchyTable, $restriction, TBL_BATCH);

				// entryids are unique so there would be only one matching row, 
				// so only fetch first row
				$folders = mapi_table_queryrows($hierarchyTable, array(PR_ENTRYID), 0, 1);

				// delete search folder
				if(is_array($folders) && is_array($folders[0])) {
					mapi_folder_deletefolder($finderFolder, $folders[0][PR_ENTRYID]);
				}

				return true;
			}

			return false;
		}

		/**
		 *	Function will create a search folder in FINDER_ROOT folder
		 *	if folder exists then it will open it
		 *	@param		object				$store			MAPI Message Store Object
		 *	@param		boolean				$openIfExists	open if folder exists
		 *	@return		mapiFolderObject	$folder			created search folder
		 */
		function createSearchFolder($store, $openIfExists = true)
		{
			if(isset($this->sessionData['searchFolderEntryId']) && $openIfExists) {
				try {
					$searchFolder = mapi_msgstore_openentry($store, hex2bin($this->sessionData['searchFolderEntryId']));

					if($searchFolder !== false) {
						// search folder exists, don't create new search folder
						return $searchFolder;
					}
				} catch (MAPIException $e) {
					// ignore error and continue creation of search folder
					unset($this->sessionData['searchFolderEntryId']);
				}
			}

			// create new search folder
			$searchFolderRoot = $this->getSearchFoldersRoot($store);
			if($searchFolderRoot === false) {
				// error in finding search root folder
				// or store doesn't support search folders
				return false;
			}

			// check for folder name conflict, if conflicts then function will return new name
			$folderName = $GLOBALS["operations"]->checkFolderNameConflict($store, $searchFolderRoot, "WebApp Search Folder");
			try {
				$searchFolder = mapi_folder_createfolder($searchFolderRoot, $folderName, null, 0, FOLDER_SEARCH);

				$props = mapi_getprops($searchFolder, array(PR_ENTRYID));
				$this->sessionData['searchFolderEntryId'] = bin2hex($props[PR_ENTRYID]);

				// we have created new search folder so search criteria check should be removed
				unset($this->sessionData['searchCriteriaCheck']);

				return $searchFolder;
			} catch (MAPIException $e) {
				// don't propogate the event to higher level exception handlers
				$e->setHandled();
			}

			return false;
		}

		/**
		 *	Function will open FINDER_ROOT folder in root container
		 *	public folder's don't have FINDER_ROOT folder
		 *	@param		object				$store		MAPI message store object
		 *	@return		mapiFolderObject	root		folder for search folders
		 */
		function getSearchFoldersRoot($store)
		{
			$searchRootFolder = true;

			// check if we can create search folders
			$storeProps = mapi_getprops($store, array(PR_STORE_SUPPORT_MASK, PR_FINDER_ENTRYID));
			if(($storeProps[PR_STORE_SUPPORT_MASK] & STORE_SEARCH_OK) != STORE_SEARCH_OK) {
				// store doesn't support search folders
				// public store don't have FINDER_ROOT folder
				$searchRootFolder = false;
			}

			if($searchRootFolder) {
				// open search folders root
				try {
					$searchRootFolder = mapi_msgstore_openentry($store, $storeProps[PR_FINDER_ENTRYID]);
				} catch (MAPIException $e) {
					$searchRootFolder = false;

					// don't propogate the event to higher level exception handlers
					$e->setHandled();
				}
			}

			return $searchRootFolder;
		}

		/**
		 *	Function will send error message to client if any error has occured in search
		 *	@param		object		$store		MAPI Message Store Object
		 *	@param		hexString	$entryid	entryid of the folder
		 *	@param		object		$action		the action data, sent by the client
		 *	@param		object		$errorInfo	the error information object
		 */
		function sendSearchErrorToClient($store, $entryid, $action, $errorInfo)
		{
			if($errorInfo) {
				$exception = new SearchException(isset($errorInfo["original_error_message"]) ? $errorInfo["original_error_message"] : $errorInfo['error_message'], mapi_last_hresult());
				$exception->setDisplayMessage($errorInfo['error_message']);

				// after sending error, remove error data
				$errorInfo = array();

				throw $exception;
			}

			return false;
		}

		/**
		 *	Function will create search restriction based on restriction array.
		 *	@param		object		$action		the action data, sent by the client
		 */
		function parseSearchRestriction($action)
		{
			if(isset($action["restriction"])) {
				if(isset($action["restriction"]["start"])) {
					// Set start variable
					$this->start = $action["restriction"]["start"];
				}

				if(!empty($action["restriction"]["search"])) {
					$props = array_merge($this->properties, array('body' => PR_BODY));
					$this->searchRestriction = Conversion::json2restriction($props, $action["restriction"]["search"]);
				} else {
					$this->searchRestriction = false;
				}
			}
		}

		/**
		 * Parses the incoming sort request and builds a MAPI sort order. Normally
		 * properties are mapped from the XML to MAPI by the standard $this->properties mapping. However,
		 * if you want other mappings, you can specify them in the optional $map mapping.
		 * 
		 * $allow_multi_instance is used for creating multiple instance of MV property related items.
		 * $properties is used for using a custom set of properties instead of properties stored in module
		 */
		function parseSortOrder($action, $map = false, $allow_multi_instance = false, $properties = false)
		{
			if(isset($action["sort"])) {
				$this->sort = array();

				if(!$properties) {
					$properties = $this->properties;
				}

				// Unshift MVI_FLAG of MV properties. So the table is not sort on it anymore.
				// Otherwise the server would generate multiple rows for one item (categories).
				foreach($properties as $id => $property)
				{
					switch(mapi_prop_type($property)) 
					{
						case (PT_MV_STRING8 | MVI_FLAG):
						case (PT_MV_LONG | MVI_FLAG):
							$properties[$id] = $properties[$id] &~ MV_INSTANCE;
							break;
					}
				}

				// Loop through the sort columns
				foreach($action["sort"] as $column)
				{
					if(isset($column["direction"])) {
						if(isset($properties[$column["field"]]) || ($map && isset($map[$column["field"]]))) {
							if($map && isset($map[$column["field"]])) 
								$property = $map[$column["field"]];
							else
								$property = $properties[$column["field"]];
							
							// Check if column is a MV property
							switch(mapi_prop_type($property)) 
							{
								case PT_MV_STRING8:
								case PT_MV_LONG:
									// Set MVI_FLAG.
									// The server will generate multiple rows for one item (for example: categories)
									if($allow_multi_instance){
										$properties[$column["field"]] = $properties[$column["field"]] | MVI_FLAG;
									}
									$property = $properties[$column["field"]];
									break;
							}

							// Set sort direction
							switch(strtolower($column["direction"]))
							{
								default:
								case "asc":
									$this->sort[$property] = TABLE_SORT_ASCEND;
									break;
								case "desc":
									$this->sort[$property] = TABLE_SORT_DESCEND;
									break;
							}
						}
					}
				}
			}
		}

		/**
		 * Function which gets the delegation details from localfreebusy folder to use in
		 * processPrivateItems function.
		 * @param {MAPIStore} $store MAPI Message Store Object
		 */
		function getDelegateFolderInfo($store)
		{
			$this->localFreeBusyFolder = false;
			$this->storeProviderGuid = false;

			try {
				$this->storeProviderGuid = mapi_getprops($store, array(PR_MDB_PROVIDER));
				$this->storeProviderGuid = $this->storeProviderGuid[PR_MDB_PROVIDER];

				if($this->storeProviderGuid !== ZARAFA_STORE_DELEGATE_GUID) {
					// user is not a delegate, so no point of processing further
					return;
				}

				// open localfreebusy folder for delegate permissions
				$rootFolder = mapi_msgstore_openentry($store, null);
				$rootFolderProps = mapi_getprops($rootFolder, array(PR_FREEBUSY_ENTRYIDS));

				/**
				 *	PR_FREEBUSY_ENTRYIDS contains 4 entryids
				 *	PR_FREEBUSY_ENTRYIDS[0] gives associated freebusy folder in calendar
				 *	PR_FREEBUSY_ENTRYIDS[1] Localfreebusy (used for delegate properties)
				 *	PR_FREEBUSY_ENTRYIDS[2] global Freebusydata in public store
				 *	PR_FREEBUSY_ENTRYIDS[3] Freebusydata in IPM_SUBTREE
				 */
				// get localfreebusy folder
				$this->localFreeBusyFolder = mapi_msgstore_openentry($store, $rootFolderProps[PR_FREEBUSY_ENTRYIDS][1]);
			} catch(MAPIException $e) {
				// we got some error, but we don't care about that error instead just continue
				$e->setHandled();

				$this->localFreeBusyFolder = false;
				$this->storeProviderGuid = false;
			}
		}

		/**
		 * Function will be used to process private items in a list response, modules can
		 * can decide what to do with the private items, remove the entire row or just
		 * hide the data. This function will entirely remove the private message but
		 * if any child class needs different behavior then this can be overriden.
		 * @param {Object} $item item properties
		 * @return {Object} item properties if its non private item otherwise empty array
		 */
		function processPrivateItem($item)
		{
			if($this->checkPrivateItem($item)) {
				// hide the item by returning empty array, that can be removed from response
				return array();
			}

			return $item;
		}

		/**
		 * Function will be used check if any item is private or not and if it private then
		 * we should process it as private, because you don't want to process private items in
		 * user's default store.
		 * This function will check we are dealing with delegate stores or not if it is then
		 * the delegator has permission to see private items of delegate.
		 * @param {Object} $item item properties
		 * @return {Boolean} true if items should be processed as private else false.
		 */
		function checkPrivateItem($item)
		{
			// flag to indicate that item should be considered as private
			$private = false;

			$isPrivate = (isset($item['props']['private']) && $item['props']['private'] === true);
			$isSensitive = (isset($item['props']['sensitivity']) && $item['props']['sensitivity'] === SENSITIVITY_PRIVATE);

			if($isPrivate || $isSensitive) {
				// check for delegate permissions for delegate store
				if($this->storeProviderGuid !== false && $this->storeProviderGuid === ZARAFA_STORE_DELEGATE_GUID) {
					// by default we should always hide the item if we are in delegate store
					$private = true;

					// find delegate properties
					if($this->localFreeBusyFolder !== false) {
						try {
							$localFreeBusyFolderProps = mapi_getprops($this->localFreeBusyFolder, array(PR_SCHDINFO_DELEGATE_ENTRYIDS, PR_DELEGATES_SEE_PRIVATE));

							if(isset($localFreeBusyFolderProps[PR_SCHDINFO_DELEGATE_ENTRYIDS]) && isset($localFreeBusyFolderProps[PR_DELEGATES_SEE_PRIVATE])) {
								// if more then one delegates info is stored then find index of 
								// current user
								$userEntryId = $GLOBALS['mapisession']->getUserEntryID();
								$userIndex = array_search($userEntryId, $localFreeBusyFolderProps[PR_SCHDINFO_DELEGATE_ENTRYIDS]);

								if($userIndex !== false && $localFreeBusyFolderProps[PR_DELEGATES_SEE_PRIVATE][$userIndex] === 1) {
									// if delegate has permission then don't hide the item
									$private = false;
								}
							}
						} catch (MAPIException $e) {
							if($e->getCode() === MAPI_E_NOT_FOUND) {
								// no information available for delegates, ignore error
								$e->setHandled();
							}
						}
					}
				}
			}

			return $private;
		}
	}
?>
