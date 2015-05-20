<?php
	require('server/exceptions/class.SettingsException.php');

	/**
	 * Generic settings class
	 *
	 * This class allows access to various user settings which are normally
	 * configured by the user. Settings can be set and retrieved
	 * via this class. Default values must be provided at retrieval time.	
	 *
	 * Settings have a path-like structure, for example:
	 * <code>
	 * path/to/setting => 5
	 * </code>
	 *
	 * @package core
	 */
	class Settings
	{
		/**
		 * @var MAPIStore User's default message store where we will be storing all the settings in a property
		 */
		var $store;

		/**
		 * @var Array Associative Array that will store all the settings of webapp, this will be filled by retreiveAllSettings
		 * and will be used when we call saveSettings
		 */
		var $settings;

		/**
		 * @var Array External settings which are stored outside of settings property and are managed differently,
		 * Out of office settings are one of them
		 */
		var $externalSettings;

		/**
		 * @var Boolean Flag to indicate that settings has been initialized and we can safely call saveSettings to
		 * add/update new settings, if this is false then it will indicate that there was some problem
		 * initializing $this->settings object and we shouldn't continue saving new settings as that will
		 * lose all existing settings of the user
		 */
		var $init;

		/**
		 * @var Array Settings that are defined by system admin
		 */
		var $sysAdminDefaults;

		/**
		 * @var String Json encoded string which represents existing set of settings, this can be compared with json encoded
		 * string of $this->settings to check if there was a change in settings and we need to save the changes
		 * to mapi
		 */
		var $settings_string;
			
		/**
		 * Constructor
		 */
		function Settings()
		{
			$this->settings = array();
			$this->sysAdminDefaults = array();
			$this->settings_string = '';
			$this->init = false;

			// Initialize the settings object
			$this->init();
		} 

		/**
		 * Initialise the settings class
		 *
		 * Opens the default store and gets the settings. This is done only once. Therefore
		 * changes written to the settings after the first Init() call will be invisible to this
		 * instance of the Settings class
		 * @access private
		 */
		function Init()
		{
			$GLOBALS['PluginManager']->triggerHook('server.core.settings.init.before', Array('settingsObj' => $this));

			$this->store = $GLOBALS['mapisession']->getDefaultMessageStore();

			// ignore exceptions when loading settings
			try {
				$this->retrieveSettings();

				// this object will only be initialized when we are able to retrieve existing settings correctly
				$this->init = true;
			} catch (SettingsException $e) {
				$e->setHandled();
			}
		}
	
		/**
		 * Get a setting from the settings repository
		 *
		 * Retrieves the setting at the path specified. If the setting is not found, and no $default value
		 * is passed, returns null.
		 *
		 * @param string $path Path to the setting you want to get, separated with slashes.
		 * @param string $default If the setting is not found, and this parameter is passed, then this value is returned
		 * @return string Setting data, or $default if not found or null of no default is found
		 */
		function get($path=null, $default=null)
		{
			if (!$this->init) {
				throw new SettingsException(_('Settings object is not initialized'));
			}

			if ($path==null) {
				return $this->settings;
			}
	
			$path = explode('/', $path);

			$tmp = $this->settings;
			foreach ($path as $pointer) {
				if (!empty($pointer)) {
					if (!isset($tmp[$pointer])) {
						return $default;
					}
					$tmp = $tmp[$pointer];
				}
			}

			return $tmp;
		}
	
		/**
		 * Store a setting
		 *
		 * Overwrites a setting at a specific settings path with the value passed.
		 *
		 * @param string $path Path to the setting you want to set, separated with slashes.
		 * @param mixed $value New value for the setting
		 * @param boolean $autoSave True to directly save the settings to the MAPI Store,
		 * this defaults to false as the settings will be saved at the end of the request.
		 */
		function set($path, $value, $autoSave = false)
		{
			if (!$this->init) {
				throw new SettingsException(_('Settings object is not initialized'));
			}

			$path = explode('/', $path);
			$pathCount = count($path);

			// Save the last key seperately
			$lastKey = array_pop($path);

			// Walk over the settings to find the object
			// which we can manipulate
			$pointer = &$this->settings;
			for ($i = 0, $len = count($path); $i < $len; $i++) {
				$key = $path[$i];

				if (!isset($pointer[$key])) {
					$pointer[$key] = array();
				}

				$pointer = &$pointer[$key];
			}

			$pointer[$lastKey] = $value;
			unset($pointer);

			if ($autoSave === true) {
				$this->saveSettings();
			}
		}

		/**
	 	 * Delete a setting
	 	 *
		 * Deletes the setting references by $path
		 *
		 * @param string $path Path to the setting you want to delete
		 * @param boolean $autoSave True to directly save the settings to the MAPI Store,
		 * this defaults to false as the settings will be saved at the end of the request.
		 */	
		function delete($path, $autoSave = false)
		{
			if (!$this->init) {
				throw new SettingsException(_('Settings object is not initialized'));
			}

			$path = explode('/', $path);
			$tmp =& $this->settings;

			// We have to get the second to last level to unset the value through a reference.
			$prevEntry = null;

			foreach ($path as $pointer) {
				if (!empty($pointer)) {
					if (!isset($tmp[$pointer])) {
						return;
					}
					$prevEntry =& $tmp;
					$tmp =& $tmp[$pointer];
				}
			}

			/**
			 * If we do unset($tmp) the reference is removed and not the value 
			 * it points to. If we do $prevEntry[$pointer] we change a value 
			 * inside the reference. In that case it will work.
			 */
			unset($prevEntry[$pointer]);

			if ($autoSave === true) {
				$this->saveSettings();
			}
		}
	
		/**
		 * Get all settings as a Javascript script
		 *
		 * This function will output all settings as a JSON object, allowing easy inclusing in client-side javascript.
		 * @return String json encoded php array
		 */
		function getJSON()
		{
			if (!$this->init) {
				throw new SettingsException(_('Settings object is not initialized'));
			}

			return $this->settings;
		}
	
		/**
		 * Get settings from store
		 *
		 * This function retrieves the actual settings from the store.
		 * Settings are stored in two different properties as we wanted to ship new webaccess and older webaccess
		 * simultenously so both webaccess uses different settings and doesn't interfere with each other.
		 * 
		 * new webaccess uses string property PR_EC_WEBACCESS_SETTINGS_JSON which contains settings in JSON format,
		 * and old webaccess uses string property PR_EC_WEBACCESS_SETTINGS which contains settings in
		 * the format of PHP's serialized data.
		 * 
		 * Additionally, there are also settings in PR_EC_OUTOFOFFICE_* which are retrieved in this function also.
		 *
		 * This function returns nothing, but populates the 'settings' property of the class.
		 * @access private
		 */
		function retrieveSettings()
		{
			// We retrieve the 'external' settings, this will serve as base
			$this->retrieveExternalSettings();

			// first check if property exist and we can open that using mapi_openproperty
			$storeProps = mapi_getprops($this->store, array(PR_EC_WEBACCESS_SETTINGS_JSON));

			// Check if property exists, if it doesn not exist then we can continue with empty set of settings
			if (isset($storeProps[PR_EC_WEBACCESS_SETTINGS_JSON]) || propIsError(PR_EC_WEBACCESS_SETTINGS_JSON, $storeProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
				// read the settings property
				$stream = mapi_openproperty($this->store, PR_EC_WEBACCESS_SETTINGS_JSON, IID_IStream, 0, 0);
				if ($stream == false) {
					throw new SettingsException(_('Error opening settings property'));
				}

				$stat = mapi_stream_stat($stream);
				mapi_stream_seek($stream, 0, STREAM_SEEK_SET);
				for ($i = 0; $i < $stat['cb']; $i += 1024) {
					$this->settings_string .= mapi_stream_read($stream, 1024);
				}
				
				if(empty($this->settings_string)) {
					// property exists but without any content so ignore it and continue with
					// empty set of settings
					return;
				}

				$settings = json_decode_data($this->settings_string, true);
				if (empty($settings) || empty($settings['settings'])) {
					throw new SettingsException(_('Error retrieving existing settings'));
				}

				// Get and apply the System Administrator default settings
				$sysadminSettings = $this->getDefaultSysAdminSettings();
				$settings = array_merge_recursive_overwrite($sysadminSettings, $settings['settings']);

				// Finally merge the settings with the external settings which were obtained
				// at the start of this function.
				$this->settings = array_merge_recursive_overwrite($settings, $this->settings);
			}
		}

		/**
		 * Retrieves the default settings as defined by the System Administrator.
		 * @return Array Settings object
		 */
		function getDefaultSysAdminSettings()
		{
			return $this->sysAdminDefaults;
		}

		/**
		 * Applies the default settigns defined by the System Administrator to the sysAdminDefaults
		 * property.
		 * @param Array $settings The default settings 
		 */
		function addSysAdminDefaults($settings)
		{
			$this->sysAdminDefaults = array_merge_recursive_overwrite($this->sysAdminDefaults, $settings);
		}

		/**
		 * Takes two arrays, one settings and one defaults and removes the items from the settings 
		 * array that have the same value as the defaults array. What is left is the settings that 
		 * are not in the defaults array and the changed values of the ones that their keys do match
		 * in the defaults. It calls itself recursively to check the full array.
		 * @param Array $settings The array containing the unfiltered settings
		 * @param Array $defaults The array containing the default key/values.
		 * @return Array The filtered settings array
		 */
		function filterOutSettings($settings, $defaults)
		{
			foreach ($defaults as $key => $value) {
				if (isset($settings[$key])) {
					if ($defaults[$key] == $settings[$key]) {
						unset($settings[$key]);
					} elseif (is_array($defaults[$key])) {
						$settings[$key] = $this->filterOutSettings($settings[$key], $defaults[$key]);
					}
				}
			}

			return $settings;
		}
	
		/**
		 * Save settings to store
		 *
		 * This function saves all settings to the store's PR_EC_WEBACCESS_SETTINGS_JSON property, and to the
		 * PR_EC_OUTOFOFFICE_* properties.
		 */
		function saveSettings()
		{
			if (!$this->init) {
				throw new SettingsException(_('Settings object is not initialized'));
			}

			$this->saveExternalSettings();

			// Filter out the unchanged default sysadmin settings
			$settings = $this->filterOutSettings($this->settings, $this->getDefaultSysAdminSettings());

			$settings = json_encode(array( 'settings' => $settings ));

			// Check if the settings have been changed.
			if ($this->settings_string !== $settings) {
				$stream = mapi_openproperty($this->store, PR_EC_WEBACCESS_SETTINGS_JSON, IID_IStream, 0, MAPI_CREATE | MAPI_MODIFY);
				mapi_stream_setsize($stream, strlen($settings));
				mapi_stream_write($stream, $settings);
				mapi_stream_commit($stream);
	
				mapi_savechanges($this->store);
			}
		}
	
	
		/**
		 * Read 'external' settings from PR_EC_OUTOFOFFICE_*
		 *
		 * Internal function to retrieve the 'external' settings from the store, these settings are normal properties on the store
		 * @access private
		 */
		function retrieveExternalSettings()
		{
			$props = mapi_getprops($this->store, array(PR_EC_OUTOFOFFICE, PR_EC_OUTOFOFFICE_MSG, PR_EC_OUTOFOFFICE_SUBJECT));

			if (!isset($props[PR_EC_OUTOFOFFICE])) {
				$props[PR_EC_OUTOFOFFICE] = false;
			}
			if (!isset($props[PR_EC_OUTOFOFFICE_MSG])) {
				$props[PR_EC_OUTOFOFFICE_MSG] = '';
			}
			if (!isset($props[PR_EC_OUTOFOFFICE_SUBJECT])) {
				$props[PR_EC_OUTOFOFFICE_SUBJECT] = '';
			}

			$this->settings['zarafa']['v1']['contexts']['mail']['outofoffice']['set'] = $props[PR_EC_OUTOFOFFICE];
			$this->settings['zarafa']['v1']['contexts']['mail']['outofoffice']['message'] = $props[PR_EC_OUTOFOFFICE_MSG];
			$this->settings['zarafa']['v1']['contexts']['mail']['outofoffice']['subject'] = $props[PR_EC_OUTOFOFFICE_SUBJECT];

			// Save the properties
			$this->externalSettings = $props;
		}
		
		/**
		 * Internal function to save the 'external' settings to the correct properties on the store
		 *
		 * Writes some properties to the PR_EC_OUTOFOFFICE_* properties
		 * @access private
		 */
		function saveExternalSettings()
		{
			$props = array();

			if (!isset($this->settings['zarafa']) || !isset($this->settings['zarafa']['v1']) ||
			    !isset($this->settings['zarafa']['v1']['contexts']) || !isset($this->settings['zarafa']['v1']['contexts']['mail']) ||
			    !isset($this->settings['zarafa']['v1']['contexts']['mail']['outofoffice'])) {
				return;
			}

			$oof = $this->settings['zarafa']['v1']['contexts']['mail']['outofoffice'];

			$enable = $oof['set'] == true;
			if ($this->externalSettings[PR_EC_OUTOFOFFICE] != $enable) {
				$props[PR_EC_OUTOFOFFICE] = $enable;
			}

			$msg = $oof['message'];
			if ($this->externalSettings[PR_EC_OUTOFOFFICE_MSG] != $msg) {
				$props[PR_EC_OUTOFOFFICE_MSG] = $msg;
			}

			$subject = $oof['subject'];
			if ($this->externalSettings[PR_EC_OUTOFOFFICE_SUBJECT] != $subject) {
				$props[PR_EC_OUTOFOFFICE_SUBJECT] = $subject;
			}

			if (!empty($props))	{
				mapi_setprops($this->store, $props);
				mapi_savechanges($this->store);
			}
			
			// remove external settings so we don't save the external settings to PR_EC_WEBACCESS_SETTINGS_JSON
			unset($this->settings['zarafa']['v1']['contexts']['mail']['outofoffice']);
		}
	
		/**
		 * Get session-wide settings
		 *
		 * Returns one explicit setting in an associative array:
		 *
		 * 'lang' -> setting('zarafa/v1/main/language')
		 *
		 * @return array Associative array with 'lang' entry.
		 */
		function getSessionSettings()
		{
			if (!$this->init) {
				throw new SettingsException(_('Settings object is not initialized'));
			}

			return array(
				'lang' => $this->get('zarafa/v1/main/language', LANG)
			);
		}
	}
?>
