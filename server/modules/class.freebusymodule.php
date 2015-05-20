<?php
	/**
	 * FreeBusyModule Module
	 */
	class FreeBusyModule extends Module
	{
		function FreeBusyModule($id, $data)
		{
			parent::Module($id, $data);
		}
		
		function execute()
		{
			//add user
			foreach($this->data as $actionType => $selUser)
			{
				if(isset($actionType)) {
					try {
						switch($actionType){
							case "list":
								$this->addUserData($selUser);
								break;
							default:
								$this->handleUnknownActionType($actionType);
						}
					} catch (MAPIException $e) {
						$this->processException($e, $actionType);
					}
				}
			}
		}

		/**
		 * This function will get user info from address book and add freebusy data of the user to
		 * response.
		 *
		 * @param {Array} $selUser User that should be resolved
		 */
		function addUserData($selUser)
		{
			$data = array();
			$data["users"] = array();

			foreach ($selUser["users"] as $fbUser) {
				$user = array();

				// Copy the identifier of the user.
				$user["userid"] = $fbUser["userid"]; 
				$user["entryid"] = $fbUser["entryid"];

				// Obtain the Freebusy data for this user
				$busyArray = $this->getFreeBusyInfo($fbUser["entryid"], $selUser["start"], $selUser["end"]);

				if ($busyArray) {
					// We have freebusy information, go over the data
					// and insert the blocks into the user object.
					foreach ($busyArray as $busyItem) {
						$busy = array();
						$busy["status"] = $busyItem["status"];
						$busy["start"] = $busyItem["start"];
						$busy["end"] = $busyItem["end"];
						$user["items"][] = $busy;
					}
				} else {
					// No freebusy data available, create a single empty block
					$busy["status"] = -1;
					$busy["start"] = $selUser["start"];
					$busy["end"] = $selUser["end"];
					$user["items"][] = $busy;
				}

				$data["users"][] = $user;
			}

			$this->addActionData("list", $data);
			$GLOBALS["bus"]->addData($this->getResponseData());
		}

		/**
		 * This function will get freebusy data for user based on the timeframe passed in arguments.
		 *
		 * @param {HexString} $entryID Entryid of the user for which we need to get freebusy data
		 * @param {Number} $start start offset for freebusy publish range
		 * @param {Number} $end end offset for freebusy publish range
		 * @return {Array} freebusy blocks for passed publish range
		 */
		function getFreeBusyInfo($entryID, $start, $end)
		{
			$result = array();
			$fbsupport = mapi_freebusysupport_open($GLOBALS["mapisession"]->getSession());

			$fbDataArray = mapi_freebusysupport_loaddata($fbsupport, array(hex2bin($entryID)));

			if($fbDataArray[0] != NULL){
				foreach($fbDataArray as $fbDataUser){
					$rangeuser1 = mapi_freebusydata_getpublishrange($fbDataUser);
					if($rangeuser1 == NULL){
						return $result;
					}

					$enumblock = mapi_freebusydata_enumblocks($fbDataUser, $start, $end);
					mapi_freebusyenumblock_reset($enumblock);

					while(true){
						$blocks = mapi_freebusyenumblock_next($enumblock, 100);
						if(!$blocks){
							break;
						}

						foreach($blocks as $blockItem){
							$result[] = $blockItem;
						}
					}
				}
			}

			mapi_freebusysupport_close($fbsupport);

			return $result;
		}
	}
?>
