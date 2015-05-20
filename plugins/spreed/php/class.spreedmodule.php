<?php
/*
 * Copyright (C) 2005 - 2015  Zarafa B.V. and its licensors
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3, 
 * as published by the Free Software Foundation with the following additional 
 * term according to sec. 7:
 *  
 * According to sec. 7 of the GNU Affero General Public License, version
 * 3, the terms of the AGPL are supplemented with the following terms:
 * 
 * "Zarafa" is a registered trademark of Zarafa B.V. The licensing of
 * the Program under the AGPL does not imply a trademark license.
 * Therefore any rights, title and interest in our trademarks remain
 * entirely with us.
 * 
 * However, if you propagate an unmodified version of the Program you are
 * allowed to use the term "Zarafa" to indicate that you distribute the
 * Program. Furthermore you may use our trademarks where it is necessary
 * to indicate the intended purpose of a product or service provided you
 * use it in accordance with honest practices in industrial or commercial
 * matters.  If you want to propagate modified versions of the Program
 * under the name "Zarafa" or "Zarafa Server", you may only do so if you
 * have a written permission by Zarafa B.V. (to acquire a permission
 * please contact Zarafa at trademark@zarafa.com).
 * 
 * The interactive user interface of the software displays an attribution
 * notice containing the term "Zarafa" and/or the logo of Zarafa.
 * Interactive user interfaces of unmodified and modified versions must
 * display Appropriate Legal Notices according to sec. 5 of the GNU
 * Affero General Public License, version 3, when you propagate
 * unmodified or modified versions of the Program. In accordance with
 * sec. 7 b) of the GNU Affero General Public License, version 3, these
 * Appropriate Legal Notices must retain the logo of Zarafa or display
 * the words "Initial Development by Zarafa" if the display of the logo
 * is not reasonably feasible for technical reasons. The use of the logo
 * of Zarafa in Legal Notices is allowed for unmodified and modified
 * versions of the software.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *  
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

?>
<?php
/**
 * Spreed Plugin
 */

require_once(PATH_PLUGIN_DIR . "/spreed/php/inc/class.adhocspreedapi.php");
require_once(PATH_PLUGIN_DIR . "/spreed/php/inc/class.spreedconference.php");
/**
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * This class is used to communicate with the client side of
 * the Zarafa WebAccess Spreed plugin. It processes all events
 * to retrieve mails and contacts, but also processes the start
 * of the Spreed meeting so everything is configured correctly
 * using the SpreedConference, SpreedFile, SpreedParticipant, and
 * SpreedAPI classes.
 *
 */
class SpreedModule extends Module
{
	/*
	 * The Spreed API should be accessed through the get api method only,
	 * this will make sure an api object is created and returned, which
	 * limits the load in case the client does not need the api for other
	 * calls.
	 */
	private /*SpreedAPI*/ $api;
	private /*boolean*/ $useAdhocApi = true;

	/**
	 * The link to created Spreed SpreedConference object.
	 *
	 * @private
	 * @var null
	 */
	private $conf = null;

	/**
	 * The path to the Spreed Attachments folder in which
	 * attachments will be placed temporarily.
	 * @private
	 */
	private $attachmentsdir;

	/**
	 * Constructor
	 * @param int $id unique id.
	 * @param array $data list of all actions.
	 */
	public function SpreedModule($id, $data)
	{
		parent::Module($id, $data);

		$this->api = null;

		$this->attachmentsdir = TMP_PATH . DIRECTORY_SEPARATOR . 'spreed';
	}

	/**
	 * Get the Spreed API Instance, or create it if this is the first
	 * time this function is being called. This prevents the system
	 * from making unnecessary API calls to the Spreed server if the
	 * api is not used.
	 * @return SpreedConference The instance of the SpreedConference class.
	 */
	private function getApi()
	{
		if($this->api == null){
			if($this->useAdhocApi){
				$this->api = new AdhocSpreedApi();
				$this->api->init();
			} else {
				$this->api = new AuthSpreedApi();
				$this->api->init();
			}
		}
		return $this->api;
	}

