<?php
	class AdvancedFindListModule extends ListModule
	{
		/**
		 * Constructor
		 * @param		int		$id			unique id.
		 * @param		array		$data		list of all actions.
		 */
		function AdvancedFindListModule($id, $data)
		{
			parent::ListModule($id, $data);
		}

		/**
		 * Executes all the actions in the $data variable.
		 * @return		boolean					true on success or false on failure.
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
							case "search":
								// get properties info
								$this->getPropertiesForMessageType($store, $entryid, $action);
								$this->search($store, $entryid, $action);
								break;
							case "updatesearch":
								$this->updatesearch($store, $entryid, $action);
								break;
							case "stopsearch":
								$this->stopSearch($store, $entryid, $action);
								break;
							case "delete":
								$this->delete($store, $parententryid, $entryid, $action);
								break;
							case "delete_searchfolder":
								$this->deleteSearchFolder($store, $entryid, $action);
								break;
							case "save":
								$this->save($store, $parententryid, $action);
								break;
						}
					} catch (MAPIException $e) {
						$this->processException($e, $actionType);
					}
				}
			}
		}

		/**
		 * Function will set properties for particular message class
		 * @param		Object		$store		MAPI Message Store Object
		 * @param		HexString	$entryid	entryid of the folder
		 * @param		Array		$action		the action data, sent by the client
		 */
		function getPropertiesForMessageType($store, $entryid, $action)
		{
			if(isset($action["container_class"])) {
				$messageType = $action["container_class"];

				switch($messageType) {
					case "IPF.Appointment":
						$this->properties = $GLOBALS["properties"]->getAppointmentProperties();
						break;
					case "IPF.Contact":
						$this->properties = $GLOBALS["properties"]->getContactProperties();
						break;
					case "IPF.Journal":		// not implemented
						break;
					case "IPF.Task":
						$this->properties = $GLOBALS["properties"]->getTaskProperties();
						break;
					case "IPF.StickyNote":
						$this->properties = $GLOBALS["properties"]->getStickyNoteProperties();
						break;
					case "IPF.Note":
					default:
						$this->properties = $GLOBALS["properties"]->getMailProperties();
						break;
				}
			}
		}
	}
?>
