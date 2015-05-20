<?php
/**
 * This file is used to set configuration options to a default value that have
 * not been set in the config.php.Each definition of a configuration value must
 * be preceeded by "if(!defined('KEY'))"
 */
if(!defined('CONFIG_CHECK')) define('CONFIG_CHECK', TRUE);
if(!defined('CONFIG_CHECK_COOKIES_HTTP')) define('CONFIG_CHECK_COOKIES_HTTP', FALSE);
if(!defined('CONFIG_CHECK_COOKIES_SSL')) define('CONFIG_CHECK_COOKIES_SSL', FALSE);

if(!defined('STATE_FILE_MAX_LIFETIME')) define('STATE_FILE_MAX_LIFETIME', 28*60*60);
if(!defined('UPLOADED_ATTACHMENT_MAX_LIFETIME')) define('UPLOADED_ATTACHMENT_MAX_LIFETIME', 6*60*60);
if(!defined('DISABLE_FULL_CONTACTLIST_THRESHOLD')) define('DISABLE_FULL_CONTACTLIST_THRESHOLD', -1);
if(!defined('ENABLE_PUBLIC_FOLDERS')) define('ENABLE_PUBLIC_FOLDERS', true);

/**
 * When set to true, we enable GZIP
 */
if(!defined('ENABLE_RESPONSE_COMPRESSION')) define('ENABLE_RESPONSE_COMPRESSION', true);

/**
 * When set to true this disables the fitlering of the HTML body.
 */
if(!defined('DISABLE_HTMLBODY_FILTER')) define('DISABLE_HTMLBODY_FILTER', false);
/**
 * When set to true this disables the login with the REMOTE_USER set by apache.
 */
if(!defined('DISABLE_REMOTE_USER_LOGIN')) define('DISABLE_REMOTE_USER_LOGIN', false);

/**
 * When set to true this disables the welcome screen to be shown for first time users.
 */
if(!defined('DISABLE_WELCOME_SCREEN')) define('DISABLE_WELCOME_SCREEN', false);

/**
 * By default we won't disable the FULL GAB, as it is a performance option
 * which, when enabled, prevents the full GAB to be loaded'
 */
if(!defined('DISABLE_FULL_GAB')) define('DISABLE_FULL_GAB', false);

/**
 * By default we disable the public contact folders, as it is a performance option
 * which, when enabled, may cause delay in loading of address-book
 */
if(!defined('DISABLE_PUBLIC_CONTACT_FOLDERS')) define('DISABLE_PUBLIC_CONTACT_FOLDERS', true);

/**
 * Limit the amount of members shown in the addressbook details dialog for a distlist. If the list
 * is too great the browser will hang loading and rendereing all the items. By default set to 0
 * which means it loads all members.
 */
if(!defined('ABITEMDETAILS_MAX_NUM_DISTLIST_MEMBERS')) define('ABITEMDETAILS_MAX_NUM_DISTLIST_MEMBERS', 0);

/**
 * Use direct booking by default (books resources directly in the calendar instead of sending a meeting
 * request)
 */
if(!defined('ENABLE_DIRECT_BOOKING')) define('ENABLE_DIRECT_BOOKING', true);

if(!defined('ENABLED_LANGUAGES')) define("ENABLED_LANGUAGES", "bg_BG;ca_ES;da_DK;el_GR;et_EE;fa_IR;gl_ES;hr_HR;ko_KR;lt_LT;pt_PT;si_SI;sv_SE;uk_UA;cs_CZ;de_DE;en_GB;en_US;es_ES;fr_FR;he_IL;it_IT;nl_NL;pt_BR;ru_RU;zh_CN;zh_TW;ja_JP;fi_FI;hu_HU;tr_TR;nb_NO;pl_PL");

if(!defined('ENABLE_PLUGINS')) define('ENABLE_PLUGINS', true);
if(!defined('PATH_PLUGIN_CONFIG_DIR')) define('PATH_PLUGIN_CONFIG_DIR', PATH_PLUGIN_DIR);

// Disable/enabled advanced settings
if(!defined('ENABLE_ADVANCED_SETTINGS')) define('ENABLE_ADVANCED_SETTINGS', false);

// Freebusy start offset that will be used to load freebusy data in appointments, number is subtracted from current time
if(!defined('FREEBUSY_LOAD_START_OFFSET')) define('FREEBUSY_LOAD_START_OFFSET', 7);

// Freebusy end offset that will be used to load freebusy data in appointments, number is added to current time
if(!defined('FREEBUSY_LOAD_END_OFFSET')) define('FREEBUSY_LOAD_END_OFFSET', 90);

// Standard password key for session password. We recommend to change the default value for security reasons 
// and a length of 16 characters. Passwords are only encrypted when the openssl module is installed
if(!defined('PASSWORD_KEY')) define('PASSWORD_KEY','a75356b0d1b81b7');
if(!defined('PASSWORD_IV')) define('PASSWORD_IV','b3f5a483');
/*
 * The following options are taken from the debug.php
 */
if(!defined('DEBUG_LOADER')) define('DEBUG_LOADER', LOAD_RELEASE);
if(!defined('DEBUG_XMLOUT')) define('DEBUG_XMLOUT', false);
if(!defined('DEBUG_XMLOUT_DIR')) define('DEBUG_XMLOUT_DIR', 'debug_xml/');
if(!defined('DEBUG_XMLOUT_GZIP')) define('DEBUG_XMLOUT_GZIP', false);
if(!defined('DEBUG_PLUGINS')) define('DEBUG_PLUGINS', false);
if(!defined('DEBUG_PLUGINS_DISABLE_CACHE')) define('DEBUG_PLUGINS_DISABLE_CACHE', false);
if(!defined('DEBUG_DUMP_FILE')) define('DEBUG_DUMP_FILE', 'debug.txt');
if(!defined('DEBUG_SHOW_SERVER')) define('DEBUG_SHOW_SERVER', false);
?>