	/**
	 * Process the incoming events that were fire by the client.
	 * Depending on the attributes given this will get the mails,
	 * contacts, or even setup the Spreed call.
	 * @return boolean True if everything was processed correctly.
	 */
	public function execute()
	{
		$result = false;

		foreach($this->data as $actionType => $actionData)
		{
			if(isset($actionType)) {
				try {
					switch($actionType)
					{
						case "save":
							$result = $this->save($actionData);
							break;
						case "clear":
							$result = $this->clear($actionData);
							break;
						default:
							$this->handleUnknownActionType($actionType);
					}

				} catch (MAPIException $e) {
					$this->sendFeedback(false, $this->errorDetailsFromException($e));
				} catch (SpreedException $e) {
					$this->sendFeedback(false, $this->errorDetailsFromException($e));
				}

			}
		}

		return $result;
	}

	/**
	 * Process the clear event fired at the client, this will remove
	 * all the uploaded file attachments at once if they were already
	 * uploaded to the server.
	 * @param mixed $action The action array with all the attributes set.
	 */
	public function clear($action)
	{
		$attachment_state = new AttachmentState();
		$attachment_state->open();
		$this->deleteUploads($action, $attachment_state);
		$attachment_state->close();
	}

	/**
	 * Setup the spreed conference with all details specified by the
	 * given attribute array. This will use the SpreedConference, SpreedParticipant
	 * SpreedFile, and SpreedAPI classes to setup the Spreed web-meeting on the remote
	 * servers of Spreed.
	 * @param mixed $action The action attributes which contains all the details for
	 * the new spreed meeting.
	 * @return boolean True if the web-meeting is set-up correctly.
	 */
	public function save($action)
	{
		$this->conf = null;
		date_default_timezone_set('UTC');

		$duration = ($action['props']['end_time'] - $action['props']['start_time']) / 60;
		//Collect the data from record
		$action['participants'] = $action['recipients'];
		$action['title']      = $action['props']['subject'];
		$action['description']  = $action['props']['description'];
		$action['timezone']     = $action['props']['timezone'];
		$action['start_time']   = $action['props']['start_time'];
		$action['duration']     = $duration;

		$status = false;

		// Set-up the response data object
		$data = array(
			'title' => $action["title"],
			'error' => '',
			'checkinURL' => ''
		);
		$data["attributes"] = array("type" => "spreedCheckin");

		$nrOfParticipants = count($action['participants']);
		if($nrOfParticipants == 0){
			// This check is added on the server side too in case the Javascript failed
			// to check, or if the user is deliberately trying to frustrate the system.
			throw new SpreedException( _("You need at least one other participant to set-up a Spreed Meeting, select or add another participant to continue.") );
		} else if($nrOfParticipants > PLUGIN_SPREED_MAX_PARTICIPANTS){
			// This check is added on the server side too in case the Javascript failed
			// to check, or if the user is deliberately trying to frustrate the system.
			throw new SpreedException( sprintf(_("Too many participants. You are not allowed to add more than %d other participants with this version of Spreed."), PLUGIN_SPREED_MAX_PARTICIPANTS ));
		} else if(array_key_exists($action['timezone'], $GLOBALS['spreed_timezones']) == false){
			// Although we are the ones that set-up the option select list, we may
			// never trust the client input, report the error back to the user.
			throw new SpreedException(  _("The timezone you specified is incorrect, please select another option.") );
		} else {
			$default_lang = substr($GLOBALS["language"]->getSelected(), 0, 2);
			if(!array_key_exists($default_lang, $GLOBALS['spreed_languages'])){
				$default_lang = 'en';
			}

			$api = $this->getApi();
			if(!$this->useAdhocApi){
				$api->deleteAllOpenConferences();
			}
			$creatorNameArray = SpreedParticipant::extractNameArrayFromNameField(($GLOBALS["mapisession"]->getFullName()));
			$creator = new SpreedParticipant($creatorNameArray['firstname'], $creatorNameArray['lastname'], $creatorNameArray['organisation'], strtolower($GLOBALS["mapisession"]->getSMTPAddress()), '', $default_lang, $action['timezone'], true);

			$date = new DateTime(date('Y-m-d H:i:s', $action['props']['start_time']),new DateTimeZone($action["timezone"]));

			$this->conf = new SpreedConference($action['title'], $action['description'], $date, intval($action['duration']), $action["timezone"], $default_lang, $creator);

			$users = $action['participants'];

			foreach($users as $u) {
				if ($u['object_type']==MAPI_DISTLIST) {
					continue;
				}
				$userName = SpreedParticipant::extractNameArrayFromDisplayName($u['display_name']);

				if(array_key_exists($u['language'], $GLOBALS['spreed_languages']) == false){
					// although we are the ones that set-up the option select list, we may
					// never trust the client input, ignore the error and use English as our default.
					$u['language'] = 'en';
				} else if(array_key_exists($u['timezone'], $GLOBALS['spreed_timezones']) == false){
					// although we are the ones that set-up the option select list, we may
					// never trust the client input, ignore the error and use English as our default.
					$u['timezone'] = $action['timezone'];
				}

				// If no smtp_address is given, assume the email_address property is correct
				if (empty($u['smtp_address'])) {
					$u['smtp_address'] = $u['email_address'];
				}

				$this->conf->addUser(new SpreedParticipant(
					$userName['firstname'],
					$userName['lastname'],
					$userName['organisation'],
					strtolower($u['smtp_address']),
					'',
					$u['language'],
					$u['timezone'],
					$u['isModerator'] == 1
				));
			}

			$attachment_state = new AttachmentState();
			$attachment_state->open();
			$this->processUploads($action['attachments'], $attachment_state);

			$api->setupSpreedConference($this->conf);

			$data["checkinURL"] = $this->conf->getCreator()->getCheckInURL();

			$this->deleteUploads($action['attachments'], $attachment_state);
			$attachment_state->close();

			$status = true;
		}
		 if (!empty($data["checkinURL"]))
		{
			$this->addActionData("update", array("item" => array(
				'id' => $action['id'],
				'props' => array(
					'checkin_url' => $data["checkinURL"]
				)
			)));
			$GLOBALS["bus"]->addData($this->getResponseData());
			$status = true;
		} else {
			$GLOBALS["bus"]->addData($this->getResponseData());
			$status = true;
		}
		return $status;
	}

