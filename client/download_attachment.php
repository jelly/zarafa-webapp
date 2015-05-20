<?php

/**
 * DownloadAttachment
 *
 * A class to manage downloading of attachments from message, additionally
 * this class can be used to download inline images from message as well.
 *
 * Main reason to create this class is to not pollute the global namespace.
 */
class DownloadAttachment
{
	/**
	 * Resource of the MAPIStore which holds the message which contains attachments
	 * This will be used to get MAPIMessage resource to open attachment table and get attachments
	 */
	private $store;

	/**
	 * Entryid of the MAPIMessage that contains attachments, this is only needed when we are trying to access
	 * saved attachments from saved message
	 */
	private $entryId;

	/**
	 * Resource of MAPIMessage that contains attachments.
	 */
	private $message;

	/**
	 * Content disposition type for the attachment that will be sent with header with the attachment data
	 * Possible values are 'inline' and 'attachment'. When content-type is application/octet-stream and
	 * content disposition type is 'attachment' then browser will show dialog to save attachment as instead of
	 * directly displaying content inline.
	 */
	private $contentDispositionType;

	/**
	 * Attachment number of the attachment that should be downloaded. For normal attachments this will contain
	 * a single element array with numeric value as sequential attachment number, for attachments that are not saved
	 * in AttachmentTable of MAPIMessage yet (recently uploaded attachments) this will give single element array
	 * having value as a string in form of 'filename randomstring'. When accessing embedded messages this array can contain
	 * multiple elements indicating attachment numbers at each level, So value [0, 1] will indicate we want to download
	 * second attachment of first embedded message.
	 */
	private $attachNum;

	/**
	 * Attachment Content Id is used to download inline images of the MAPIMessage, When requesting inline images only
	 * content id is passed but if we are accessing inline image from embedded message then besides content id,
	 * attachment number is also passed to access embedded message.
	 */
	private $attachCid;

	/**
	 * A random string that will be generated with every MAPIMessage instance to uniquely identify attachments that
	 * belongs to this MAPIMessage, this is mainly used to get recently uploaded attachments for MAPIMessage.
	 */
	private $dialogAttachments;

	/**
	 * Constructor
	 */
	public function DownloadAttachment()
	{
		$this->storeId = false;
		$this->entryId = false;
		$this->contentDispositionType = 'attachment';
		$this->attachNum = array();
		$this->attachCid = false;
	}

	/**
	 * Function will initialize data for this class object. it will also sanitize data
	 * for possible XSS attack because data is received in $_GET
	 */
	public function init($data)
	{
		if(isset($data['store'])) {
			$this->store = sanitizeValue($data['store'], '', ID_REGEX);
		}

		if(isset($data['entryid'])) {
			$this->entryId = sanitizeValue($data['entryid'], '', ID_REGEX);
		}

		if(isset($data['contentDispositionType'])) {
			$this->contentDispositionType = sanitizeValue($data['contentDispositionType'], 'attachment', STRING_REGEX);
		}

		if(!empty($data['attachNum'])) {
			/**
			 * if you are opening an already saved attachment then $data["attachNum"]
			 * will contain array of numeric index for that attachment (like 0 or 1 or 2)
			 *
			 * if you are opening a recently uploaded attachment then $data["attachNum"]
			 * will be a one element array and it will contain a string in "filename.randomstring" format
			 * like README.txtu6K6AH
			 */
			foreach($data['attachNum'] as $attachNum) {
				$num = sanitizeValue($attachNum, false, NUMERIC_REGEX);

				if($num === false) {
					// string is passed in attachNum so get it
					$num = sanitizeValue($attachNum, '', FILENAME_REGEX);

					if(!empty($num)) {
						array_push($this->attachNum, $num);
					}
				} else {
					array_push($this->attachNum, (int) $num);
				}
			}
		}

		if(isset($data['attachCid'])) {
			$this->attachCid = sanitizeValue($data['attachCid'], '', FILENAME_REGEX);
		}

		if(isset($data['dialog_attachments'])) {
			$this->dialogAttachments = sanitizeValue($data['dialog_attachments'], '', STRING_REGEX);
		}

		if($this->store && $this->entryId) {
			$this->store = $GLOBALS['mapisession']->openMessageStore(hex2bin($this->store));
			$this->message = mapi_msgstore_openentry($this->store, hex2bin($this->entryId));
			
			// Decode smime signed messages on this message
			parse_smime($this->store, $this->message);
		}
	}

