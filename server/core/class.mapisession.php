<?php

	/**
	 * MAPI session handling
	 *
	 * This class handles MAPI authentication and stores
	 *
	 * @package core
	 */
	class MAPISession
	{
		/**
		 * @var sessionid The session id which is used to
		 * identify the session
		 */
		var $sessionid;

		/**
		 * @var resource This holds the MAPI Session
		 */
		var $session;

		/**
		 * @var resource This can hold the addressbook resource
		 */
		var $ab;

		/**
		 * @var array List with all the currently opened stores
		 */
		var $stores;

		/**
		 * @var string The entryid (binary) of the default store
		 */
		var $defaultstore;

		/**
		 * @var string The entryid (binary) of the public store
		 */
		var $publicStore;

		/**
		 * @var array Information about the current session (username/email/password/etc)
		 */
		var $session_info;

		/**
		 * @var array Mapping username -> entryid for other stores
		 */

		var $userstores;


		/**
		 * @var int Makes sure retrieveUserData is called only once
		 */
		var $userDataRetrieved;

		/**
		 * Default constructor
		 * @param String The sessionid for which this MAPI Session is created
		 */
		function MAPISession($sessionid)
		{
			$this->sessionid = $sessionid;
			$this->session_info = array("auth"=>false);
			$this->stores = array();
			$this->defaultstore = 0;
			$this->publicStore = 0;
			$this->session = false;
			$this->ab = false;
			$this->userstores = array();
			$this->userDataRetrieved = false;
		}

		/**
		 * Logon to Zarafa's MAPI system via php MAPI extension
		 *
		 * Logs on to Zarafa with the specified username and password. If the server is not specified,
		 * it will logon to the local server.
		 *
		 * @param string $username the username of the user
		 * @param string $password the password of the user
		 * @param string $server the server address
		 * @param string $sslcert_file the optional ssl certificate file
		 * @param string $sslcert_pass the optional ssl certificate password
		 * @result int 0 on no error, otherwise a MAPI error code
		 */
		function logon($username = NULL, $password = NULL, $server = DEFAULT_SERVER, $sslcert_file = NULL, $sslcert_pass = NULL)
		{
			$result = NOERROR;
			$username = (string) $username;
			$password = (string) $password;

			try {
				// logon
				if(function_exists("openssl_decrypt")) {
					// In PHP 5.3.3 the iv parameter was added
					if(version_compare(phpversion(), "5.3.3", "<")) {
						$password = openssl_decrypt($password,"des-ede3-cbc",PASSWORD_KEY,0);
					} else {
						$password = openssl_decrypt($password,"des-ede3-cbc",PASSWORD_KEY,0,PASSWORD_IV);
					}
				}
				$this->session = mapi_logon_zarafa($username, $password, $server, $sslcert_file, $sslcert_pass);
				if(function_exists("openssl_encrypt")) {
					// In PHP 5.3.3 the iv parameter was added
					if(version_compare(phpversion(), "5.3.3", "<")) {
						$password = openssl_encrypt($password,"des-ede3-cbc",PASSWORD_KEY,0);
					} else {
						$password = openssl_encrypt($password,"des-ede3-cbc",PASSWORD_KEY,0,PASSWORD_IV);
					}
				}

				if ($this->session !== false){
					$this->session_info["username"] = $username;
					$this->session_info["password"] = $password;
					$this->session_info["server"] = $server;

					// we are authenticated
					$this->session_info["auth"] = true;
				}
			} catch (MAPIException $e) {
				$result = $e->getCode();
			}

			return $result;
		}

		/**
		* Get logged-in user information
		*
		* This function populates the 'session_info' property of this class with the following information:
		* - userentryid: the MAPI entryid of the current user
		* - fullname: the fullname of the current user
		* - emailaddress: the email address of the current user
		*
		* The function only populates the information once, subsequent calls will return without error and without
		* doing anything.
		*
		* @return array Array of information about the currently logged-on user
		* @access private
		*/
		function retrieveUserData()
		{
			if($this->userDataRetrieved)
				return;

			$result = NOERROR;

			try {
				// get user entryid
				$store_props = mapi_getprops($this->getDefaultMessageStore(), array(PR_USER_ENTRYID));

				// open the user entry
				$user = mapi_ab_openentry($this->getAddressbook(), $store_props[PR_USER_ENTRYID]);

				// receive userdata
				// TODO: 0x8C9E0102 represents an LDAP jpegPhoto and should get a named property PR_EMS_AB_THUMBNAIL_PHOTO
				$user_props = mapi_getprops($user, array(PR_DISPLAY_NAME, PR_SMTP_ADDRESS, PR_EMAIL_ADDRESS, PR_SEARCH_KEY, 0x8C9E0102));

				if (is_array($user_props) && isset($user_props[PR_DISPLAY_NAME]) && isset($user_props[PR_SMTP_ADDRESS])){
					$this->session_info["userentryid"] = $store_props[PR_USER_ENTRYID];
					$this->session_info["fullname"] = $user_props[PR_DISPLAY_NAME];
					$this->session_info["smtpaddress"] = $user_props[PR_SMTP_ADDRESS];
					$this->session_info["emailaddress"] = $user_props[PR_EMAIL_ADDRESS];
					$this->session_info["searchkey"] = $user_props[PR_SEARCH_KEY];
					$this->session_info["userimage"] = isset($user_props[-1935802110]) ? base64_encode($user_props[-1935802110]) : "";
					$this->session_info["userimage"] = strlen($this->session_info["userimage"]) > 0 ? "data:image/png;base64," . $this->session_info["userimage"] : "" ;
				}

				$this->userDataRetrieved = true;

			} catch (MAPIException $e) {
				$result = $e->getCode();
			}

			return $result;
		}

		/**
		 * Get MAPI session object
		 *
		 * @return mapisession Current MAPI session
		 */
		function getSession()
		{
			return $this->session;
		}

		/**
		 * Get MAPI addressbook object
		 *
		 * @param string $fresh (optional) When set to true it will return an addressbook resource
		 * without any Contact Provider set on it, defaults to false.
		 * @return mapiaddressbook An addressbook object to be used with mapi_ab_*
		 */
		function getAddressbook($providerless = false)
		{
			if($providerless){
				try {
					return mapi_openaddressbook($this->session);
				} catch (MAPIException $e) {
					return $e->getCode();
				}
			}

			$result = NOERROR;

			if($this->ab === false){
				$this->setupContactProviderAddressbook();
			}

			try {
				if ($this->ab === false){
					$this->ab = mapi_openaddressbook($this->session);
				}

				if ($this->ab !== false){
					$result = $this->ab;
				}
			} catch (MAPIException $e) {
				$result = $e->getCode();
			}

			return $result;
		}


		/**
		 * Get logon status
		 *
		 * @return boolean true on logged on, false on not logged on
		 */
		function isLoggedOn()
		{
			return array_key_exists("auth",$this->session_info)?$this->session_info["auth"]:false;
		}

		/**
		 * Get current session id
		 * @return string Current session id
		 */
		function getSessionID()
		{
			return $this->sessionid;
		}

		/**
		 * Get current user entryid
		 * @return string Current user's entryid
		 */
		function getUserEntryID()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("userentryid",$this->session_info)?$this->session_info["userentryid"]:false;
		}

		/**
		 * Get current username
		 * @return string Current user's username (equal to username passed in logon() )
		 */
		function getUserName()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("username",$this->session_info)?$this->session_info["username"]:false;
		}

		/**
		 * Get current user's full name
		 * @return string User's full name
		 */
		function getFullName()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("fullname",$this->session_info)?$this->session_info["fullname"]:false;
		}

		/**
		 * Get current user's smtp address
		 * @return string User's smtp address
		 */
		function getSMTPAddress()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("smtpaddress",$this->session_info)?$this->session_info["smtpaddress"]:false;
		}

		/**
		 * Get current user's email address
		 * @return string User's email address
		 */
		function getEmailAddress()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("emailaddress",$this->session_info)?$this->session_info["emailaddress"]:false;
		}

		/**
		 * Get current user's image from the LDAP server
		 * @return string A base64 encoded string (data url)
		 */
		function getUserImage()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("userimage",$this->session_info)? $this->session_info["userimage"]:false;
		}

		/**
		 * Get current user's search key
		 * @return string Current user's searchkey
		 */
		function getSearchKey()
		{
			$result = $this->retrieveUserData();

			return array_key_exists("searchkey",$this->session_info)?$this->session_info["searchkey"]:false;
		}

		/**
		 * Get the message stores from the messge store table from your session. Standard stores
		 * like the default store and the public store are made them easily accessible through the
		 * defaultstore and publicStore properties.
		 */
		function loadMessageStoresFromSession()
		{
			if(!$this->defaultstore && !$this->publicStore){
				$storestables = mapi_getmsgstorestable($this->session);
				$rows = mapi_table_queryallrows($storestables, array(PR_ENTRYID, PR_DEFAULT_STORE, PR_MDB_PROVIDER));
				foreach($rows as $row) {
					if($row[PR_ENTRYID]){
						if(isset($row[PR_DEFAULT_STORE]) && $row[PR_DEFAULT_STORE] == true) {
							$this->defaultstore = $row[PR_ENTRYID];
						}elseif($row[PR_MDB_PROVIDER] == ZARAFA_STORE_PUBLIC_GUID){
							$this->publicStore = $row[PR_ENTRYID];
						}
					}
					$this->openMessageStore($row[PR_ENTRYID]);
				}
			}
		}

		/**
		 * Get the current user's default message store
		 *
		 * The store is opened only once, subsequent calls will return the previous store object
		 * @return mapistore User's default message store object
		 */
		function getDefaultMessageStore()
		{
			$this->loadMessageStoresFromSession();

			// Return cached default store if we have one
			if(isset($this->defaultstore) && isset($this->stores[$this->defaultstore])) {
				return $this->stores[$this->defaultstore];
			}else{
				return false;
			}
		}

		/**
		 * Get single store and it's archive store aswell if we are openig full store.
		 * 
		 * @param $store object the store of the user
		 * @param array $storeOptions contains folder_type of which folder to open
		 * It is mapped to username, If folder_type is 'all' (i.e. Open Entire Inbox)
		 * then we will open full store and it's archived stores.
		 * @param String $username The username
		 * @return Array storeArray The array of stores containg user's store and archived stores
		 */
		function getSingleMessageStores($store, $storeOptions, $username)
		{
			$storeArray = array($store);
			$archivedStores = array();

			// Get archived stores for user if there's any
			if(!empty($username)) {
				// Check whether we should open the whole store or just single folders
				if(is_array($storeOptions) && isset($storeOptions[ $username ]) && isset($storeOptions[ $username ]['all'])) {
					$archivedStores = $this->getArchivedStores($this->resolveStrictUserName($username));
				}
			}

			foreach($archivedStores as $archivedStore) {
				$storeArray[]= $archivedStore;
			}
			return $storeArray;
		}

		/**
		 * Get the public message store
		 *
		 * The store is opened only once, subsequent calls will return the previous store object
		 * @return mapistore Public message store object
		 */
		function getPublicMessageStore()
		{
			$this->loadMessageStoresFromSession();

			// Return cached public store if we have one
			if(isset($this->publicStore) && isset($this->stores[$this->publicStore])) {
				return $this->stores[$this->publicStore];
			}else{
				return false;
			}
		}

		/**
		 * Get all message stores currently open in the session
		 *
		 * @return array Associative array with entryid -> mapistore of all open stores (private, public, delegate)
		 */
		function getAllMessageStores()
		{
			$this->loadMessageStoresFromSession();
			$this->getArchivedStores($this->getUserEntryID());
			// The cache now contains all the stores in our profile. Next, add the stores
			// for other users.
			$otherusers = $this->retrieveOtherUsersFromSettings();
			if(is_array($otherusers)) {
				foreach($otherusers as $username=>$folder) {
					if(is_array($folder) && !empty($folder)) {
						try {
							$user_entryid = mapi_msgstore_createentryid($this->getDefaultMessageStore(), $username);

							$this->openMessageStore($user_entryid);
							$this->userstores[$username] = $user_entryid;

							// Check if an entire store will be loaded, if so load the archive store as well
							if(isset($folder['all']) && $folder['all']['folder_type'] == 'all'){
								$this->getArchivedStores($this->resolveStrictUserName($username));
							}
						} catch (MAPIException $e) {
							if ($e->getCode() == MAPI_E_NOT_FOUND) {
								// The user or the corresponding store couldn't be found,
								// print an error to the log, and remove the user from the settings.
								dump('Failed to load store for user ' . $username . ', user was not found. Removing it from settings.');
								$GLOBALS["settings"]->delete("zarafa/v1/contexts/hierarchy/shared_stores/" . $username);
							} else {
								// That is odd, something else went wrong. Lets not be hasty and preserve
								// the user in the settings, but do print something to the log to indicate
								// something happened...
								dump('Failed to load store for user ' . $username . '. ' . $e->getDisplayMessage());
							}
						}
					}
				}
			}

			// Just return all the stores in our cache, even if we have some error in mapi
			return $this->stores;
		}

		/**
		 * Open the message store with entryid $entryid
		 *
		 * @return mapistore The opened store on success, false otherwise
		 */
		function openMessageStore($entryid)
		{
			// Check the cache before opening
			foreach($this->stores as $storeEntryId => $storeObj) {
				if($GLOBALS["entryid"]->compareStoreEntryIds(bin2hex($entryid), bin2hex($storeEntryId))) {
					return $storeObj;
				}
			}

			try {
				$store = mapi_openmsgstore($this->session, $entryid);

				// Cache the store for later use
				$this->stores[$entryid] = $store;
			} catch (MAPIException $e) {
				return $e->getCode();
			}

			return $store;
		}

		/**
		 * Searches for the PR_EC_ARCHIVE_SERVERS property of the user of the passed entryid in the 
		 * Addressbook. It will get all his archive store objects and add those to the $this->stores
		 * list. It will return an array with the list of archive stores where the key is the 
		 * entryid of the store and the value the store resource.
		 * @param String $userEntryid Binary entryid of the user
		 * @return MAPIStore[] List of store resources with the key being the entryid of the store
		 */
		function getArchivedStores($userEntryid)
		{
			$ab = $this->getAddressbook();
			$abitem = mapi_ab_openentry($ab, $userEntryid);
			$userData = mapi_getprops($abitem, Array(PR_ACCOUNT, PR_EC_ARCHIVE_SERVERS));

			// Get the store of the user, need this for the call to mapi_msgstore_getarchiveentryid()
			$userStoreEntryid = mapi_msgstore_createentryid($this->getDefaultMessageStore(), $userData[PR_ACCOUNT]);
			$userStore = mapi_openmsgstore($GLOBALS['mapisession']->getSession(), $userStoreEntryid);

			$archiveStores = Array();
			if(isset($userData[PR_EC_ARCHIVE_SERVERS]) && count($userData[PR_EC_ARCHIVE_SERVERS]) > 0){
				for($i=0;$i<count($userData[PR_EC_ARCHIVE_SERVERS]);$i++){
					try{
						// Check if the store exists. It can be that the store archiving has been enabled, but no 
						// archived store has been created an none can be found in the PR_EC_ARCHIVE_SERVERS property.
						$archiveStoreEntryid = mapi_msgstore_getarchiveentryid($userStore, $userData[PR_ACCOUNT], $userData[PR_EC_ARCHIVE_SERVERS][$i]);
						$archiveStores[$archiveStoreEntryid] = mapi_openmsgstore($GLOBALS['mapisession']->getSession(), $archiveStoreEntryid);
						// Add the archive store to the list
						$this->stores[$archiveStoreEntryid] = $archiveStores[$archiveStoreEntryid];
					} catch (MAPIException $e) {
						$e->setHandled();
						if ($e->getCode() == MAPI_E_UNKNOWN_ENTRYID){
							dump('Failed to load archive store as entryid is not valid' . $e->getDisplayMessage());
						} else if ($e->getCode() == MAPI_E_NOT_FOUND) {
							// The corresponding store couldn't be found, print an error to the log.
							dump('Corresponding archive store couldn\'t be found' . $e->getDisplayMessage());
						} else {
							dump('Failed to load archive store' . $e->getDisplayMessage());
						}
					}
				}
			}
			return $archiveStores;
		}

		/**
		 * Resolve the username strictly by opening that user's store and returning the 
		 * PR_MAILBOX_OWNER_ENTRYID. This can be used for resolving an username without the risk of 
		 * ambiguity since mapi_ab_resolve() does not strictly resolve on the username.
		 * @param String $username The username
		 * @return Binary|Integer Entryid of the user on success otherwise the hresult error code
		 */
		function resolveStrictUserName($username)
		{
			$storeEntryid = mapi_msgstore_createentryid($this->getDefaultMessageStore(), $username);
			$store = mapi_openmsgstore($this->getSession(), $storeEntryid);
			$storeProps = mapi_getprops($store, Array(PR_MAILBOX_OWNER_ENTRYID));
			return $storeProps[PR_MAILBOX_OWNER_ENTRYID];
		}

		/**
		 * Get other users from settings
		 *
		 * @return array Array of usernames of delegate stores
		 */
		function retrieveOtherUsersFromSettings()
		{
			$result = false;
			$other_users = $GLOBALS["settings"]->get("zarafa/v1/contexts/hierarchy/shared_stores",null);

			if (is_array($other_users)){
				$result = Array();
				// Due to a previous bug you were able to open folders from both user_a and USER_A
				// so we have to filter that here. We do that by making everything lower-case
				foreach($other_users as $username=>$folders) {
					// No folders are being shared, the store has probably been closed by the user,
					// but the username is still lingering in the settings...
					if (!isset($folders) || empty($folders)) {
						continue;
					}

					$username = strtolower($username);
					if(!isset($result[$username])) {
						$result[$username] = Array();
					}

					foreach($folders as $type => $folder) {
						if(is_array($folder)) {
							$result[$username][$folder["folder_type"]] = Array();
							$result[$username][$folder["folder_type"]]["folder_type"] = $folder["folder_type"];
							$result[$username][$folder["folder_type"]]["show_subfolders"] = $folder["show_subfolders"];
						}
					}
				}

				$GLOBALS["settings"]->set("zarafa/v1/contexts/hierarchy/shared_stores", $result);
			}
			return $result;
		}

		/**
		 * Add the store of another user to the list of other user stores
		 *
		 * @param string $username The username whose store should be added to the list of other users' stores
		 * @return mapistore The store of the user or false on error;
		 */
		function addUserStore($username)
		{
			$user_entryid = mapi_msgstore_createentryid($this->getDefaultMessageStore(), $username);

			if($user_entryid) {
				$this->userstores[$username] = $user_entryid;

				return $this->openMessageStore($user_entryid);
			}
		}

		/**
		 * Remove the store of another user from the list of other user stores
		 *
		 * @param string $username The username whose store should be deleted from the list of other users' stores
		 * @return string The entryid of the store which was removed
		 */
		function removeUserStore($username)
		{
			// Remove the reference to the store if we had one
			if (isset($this->userstores[$username])){
				$entryid = $this->userstores[$username];
				unset($this->userstores[$username]);
				unset($this->stores[$entryid]);
				return $entryid;
			}
		}

		/**
		 * Get the store entryid of the specified user
		 *
		 * The store must have been previously added via addUserStores.
		 *
		 * @param string $username The username whose store is being looked up
		 * @return string The entryid of the store of the user
		 */
		function getStoreEntryIdOfUser($username)
		{
			return $this->userstores[$username];
		}

		/**
		 * Get the username of the owner of the specified store
		 *
		 * The store must have been previously added via addUserStores.
		 *
		 * @param string $entryid EntryID of the store
		 * @return string Username of the specified store or false if it is not found
		 */
		function getUserNameOfStore($entryid)
		{
			foreach($this->userstores as $username => $storeentryid) {
				if($GLOBALS["entryid"]->compareStoreEntryIds(bin2hex($storeentryid), bin2hex($entryid)))
					return $username;
			}

			return false;
		}

		/**
		 * Open a MAPI message using session object.
		 * The function is used to open message when we dont' know
		 * the specific store and we want to open message using entryid.
		 *
		 * @param string $entryid entryid of the message
		 * @return object MAPI Message
		 */
		function openMessage($entryid)
		{
			return mapi_openentry($this->session, $entryid);
		}

		/**
		 * Setup the contact provider for the addressbook. It asks getContactFoldersForABContactProvider
		 * for the entryids and display names for the contact folders in the user's store.
		 */
		function setupContactProviderAddressbook()
		{
			$profsect = mapi_openprofilesection($GLOBALS['mapisession']->getSession(), pbGlobalProfileSectionGuid);
			if ($profsect){
				// Get information about all contact folders from own store, shared stores and public store
				$defaultStore = $this->getDefaultMessageStore();
				$contactFolders = $this->getContactFoldersForABContactProvider($defaultStore);

				// include contact folders in addressbook if public folders are enabled, and Public contact folders is also disabled 
				if(!DISABLE_PUBLIC_CONTACT_FOLDERS && ENABLE_PUBLIC_FOLDERS) {
					$publicStore = $this->getPublicMessageStore();
					if($publicStore !== false) {
						$contactFolders = array_merge($contactFolders, $this->getContactFoldersForABContactProvider($publicStore));
					}
				}
				//TODO: The shared stores are not opened as there still is a bug that does not allow resolving from shared contact folders

				// These lists will be used to put set in the profile section
				$contact_store_entryids = Array();
				$contact_folder_entryids = Array();
				$contact_folder_names = Array();

				// Create the lists of store entryids, folder entryids and folder names to be added
				// to the profile section
				for($i=0,$len=count($contactFolders);$i<$len;$i++){
					$contact_store_entryids[] = $contactFolders[$i][PR_STORE_ENTRYID];
					$contact_folder_entryids[] = $contactFolders[$i][PR_ENTRYID];
					$contact_folder_names[] = $contactFolders[$i][PR_DISPLAY_NAME];
				}

				if(!empty($contact_store_entryids)){
					// add the defaults contacts folder in the addressbook hierarchy under 'Zarafa Contacts Folders'
					mapi_setprops($profsect, Array(PR_ZC_CONTACT_STORE_ENTRYIDS => $contact_store_entryids,
												   PR_ZC_CONTACT_FOLDER_ENTRYIDS =>	$contact_folder_entryids,
												   PR_ZC_CONTACT_FOLDER_NAMES => $contact_folder_names));
				}
			}
		}

		/**
		 * Get the store entryid, folder entryid and display name of the contact folders in the
		 * user's store. It returns an array prepared by getContactFolders.
		 *
		 * @param mapiStore $store The mapi store to look for folders in
		 * @return Array Contact folder information
		 */
		function getContactFoldersForABContactProvider($store)
		{
			$storeProps = mapi_getprops($store, array(PR_ENTRYID, PR_MDB_PROVIDER, PR_IPM_SUBTREE_ENTRYID, PR_IPM_PUBLIC_FOLDERS_ENTRYID));

			// For the public store we need to use the PR_IPM_PUBLIC_FOLDERS_ENTRYID instead of the
			// PR_IPM_SUBTREE_ENTRYID that can be used on your own and delegate stores.
			if($storeProps[PR_MDB_PROVIDER] == ZARAFA_STORE_PUBLIC_GUID){
				$subtreeEntryid = $storeProps[PR_IPM_PUBLIC_FOLDERS_ENTRYID];
			}else{
				$subtreeEntryid = $storeProps[PR_IPM_SUBTREE_ENTRYID];
			}

			// Only searches one level deep, otherwise deleted contact folders will also be included.
			$contactFolders = array();
			$contactFolders = $this->getContactFolders($store, $subtreeEntryid, false);
			// Need to search all the contact-subfolders within first level contact folders.
			$firstLevelHierarchyNodes = $contactFolders;
			foreach ($firstLevelHierarchyNodes as $key => $firstLevelNode) {
				// To search for multiple levels CONVENIENT_DEPTH needs to be passed as well.
				$contactFolders = array_merge($contactFolders, $this->getContactFolders($store, $firstLevelNode[PR_ENTRYID], true));
			}
			return $contactFolders;
		}

		/**
		 * Get the store entryid, folder entryid and display name of the contact folders from within given folder, in the
		 * user's store. It provides an array where each item contains the information of a folder
		 * formatted like this:
		 * Array(
		 *     PR_STORE_ENTRYID => '1234567890ABCDEF',
		 *     PR_ENTRYID       => '1234567890ABCDEF',
		 *     PR_DISPLAY_NAME  => 'Contact folder'
		 * )
		 * @param mapiStore $store The mapi store of the user
		 * @param string $folderEntryid EntryID of the folder to look for contact folders in
		 * @param int $depthSearch flag to search into all the folder levels
		 * @return Array an array in which founded contact-folders will be pushed
		 */
		function getContactFolders($store, $folderEntryid, $depthSearch)
		{
			$restriction = array(RES_CONTENT,
				array(
					// Fuzzylevel PF_PREFIX also allows IPF.Contact.Custom folders to be included.
					// Otherwise FL_FULLSTRING would only allow IPF.Contact folders.
					FUZZYLEVEL => FL_PREFIX,
					ULPROPTAG => PR_CONTAINER_CLASS,
					VALUE => array(
						PR_CONTAINER_CLASS => "IPF.Contact"
					)
				)
			);

			// Set necessary flag(s) to search considering all the sub folders or not
			$depthFlag = MAPI_DEFERRED_ERRORS;
			if ($depthSearch) {
				$depthFlag |= CONVENIENT_DEPTH;
			}

			$hierarchyFolder = mapi_msgstore_openentry($store, $folderEntryid);

			// Filter-out contact folders only
			$contactFolderTable = mapi_folder_gethierarchytable($hierarchyFolder, $depthFlag);
			mapi_table_restrict($contactFolderTable, $restriction, TBL_BATCH);

			return mapi_table_queryallrows($contactFolderTable, array(PR_STORE_ENTRYID, PR_ENTRYID, PR_DISPLAY_NAME));
		}
	}
?>