	/**
	 * Delete all the uploads of the current upload session.
	 * This will erase all the files that were uploaded in this
	 * session, and it will remove all other references to attachments
	 * that are stored inside messages. It will not, however, delete the
	 * attachments from the original mail messages.
	 * @param mixed $action The action attributes used to determine which
	 * upload session we are in.
	 * @param AttachmentState $attachment_state The Attachment State object
	 * which contains all attachments in this session
	 */
	public function deleteUploads($action, $attachment_state)
	{
		if (isset($action['dialog_attachments'])) {
			$files = $attachment_state->getAttachmentFiles($action['dialog_attachments']);
			if ($files) {
				// Loop through the uploaded attachments
				foreach ($files as $tmpname => $fileinfo) {
					// Delete the attachment from the state, and from the normal
					// attachment storage.
					$attachment_state->deleteUploadedAttachmentFile($action['dialog_attachments'], $tmpname);

					// In case it was uploaded to spreed, it will also have
					// been placed in the spreed attachments directory which we
					// will have to cleanup now.
					$tmpDir = $this->attachmentsdir . DIRECTORY_SEPARATOR . mb_basename($tmpname);
					$tmpFile = $tmpDir . DIRECTORY_SEPARATOR . mb_basename($fileinfo["name"]);

					if (is_dir($tmpDir)) {
						if (is_file($tmpFile)) {
							unlink($tmpFile);
						}
						rmdir($tmpDir);
					}
				}

				// Delete all the files in the state
				$attachment_state->clearAttachmentFiles($action['dialog_attachments']);
			}
		}

		// Cleanup any other lingering attachments
		cleanTemp($this->attachmentsdir, UPLOADED_ATTACHMENT_MAX_LIFETIME);
	}