	/**
	 * Returns inline image attachment based on specified attachCid, To get inline image attachment
	 * we need to compare passed attachCid with PR_ATTACH_CONTENT_ID, PR_ATTACH_CONTENT_LOCATION or
	 * PR_ATTACH_FILENAME and if that matches then we can get that attachment.
	 * @param MAPIAttach $attachment (optional) embedded message attachment from where we need to get the inline image
	 * @return MAPIAttach attachment that is requested and will be sent to client
	 */
	public function getAttachmentByAttachCid($attachment = false)
	{
		// If the inline image was in a submessage, we have to open that first
		if($attachment !== false) {
			$this->message = mapi_attach_openobj($attachment);
		}

		/**
		 * restriction to find inline image attachment with matching cid passed
		 */
		$restriction =	Array(RES_OR,
							Array(
								Array(RES_CONTENT,
									Array(
										FUZZYLEVEL => FL_FULLSTRING | FL_IGNORECASE,
										ULPROPTAG => PR_ATTACH_CONTENT_ID,
										VALUE => array(PR_ATTACH_CONTENT_ID => $this->attachCid)
									)
								),
								Array(RES_CONTENT,
									Array(
										FUZZYLEVEL => FL_FULLSTRING | FL_IGNORECASE,
										ULPROPTAG => PR_ATTACH_CONTENT_LOCATION,
										VALUE => array(PR_ATTACH_CONTENT_LOCATION => $this->attachCid)
									)
								),
								Array(RES_CONTENT,
									Array(
										FUZZYLEVEL => FL_FULLSTRING | FL_IGNORECASE,
										ULPROPTAG => PR_ATTACH_FILENAME,
										VALUE => array(PR_ATTACH_FILENAME => $this->attachCid)
									)
								)
							)
						);

		// Get the attachment table
		$attachTable = mapi_message_getattachmenttable($this->message);
		mapi_table_restrict($attachTable, $restriction, TBL_BATCH);
		$attachments = mapi_table_queryallrows($attachTable, Array(PR_ATTACH_NUM));

		if(count($attachments) > 0) {
			// there should be only one attachment
			$attachment = mapi_message_openattach($this->message, $attachments[0][PR_ATTACH_NUM]);
		}

		return $attachment;
	}

	/**
	 * Returns attachment based on specified attachNum, additionally it will also get embedded message
	 * if we want to get the inline image attachment.
	 * @return MAPIAttach embedded message attachment or attachment that is requested
	 */
	public function getAttachmentByAttachNum()
	{
		$attachment = false;

		$len = count($this->attachNum);

		// Loop through the attachNums, message in message in message ...
		for($index = 0; $index < $len - 1; $index++) {
			// Open the attachment
			$tempattach = mapi_message_openattach($this->message, $this->attachNum[$index]);
			if($tempattach) {
				// Open the object in the attachment
				$this->message = mapi_attach_openobj($tempattach);
			}
		}

		// open the attachment
		$attachment = mapi_message_openattach($this->message, $this->attachNum[$len - 1]);

		return $attachment;
	}

