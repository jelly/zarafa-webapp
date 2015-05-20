<?php
/**
 * PluginStatsLoggingModule Module
 */
class PluginStatsLoggingModule extends Module
{
	var $filePath;
	var $fileName;

	/**
	 * Constructor
	 * @param int $id unique id.
	 * @param string $folderentryid Entryid of the folder. Data will be selected from this folder.
	 * @param array $data list of all actions.
	 */
	function PluginStatsLoggingModule($id, $data)
	{
		parent::Module($id, $data);

		$this->filePath = PLUGIN_STATSLOGGING_LOGFILE_PATH;
		$this->username = $GLOBALS['mapisession']->getUserName();
		$this->fileName = str_replace(Array('{user}','{date}','{sessionid}'), Array($this->username, date('Y-m-d'), session_id()), PLUGIN_STATSLOGGING_LOGFILE_NAMEFORMAT);
	}
	
	/**
	 * Executes all the actions in the $data variable.
	 * @return boolean true on success of false on fialure.
	 */
	function execute()
	{
		foreach($this->data as $actionType => $actionData)
		{
			if(isset($actionType)) {
				try {
					switch($actionType)
					{
						case "storeactions":
							if(PLUGIN_STATSLOGGING_USER_DEFAULT_ENABLE_LOGGING){
								$this->writeToFile($actionData['actions']);
							}
							$this->sendFeedback(true);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}
				} catch (MAPIException $e) {
					$this->sendFeedback(false, $this->errorDetailsFromException($e));
				}
			}
		}
	}

	/**
	 * Write the supplied lines to the logging file.
	 * @param Array $lines List of lines to be written
	 */
	function writeToFile($lines)
	{
		$file = $this->getFile();
		if($file){
			for($i=0;$i<count($lines);$i++){
				fwrite($file, $lines[$i]."\r\n");
			}
			fclose($file);
		}
	}

	/**
	 * Will get the log file for this user. If that file is not yet created
	 * it will create one. 
	 * @return resource The opened file
	 */
	function getFile()
	{
		if(!is_dir($this->filePath)){
			$result = mkdir($this->filePath, 0755, true);
			if(!$result){
				throw new ZarafaException(pgettext('plugin_statslogging', 'Cannot create directory for log file for user interface statistics logging plugin.'));
			}
		}

		$file = fopen($this->filePath . $this->fileName, "a+");
		if($file){
			return $file;
		}else{
			throw new ZarafaException(pgettext('plugin_statslogging', 'Cannot create log file for user interface statistics logging plugin.'));
		}
	}
}
?>