	/**
	 * Once the Spreed web meeting is being set-up, this function will make
	 * sure all attachments that have been marked to be uploaded in the web
	 * meeting are available and will be added to the Spreed conference instance
	 * as new SpreedFile instances.
	 * @param mixed $action The action attributes.
	 * @param AttachmentState $attachment_state The Attachment State object
	 * which contains all attachments in this session
	 */
	public function processUploads($action, $attachment_state)
	{
		$dialogAttachments = $action['dialog_attachments'];
		if( isset($action['add']) ) {
			foreach($action['add'] as $attachmentRecord)
			{
				if($this->isUploadedFromSpreedDialog($attachmentRecord) )
				{
					//just set the dialogAttachment to correct value
					$dialogAttachments = $action['dialog_attachments'];
					$this->downloadAttachmentFromDraft($dialogAttachments, $attachment_state, $attachmentRecord);
				} elseif($this->isCopiedFromDraft($attachmentRecord) )
				{
					//just set the dialogAttachment to correct value
					$dialogAttachments = $attachmentRecord['original_attachment_store_id'];
					$this->downloadAttachmentFromDraft($dialogAttachments, $attachment_state, $attachmentRecord);
				} else {//Attachment record is copied from stored message
					//copy the files to tmp and add to session with current spreed record attachment store id as key
					$dialogAttachments = $action['dialog_attachments'];
					$attachmentInfo = $this->copyAttachmentFromMessageToTmp(
						$attachmentRecord['original_record_store_entry_id'],
						$attachmentRecord['original_record_entry_id'],
						$attachmentRecord['original_attach_num'],
						$attachment_state);
					$this->saveAttachmentInfoToSession($dialogAttachments, $attachmentInfo, $attachment_state);
				}
			}
			$this->addAttachmentFilesFromTmpToSpreed($dialogAttachments, $attachment_state);
		}
	}

	/**
	 * Get the new file downloaded from the unfinished draft email on frontend to session
	 * @param $dialogAttachment String Represents the current attachment dialog
	 * @param $attachment_state Object State with all the attachment files
	 * @param $attachmentRecord Array Record received from the frontend
	 */
	private function downloadAttachmentFromDraft($dialogAttachments, $attachment_state, $attachmentRecord) {
		$attachment_state->addAttachmentFile($dialogAttachments, $attachmentRecord['tmpname'], Array(
			"name"       => $attachmentRecord['name'],
			"size"       => $attachmentRecord['size'],
			"type"       => $attachmentRecord['filetype'],
			"sourcetype" => 'default',
			"tempname"   => $attachmentRecord['tmpname']
		));
	}


	/**
	 * Once the attachments are copied to AttachmentState, it's neccessary
	 * to setup a new spreed meeting with attachments from selected email.
	 *
	 * @param $dialog_attachments
	 * @param AttachmentState $attachment_state The Attachment State object
	 * which contains all attachments in this session
	 */
	private function addAttachmentFilesFromTmpToSpreed($dialogAttachments, $attachment_state)
	{
		$files = $attachment_state->getAttachmentFiles($dialogAttachments);
		if ($files) {
			foreach ($files as $tmpname => $attach) {
				if ($attach) {
					$origFile = $attachment_state->getAttachmentPath($tmpname);

					// For Spreed the attachment file name which we are going to
					// send is going to be the visible name of the attachment in
					// spreed. However, the attachments are stored with unique
					// names, so we must create a subfolder using that unique
					// name and move the file in there with the original name.
					//
					// FIXME: Ideally we should find a way where we can upload
					// the file and use an alternative filename. But that needs
					// to be fixed in ASpreedApi::uploadFileToSpreed()
					$tmpDir = $this->attachmentsdir . DIRECTORY_SEPARATOR . mb_basename($tmpname);
					$tmpFile = $tmpDir . DIRECTORY_SEPARATOR . mb_basename($attach['name']);

					mkdir($tmpDir, 0755, true /* recursive */);
					rename($origFile, $tmpFile);

					$this->conf->addFile(new SpreedFile($tmpFile));
				}
			}
		}
	}

	/**
	 * Check if we upload the attachment directly from Spreed Dialog.
	 *
	 * @param $attachmentRecord
	 * @return bool
	 */
	private function isUploadedFromSpreedDialog($attachmentRecord) {
		return  empty($attachmentRecord['original_attachment_store_id']) &&
			empty($attachmentRecord['original_record_entry_id']) &&
			empty($attachmentRecord['original_record_store_entry_id']);
	}