	/**
	 * Function will open passed attachment and generate response for that attachment to send it to client.
	 * This should only be used to download attachment that is already saved in MAPIMessage.
	 * @param MAPIAttach $attachment attachment which will be dumped to client side
	 * @return Response response to sent to client including attachment data
	 */
	public function downloadSavedAttachment($attachment)
	{
		// Check if the attachment is opened
		if($attachment) {
			// Get the props of the attachment
			$props = mapi_attach_getprops($attachment, array(PR_ATTACH_LONG_FILENAME, PR_ATTACH_MIME_TAG, PR_DISPLAY_NAME, PR_ATTACH_METHOD));

			// Content Type
			$contentType = 'application/octet-stream';
			// Filename
			$filename = 'ERROR';

			// Set filename
			if(isset($props[PR_ATTACH_LONG_FILENAME])) {
				$filename = $props[PR_ATTACH_LONG_FILENAME];
			} else if(isset($props[PR_ATTACH_FILENAME])) {
				$filename = $props[PR_ATTACH_FILENAME];
			} else if(isset($props[PR_DISPLAY_NAME])) {
				$filename = $props[PR_DISPLAY_NAME];
			}

			// Set content type, but only get it when disposition type is inline, otherwise it will be default to application/octet-stream
			if($this->contentDispositionType !== 'attachment') {
				if(isset($props[PR_ATTACH_MIME_TAG])) {
					$contentType = $props[PR_ATTACH_MIME_TAG];
				} else {
					// Parse the extension of the filename to get the content type
					if(strrpos($filename, '.') !== false) {
						$extension = strtolower(substr($filename, strrpos($filename, '.')));
						if (is_readable('mimetypes.dat')) {
							$fh = fopen('mimetypes.dat', 'r');
							$ext_found = false;

							while (!feof($fh) && !$ext_found) {
								$line = fgets($fh);
								preg_match('/(\.[a-z0-9]+)[ \t]+([^ \t\n\r]*)/i', $line, $result);

								if ($extension == $result[1]) {
									$ext_found = true;
									$contentType = $result[2];
								}
							}

							fclose($fh);
						}
					}
				}
			}
			
			// Set the headers
			header('Pragma: public');
			header('Expires: 0'); // set expiration time
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header('Content-Disposition: ' . $this->contentDispositionType . '; filename="' . addslashes(browserDependingHTTPHeaderEncode($filename)) . '"');
			header('Content-Transfer-Encoding: binary');
			header('Content-Type: ' . $contentType);

			// Open a stream to get the attachment data
			$stream = mapi_openproperty($attachment, PR_ATTACH_DATA_BIN, IID_IStream, 0, 0);
			$stat = mapi_stream_stat($stream);
			// File length
			header('Content-Length: ' . $stat['cb']);

			// Print stream
			for($i = 0; $i < $stat['cb']; $i += BLOCK_SIZE) {
				echo mapi_stream_read($stream, BLOCK_SIZE);
			}
		}
	}

	/**
	 * Function will send attachment data to client side.
	 * This should only be used to download attachment that is recently uploaded and not saved in MAPIMessage.
	 * @return Response response to sent to client including attachment data
	 */
	public function downloadUnsavedAttachment()
	{
		// return recently uploaded file 
		$attachment_state = new AttachmentState();
		$attachment_state->open();

		// there will be only one value in attachNum so directly access 0th element of it
		$tmpname = $attachment_state->getAttachmentPath($this->attachNum[0]);
		$fileinfo = $attachment_state->getAttachmentFile($this->dialogAttachments, $this->attachNum[0]);

		// Check if the file still exists
		if (is_file($tmpname)) {
			// Set the headers
			header('Pragma: public');
			header('Expires: 0'); // set expiration time
			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			header('Content-Disposition: ' . $this->contentDispositionType . '; filename="' . addslashes(browserDependingHTTPHeaderEncode($fileinfo['name'])) . '"');
			header('Content-Transfer-Encoding: binary');
			header('Content-Type: application/octet-stream');
			header('Content-Length: ' . filesize($tmpname));

			// Open the uploaded file and print it
			$file = fopen($tmpname, 'r');
			fpassthru($file);
			fclose($file);
		}
		$attachment_state->close();
	}

	/**
	 * Generic function to check passed data and decide which type of attachment is requested.
	 */
	public function download()
	{
		$attachment = false;

		// check if inline image is requested
		if($this->attachCid) {
			// check if the inline image is in a embedded message
			if(count($this->attachNum) > 0) {
				// get the embedded message attachment
				$attachment = $this->getAttachmentByAttachNum();
			}

			// now get the actual attachment object that should be sent back to client
			$attachment = $this->getAttachmentByAttachCid($attachment);

			// no need to return anything here function will echo all the output
			$this->downloadSavedAttachment($attachment);

		} else if(count($this->attachNum) > 0) {
			// check if temporary unsaved attachment is requested
			if(is_string($this->attachNum[0])) {
				$this->downloadUnsavedAttachment();
			} else {
				// normal saved attachment is requested, so get it
				$attachment = $this->getAttachmentByAttachNum();

				if($attachment === false) {
					// something terrible happened and we can't continue
					return;
				}

				// no need to return anything here function will echo all the output
				$this->downloadSavedAttachment($attachment);
			}
		}
	}
}

// create instance of class to download attachment
$attachInstance = new DownloadAttachment();

// initialize variables
$attachInstance->init($_GET);

// download attachment
$attachInstance->download();

?>