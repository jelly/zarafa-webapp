<?php
	/**
	 * This is the entry point for every request that should return HTML
	 *
	 * (one exception is that it also returns translated text for javascript)
	 */
	// load config file
	if (!file_exists("config.php")){
		die("<strong>config.php is missing!</strong>");
	}

	include("init.php");
	include("config.php");
	include("defaults.php");

	ob_start();
	setlocale(LC_CTYPE, "en_US.UTF-8");

	// Start the session
	session_name(COOKIE_NAME);

	if($_POST && array_key_exists(COOKIE_NAME, $_POST)) {
		session_id($_POST[COOKIE_NAME]);
	}

	session_start();

	// check if config is correct
	if (defined("CONFIG_CHECK")){
		include("server/class.configcheck.php");
		new ConfigCheck(CONFIG_CHECK);
	}

	// Include the files
	require("mapi/mapi.util.php");
	require("mapi/mapicode.php");
	require("mapi/mapidefs.php");
	require("mapi/mapitags.php");
	require("mapi/mapiguid.php");
	require("mapi/class.baseexception.php");
	require("mapi/class.mapiexception.php");

	require("server/exceptions/class.ZarafaException.php");
	require("server/exceptions/class.ZarafaErrorException.php");
	require("server/util.php");
	include("server/gettext.php");

	require("server/core/class.json.php");
	require("server/core/constants.php");
	require("server/core/class.conversion.php");
	require("server/core/class.mapisession.php");
	require("server/core/class.entryid.php");

	require("server/core/class.settings.php");
	require("server/core/class.language.php");

	require("server/core/class.state.php");
	require("server/core/class.attachmentstate.php");

	require("server/core/class.pluginmanager.php");
	require("server/core/class.plugin.php");

	// Check if we need to logout from webapp
	$logout = isset($_GET['logout']);
	// Check if we have been redirected from login page
	$logon = isset($_GET['logon']);
	// Check for loading of any other type of file
	$load = sanitizeGetValue('load', false, FILENAME_REGEX);

	// Returns true if the given $load argument
	// requires a validated session.
	function loadNeedsSession($load)
	{
		return !empty($load) && $load !== 'logon' && $load !== 'translations.js';
	}

	// Destroy session
	function destroySession()
	{
		$_SESSION = array();

		if (isset($_COOKIE[session_name()])) {
			setcookie(session_name(), '', time()-42000, '/');
		}

		session_destroy();
	}

	if ($logout) {
		// REMOTE_USER is set when apache has authenticated the user, means Single Sign-on
		// environment is in effect. Don't allow user to redirect to the webapp login page
		// to prevent user to login with other credentials.
		if (!isset($_SERVER['REMOTE_USER'])){
			// The user requests to logout. We should destroy the
			// session, and redirect the user to the logon page.
			$actionURI = '?load=logon';

			destroySession();

			$user = sanitizeGetValue('user', '', USERNAME_REGEX);
			if ($user) {
				$actionURI .= '&user=' . rawurlencode($user);
			}

			// Redirect the user, this will reload the page
			// and request the logon page.
			header('Location: index.php' . $actionURI, true, 303);
			exit;
		}
	} else if ($logon) {
		// The user requested to logon. Check if credentials were provided
		// or if the a remote user login is possible.
		$username = ($_POST && array_key_exists('username', $_POST)) ? $_POST['username'] : '';
		$password = ($_POST && array_key_exists('password', $_POST)) ? $_POST['password'] : '';

		if (isset($_SESSION['username']) && $_SESSION['username'] !== $username) {
			$hresult = MAPI_E_INVALID_WORKSTATION_ACCOUNT;
			// Logon failed because a session for another user already exists.
			// We force the user back to the logon page.
			$load = 'logon';
		} else if (!empty($username) && !empty($password)) {
			// Set the session variables if it is posted
			$_SESSION['username'] = $username;

			// if user has openssl module installed
			if(function_exists("openssl_encrypt")) {
				// In PHP 5.3.3 the iv parameter was added
				if(version_compare(phpversion(), "5.3.3", "<")) {
					$_SESSION['password'] = openssl_encrypt($password,"des-ede3-cbc",PASSWORD_KEY,0);
				} else {
					$_SESSION['password'] = openssl_encrypt($password,"des-ede3-cbc",PASSWORD_KEY,0,PASSWORD_IV);
				}
			}
			else {
				$_SESSION['password'] = $password;
			}
		}

	} else if (!DISABLE_REMOTE_USER_LOGIN && !isset($_SESSION['username'])) {
		// REMOTE_USER is set when apache has authenticated the user
		// Don't perform single-signon when $_POST is set, as that implies
		// the user was sending us data from a form.
		if (!$_POST && $_SERVER && array_key_exists('REMOTE_USER', $_SERVER)) {
			$_SESSION['username'] = $_SERVER['REMOTE_USER'];
			if (LOGINNAME_STRIP_DOMAIN) {
				$_SESSION['username'] = ereg_replace('@.*', '', $_SESSION['username']);
			}

			$_SESSION['password'] = '';
		}
	}

	// Create global mapi object. This object is used in many other files
	$GLOBALS["mapisession"] = new MAPISession(session_id());

	// We will only allow the logon when the sessionid in the GET arguments matches the
	// sessionid as send in the cookie. Otherwise the cookie was somehow modified in the
	// browser.
	$sessionid = sanitizeGetValue('sessionid', '', ID_REGEX);
	if (loadNeedsSession($load) && $sessionid !== $GLOBALS["mapisession"]->getSessionID()) {
		$hresult = MAPI_E_INVALID_WORKSTATION_ACCOUNT;
	} else if ($load !== 'logon' && isset($_SESSION["username"]) && isset($_SESSION["password"])) {
		$sslcert_file = defined('SSLCERT_FILE') ? SSLCERT_FILE : null;
		$sslcert_pass = defined('SSLCERT_PASS') ? SSLCERT_PASS : null;

		if(!isset($_SESSION['lang']))
		    $_SESSION['lang'] = LANG;
	        setlocale(LC_MESSAGES, LANG);

		$hresult = $GLOBALS["mapisession"]->logon($_SESSION["username"], $_SESSION["password"], DEFAULT_SERVER, $sslcert_file, $sslcert_pass);
	}

	// Check if user is authenticated
	if ($GLOBALS["mapisession"]->isLoggedOn()) {
		// Authenticated

		$urlAction = sanitizeGetValue('action', '', STRING_REGEX);
		if(!empty($urlAction)) {
			// get data from url and store it in session, which can be maintained across lots of redirects
			// between login.php and welcome.php and webclient.php
			storeURLDataToSession();

			// after storing data in session we can refresh the page to remove url data
			// and restore normal url for webapp
			header('Location: index.php', true, 303);
			exit;
		}

		// Instantiate Plugin Manager
		$GLOBALS['PluginManager'] = new PluginManager(ENABLE_PLUGINS);
		$GLOBALS['PluginManager']->detectPlugins(DISABLED_PLUGINS_LIST);
		$GLOBALS['PluginManager']->initPlugins(DEBUG_LOADER);

		if ($logon) {
			// we are coming here from login page, redirect again so we will remove $_POST data
			// otherwise when user tries to reload webapp, browser will ask to again send request which is invalid
			$GLOBALS['PluginManager']->triggerHook("server.index.login.success");

			header('Location: index.php', true, 303);
			exit;
		}

		// Create globals settings object
		$GLOBALS["settings"] = new Settings();

		// Create global language object
		$GLOBALS["language"] = new Language();

		// Set session settings (language & style)
		foreach($GLOBALS["settings"]->getSessionSettings() as $key=>$value){
			$_SESSION[$key] = $value;
		}

		// Get settings from post or session or settings
		if (isset($_REQUEST["language"]) && $GLOBALS["language"]->is_language($_REQUEST["language"])) {
			$lang = $_REQUEST["language"];
			$GLOBALS["settings"]->set("zarafa/v1/main/language", $lang);
		} else if(isset($_SESSION["lang"])) {
			$lang = $_SESSION["lang"];
			$GLOBALS["settings"]->set("zarafa/v1/main/language", $lang);
		} else {
			$lang = $GLOBALS["settings"]->get("zarafa/v1/main/language");
			if (empty($lang)) {
				$lang = LANG;
				$GLOBALS["settings"]->set("zarafa/v1/main/language", $lang);
			}
		}

		$GLOBALS["language"]->setLanguage($lang);

		// add extra header
		header("X-Zarafa: " . trim(file_get_contents('version')));

		// external files who need our login
		if ($load) {
			switch ($load) {
				case "translations.js":
					$GLOBALS['PluginManager']->triggerHook("server.index.load.jstranslations.before");
					include("client/translations.js.php");
					$GLOBALS['PluginManager']->triggerHook("server.index.load.jstranslations.after");
					break;
				case "custom":
					$name = sanitizeGetValue('name', '', STRING_REGEX);
					$GLOBALS['PluginManager']->triggerHook("server.index.load.custom", array('name' => $name));
					break;
				case "upload_attachment":
					$GLOBALS['PluginManager']->triggerHook("server.index.load.upload_attachment.before");
					include("server/upload_attachment.php");
					$GLOBALS['PluginManager']->triggerHook("server.index.load.upload_attachment.after");
					break;
				case "download_attachment":
					$GLOBALS['PluginManager']->triggerHook("server.index.load.download_attachment.before");
					include("client/download_attachment.php");
					$GLOBALS['PluginManager']->triggerHook("server.index.load.download_attachment.after");
					break;
				case "download_message":
					$GLOBALS['PluginManager']->triggerHook("server.index.load.download_message.before");
					include("client/download_message.php");
					$GLOBALS['PluginManager']->triggerHook("server.index.load.download_message.after");
					break;
				case "logon":
					include("client/login.php");
					break;
				default:
					// These hooks are defined twice (also when no "load" argument is supplied)
					$GLOBALS['PluginManager']->triggerHook("server.index.load.main.before");
					include("client/webclient.php");
					$GLOBALS['PluginManager']->triggerHook("server.index.load.main.after");
					break;
			}
		} else if ($_GET && array_key_exists("authenticate", $_GET)) {
			$version = trim(file_get_contents('version'));
			$data = array(
				"settings" => $GLOBALS["settings"]->getJSON(),
				"languages" => $GLOBALS["language"]->getJSON(),
				"user" => array(
					"username" 	=> addslashes($GLOBALS["mapisession"]->getUserName()),
					"fullname" 	=> addslashes($GLOBALS["mapisession"]->getFullName()),
					"entryid" 	=> bin2hex($GLOBALS["mapisession"]->getUserEntryid()),
					"email_address" => addslashes($GLOBALS["mapisession"]->getEmailAddress()),
					"smtp_address" 	=> addslashes($GLOBALS["mapisession"]->getSMTPAddress()),
					"search_key" 	=> bin2hex($GLOBALS["mapisession"]->getSearchKey()),
					"sessionid" 	=> $GLOBALS["mapisession"]->getSessionID()
				),
				"version" => array(
					"webapp"	=> $version,
					"zcp"		=> phpversion('mapi'),
					"server"	=> DEBUG_SHOW_SERVER ? DEBUG_SERVER_ADDRESS : '',
					"svn"		=> DEBUG_LOADER === LOAD_SOURCE ? svnversion() : ''
				),
				"server" => array(
					"enable_plugins"		=> !!ENABLE_PLUGINS,
					"enable_advanced_settings"	=> !!ENABLE_ADVANCED_SETTINGS,
					"max_attachments"		=> null,
					"max_attachment_size"		=> getMaxUploadSize(),
					"max_attachment_total_size"	=> null,
					"freebusy_load_start_offset" => FREEBUSY_LOAD_START_OFFSET,
					"freebusy_load_end_offset" => FREEBUSY_LOAD_END_OFFSET
				)
			);
			echo JSON::Encode(array("zarafa" => $data));
		} else if ($_GET && array_key_exists("verify", $_GET)) {

			$user = sanitizeGetValue('verify', '', USERNAME_REGEX);

			if($user == $_SESSION['username'])
				print "1";
			else
				print "0";

		} else if (!DISABLE_WELCOME_SCREEN && $GLOBALS["settings"]->get("zarafa/v1/main/show_welcome") !== false) {
			// The user wants to logon, but he never did this before (or was using
			// an older version of WebApp, before the Welcome screen was introduced),
			// we will show a Welcome to WebApp screen where some default settings
			// might be configured

			// These hooks are defined twice (also when there is a "load" argument supplied)
			$GLOBALS['PluginManager']->triggerHook("server.index.load.welcome.before");
			// Include welcome page
			include("client/welcome.php");
			$GLOBALS['PluginManager']->triggerHook("server.index.load.welcome.after");
		} else {
			// Set the show_welcome to true, so that when the admin is changing the
			// DISABLE_WELCOME_SCREEN option to false after some time, the users who are already
			// using the WebApp are not bothered with the Welcome Screen.
			$GLOBALS["settings"]->set("zarafa/v1/main/show_welcome", false);

			// Clean up old state files in tmp/session/
			$state = new State("index");
			$state->clean();

			// Clean up old attachments in tmp/attachments/
			$state = new AttachmentState();
			$state->clean();

			// clean search folders
			cleanSearchFolders();

			// These hooks are defined twice (also when there is a "load" argument supplied)
			$GLOBALS['PluginManager']->triggerHook("server.index.load.main.before");
			// Include webclient
			include("client/webclient.php");
			$GLOBALS['PluginManager']->triggerHook("server.index.load.main.after");
		}

		// Save the settings to the MAPI store
		$GLOBALS['settings']->saveSettings();
	} else if (empty($load) || $load === 'logon') {
		// We are not authenticated, and the requested page was either
		// the logon page itself, or the default page. In either case
		// we can redirect the user back to the logon page.
		$GLOBALS["language"] = new Language();
		$GLOBALS["language"]->setLanguage(LANG);

		if(isset($GLOBALS["hresult"])) {
			switch($GLOBALS["hresult"]) {
				case MAPI_E_LOGON_FAILED:
				case MAPI_E_UNCONFIGURED:
					// destroy the session so another login attempt will not use preserved data
					destroySession();
					break;
			}
		}

		// REMOTE_USER is set when apache has authenticated the user, means Single Sign-on
		// environment is in effect. Don't redirect to the webapp login form.
		if (!isset($_SERVER['REMOTE_USER'])){
			// NOTE: We have saved the $hresult in the $GLOBALS
			// object, the login.php will obtain the code from there.
			include("client/login.php");
		} else {
			header('Location: index.php', true, 303);
			exit;
		}
	} else if ($hresult === MAPI_E_NETWORK_ERROR) {
		// The user is not logged in because the zarafa-server could not be reached.
		// Return a HTTP 503 error so the client can act upon this event correctly.
		header('HTTP/1.1 503 Service unavailable');
		header("X-Zarafa-Hresult: " . get_mapi_error_name($hresult));
	} else {
		// The session expired, or the user is otherwise not logged on.
		// Return a HTTP 401 error so the client can act upon this event correctly.
		header('HTTP/1.1 401 Unauthorized');
		header("X-Zarafa-Hresult: " . get_mapi_error_name($hresult));
	}
?>