	/**
	 * Check if we copied attachment from newly created email
	 * which was not saved on server(thus parent record has no entryid).
	 *
	 * @param $attachmentRecord
	 * @return bool
	 */
	private function isCopiedFromDraft($attachmentRecord) {
		return  empty($attachmentRecord['original_record_entry_id']) &&
			!empty($attachmentRecord['original_attachment_store_id']) &&
			!empty($attachmentRecord['original_record_store_entry_id']);
	}


	/**
	 * Once Spreed meeting is setup from the email that already contains attachments,
	 * we don't need to upload attachmnets one more time, but we take the existing attachments from the
	 * MAPI store.
	 * @param $storeEntryId
	 * @param $messageEntryId
	 * @param $attachmentNumber
	 * @return array
	 */
	private function copyAttachmentFromMessageToTmp($storeEntryId, $messageEntryId, $attachmentNumber, $attachment_state) {

		// This means the attachment is a message item and is uploaded in sesssion file as mapi message Obj
		$copyfromStore = $GLOBALS["mapisession"]->openMessageStore(hex2bin($storeEntryId));
		$copyfrom = mapi_msgstore_openentry($copyfromStore , hex2bin($messageEntryId));

		// Get the attachment through MAPI
		$attachment = mapi_message_openattach($copyfrom, (int) $attachmentNumber);

		// Check if the attachment exists
		if($attachment){
			// Get the props of the attachment
			$props = mapi_attach_getprops($attachment, array(PR_ATTACH_NUM, PR_ATTACH_SIZE, PR_ATTACH_LONG_FILENAME, PR_ATTACHMENT_HIDDEN, PR_DISPLAY_NAME, PR_ATTACH_METHOD));
			$filename = "ERROR";

			// Try to obtain the real filename from the MAPI record
			if(isset($props[PR_ATTACH_LONG_FILENAME])) {
				$filename = $props[PR_ATTACH_LONG_FILENAME];
			} else if(isset($props[PR_ATTACH_FILENAME])) {
				$filename = $props[PR_ATTACH_FILENAME];
			} else if(isset($props[PR_DISPLAY_NAME])) {
				$filename = $props[PR_DISPLAY_NAME];
			}

			$tmpname = $attachment_state->getAttachmentTmpPath(stripslashes($filename));
			// Open a stream to get the attachment data
			$stream = mapi_openpropertytostream($attachment, PR_ATTACH_DATA_BIN);
			$stat = mapi_stream_stat($stream);

			// Open the file handle so we can store the contents of the
			// attachment in the file to upload later on.
			$fHandle = fopen($tmpname, "wb");

			// Write the attachment chunks to the temporary file
			// so we can upload them afterwars.
			for($i = 0; $i < $stat["cb"]; $i += BLOCK_SIZE) {
				if (fwrite($fHandle, mapi_stream_read($stream, BLOCK_SIZE)) === FALSE) {
					dump("Failed to write to " . $tmpname);
				}
			}
			// Close the write handle
			fclose($fHandle);
			// Set the default Content Type
			$contentType = "application/octet-stream";
		}
		return Array(
			"name" => $props[PR_ATTACH_LONG_FILENAME],
			"size" => $props[PR_ATTACH_SIZE],
			"origatnum" => $props[PR_ATTACH_NUM],
			"type" => $contentType,
			"storeid" => $storeEntryId,
			"entryid" =>$messageEntryId,
			"sourcetype" => 'default',
			"tempname"=> mb_basename($tmpname)
		);
	}

	/**
	 * Adds attachment data to AttachmentState for uploading to Spreed.
	 * @param $dialog_attachments
	 * @param $attachmentInfo
	 * @param AttachmentState $attachment_state The Attachment State object
	 * which contains all attachments in this session
	 */
	private function saveAttachmentInfoToSession($dialog_attachments, $attachmentInfo, $attachment_state)
	{
		$attachment_state->addAttachmentFile($dialog_attachments, $attachmentInfo['tempname'], Array(
			"name"       => $attachmentInfo['name'],
			"size"       => $attachmentInfo['size'],
			"origatnum"  => $attachmentInfo['origatnum'],
			"type"       => $attachmentInfo['type'],
			"storeid"    => $attachmentInfo['storeid'],
			"entryid"    => $attachmentInfo['entryid'],
			"sourcetype" => 'default',
			"tempname"	 => $attachmentInfo['tempname']
		));
	}
}
?>
