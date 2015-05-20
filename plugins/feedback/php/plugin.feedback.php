<?php

/**
 * Direct user feedback plugin
 *
 * Adds a 'got feedback' button so that all users of any WebApp
 * installation can give feedback to Zarafa.  All feedback ends
 * up in the Jira project FDB.
 *
 */

class PluginFeedback extends Plugin {
	/**
	 * Constructor
	 */
	function PluginFeedback() {
	}

	/**
	 * Function initializes the Plugin and registers all hooks
	 *
	 * @return void
	 */
	function init() {
		$this->registerHook('server.core.settings.init.before');
		$this->registerHook('server.main.include.jsfiles');
	}

	/**
	 * Function is executed when a hook is triggered by the PluginManager
	 *
	 * @param string $eventID the id of the triggered hook
	 * @param mixed $data object(s) related to the hook
	 * @return void
	 */
	function execute($eventID, &$data) {
		switch($eventID) {
			case 'server.core.settings.init.before' :
				$this->injectPluginSettings($data);
				break;
			case 'server.main.include.jsfiles' :
				$this->addJiraJsFile($data);
				break;
		}
	}

	/**
	 * Function includes the the files neccessary for using
	 * the feedback button.  This is retrieved from the issue
	 * collectors configuration inside Jira,
	 * https://jira.zarafa.com/secure/ViewCollector!default.jspa?projectKey=FDB&collectorId=d6b19906
	 *  @param $data
	 */
	function addJiraJsFile(&$data) {
		// make sure to load remote files only when plugin is enabled
		if($GLOBALS['settings']->get('zarafa/v1/plugins/feedback/enable') == true) {
			//removing https: provides protocols compatibility, especially in IE9
			$data['files'][] = '//jira.zarafa.com/s/en_US-ydn9lh-418945332/803/1088/1.2/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?collectorId=d6b19906';
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default
	 * settings. Registers the sysadmin defaults for the feedback plugin.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'feedback' => Array(
							'enable' => PLUGIN_FEEDBACK_USER_DEFAULT_ENABLE
						)
					)
				)
			)
		));
	}
}
?>
