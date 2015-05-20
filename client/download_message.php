<?php
/**
 * DownloadMessage
 *
 * A class to manage downloading of message as a file,
 * it will generate the message as RFC822-formatted e-mail stream.
  */
class DownloadMessage
{
	/**
	 * Resource of the MAPIStore which holds the message which we need to save as file.
	 */
	private $store;

	/**
	 * Entryid of the MAPIStore which holds the message which we need to save as file.
	 */
	private $storeId;

	/**
	 * Entryid of the MAPIMessage which we need to save as file.
	 */
	private $entryId;

	/**
	 * Resource of MAPIMessage which we need to save as file.
	 */
	private $message;

	/**
	 * Constructor
	 */
	public function DownloadMessage()
	{
		$this->storeId = false;
		$this->entryId = false;
	}

	/**
	 * Function will initialize data for this class object. it will also sanitize data
	 * for possible XSS attack because data is received in $_GET
	 * @param Array $data parameters received with the request.
	 */
	public function init($data)
	{
		if(isset($data['storeid'])) {
			$this->storeId = sanitizeValue($data['storeid'], '', ID_REGEX);
		}

		if(isset($data['entryid'])) {
			$this->entryId = sanitizeValue($data['entryid'], '', ID_REGEX);
		}

		$this->store = $GLOBALS['mapisession']->openMessageStore(hex2bin($this->storeId));
		$this->message = mapi_msgstore_openentry($this->store, hex2bin($this->entryId));

		// Decode smime signed messages on this message
		parse_smime($this->store, $this->message);
	}

	/**
	 * Function will generate a file to download message, For email messages it will open email as
	 * inet object and return message contents as eml format file When user has IMAP enabled.
	 * The below mentioned properties are configured with the whole message as a stream in it, while IMAP is enabled :
	 * PR_EC_IMAP_EMAIL
	 * PR_EC_IMAP_EMAIL_SIZE
	 * PR_EC_IMAP_BODY
	 * PR_EC_IMAP_BODYSTRUCTURE
	 */
	function downloadMessageAsFile()
	{
		if($this->message && $this->store) {
			// get message properties.
			$messageProps = mapi_getprops($this->message, array(PR_SUBJECT, PR_EC_IMAP_EMAIL, PR_MESSAGE_CLASS));

			$isSupportedMessage = (
				(stripos($messageProps[PR_MESSAGE_CLASS], 'IPM.Note') === 0)
				|| (stripos($messageProps[PR_MESSAGE_CLASS], 'Report.IPM.Note') === 0)
				|| (stripos($messageProps[PR_MESSAGE_CLASS], 'IPM.Schedule') === 0)
			);

			if ($isSupportedMessage) {
				// If RFC822-formatted stream is already available in PR_EC_IMAP_EMAIL property
				// than directly use it, generate otherwise.
				if(isset($messageProps[PR_EC_IMAP_EMAIL]) || propIsError(PR_EC_IMAP_EMAIL, $messageProps) == MAPI_E_NOT_ENOUGH_MEMORY) {
					// Stream the message to properly get the PR_EC_IMAP_EMAIL property
					$stream = mapi_openproperty($this->message, PR_EC_IMAP_EMAIL, IID_IStream, 0, 0);
				} else {
					// Get addressbook for current session
					$addrBook = $GLOBALS['mapisession']->getAddressbook();

					// Read the message as RFC822-formatted e-mail stream.
					$stream = mapi_inetmapi_imtoinet($GLOBALS['mapisession']->getSession(), $addrBook, $this->message, array());
				}

				if (!empty($messageProps[PR_SUBJECT])) {
					$filename = $messageProps[PR_SUBJECT] . '.eml';
				} else {
					$filename = _('Untitled') . '.eml';
				}

				// Set the headers
				header('Pragma: public');
				header('Expires: 0'); // set expiration time
				header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
				header('Content-Transfer-Encoding: binary');

				// Set Content Disposition header
				header('Content-Disposition: attachment; filename="' . addslashes(browserDependingHTTPHeaderEncode($filename)) . '"');
				// Set content type header
				header('Content-Type: application/octet-stream');

				// Set the file length
				$stat = mapi_stream_stat($stream);
				header('Content-Length: ' . $stat['cb']);

				// Read whole message and echo it.
				for($i = 0; $i < $stat['cb']; $i += BLOCK_SIZE) {
					// Print stream
					echo mapi_stream_read($stream, BLOCK_SIZE);

					// Need to discard the buffer contents to prevent memory
					// exhaustion while echoing large content.
					ob_flush();
				}
			} else {
				throw new ZarafaException(sprintf(_("Eml creation of '%s' is not supported"), $this->getMessageType($messageProps[PR_MESSAGE_CLASS])));
			}
		}
	}

	/**
	 * Function will return message type according to the MAPI message class
	 * to display exception. so, user can easily understand the exception message.
	 *
	 * @param string $mapiMessageClass message type as defined in MAPI.
	 * @return string $messageClass message type to prepare exception message.
	 */
	function getMessageType($mapiMessageClass)
	{
		$messageClass = '';

		// Here, we have technical message class, so we need to remove technical prefix/postfix, if any.
		// Creates an array of strings by splitting the message class from dot(.)
		$explodedMessageClass = explode(".", $mapiMessageClass);
		$ipmIndex = array_search('IPM', $explodedMessageClass);

		// Convert message class into human readable format, so user can easily understand the display message.
		switch ($explodedMessageClass[$ipmIndex + 1]) {
			case 'Appointment':
				$messageClass = _('Appointment');
				break;
			case 'StickyNote':
				$messageClass = _('Sticky Note');
				break;
			case 'Contact':
				$messageClass = _('Contact');
				break;
			case 'DistList':
				$messageClass = _('Distribution list');
				break;
			case 'Task':
				$messageClass = _('Task');
				break;
			case 'TaskRequest':
				$messageClass = _('Task Request');
				break;
			default:
				$messageClass = $mapiMessageClass;
		}

		return $messageClass;
	}

	/**
	 * Function will encode all the necessary information about the exception
	 * into JSON format and send the response back to client.
	 *
	 * @param object $exception Exception object.
	 */
	function handleSaveMessageException($exception)
	{
		$return = array();

		// MAPI_E_NOT_FOUND exception contains generalize exception message.
		// Set proper exception message as display message should be user understandable.
		if($exception->getCode() == MAPI_E_NOT_FOUND) {
			$exception->setDisplayMessage(_('Could not find message, either it has been moved or deleted.'));
		}

		// Set the headers
		header('Expires: 0'); // set expiration time
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');

		// Set Content Disposition header
		header('Content-Disposition: inline');
		// Set content type header
		header('Content-Type: text/plain');

		//prepare exception response according to exception class
		if($exception instanceof MAPIException) {
			$return = array(
				'success' => false,
				'zarafa' => array(
					'error' => array(
						'type' => ERROR_MAPI,
						'info' => array(
							'hresult' => $exception->getCode(),
							'hresult_name' => get_mapi_error_name($exception->getCode()),
							'file' => $exception->getFileLine(),
							'display_message' => $exception->getDisplayMessage()
						)
					)
				)
			);
		} else if($exception instanceof ZarafaException) {
			$return = array(
				'success' => false,
				'zarafa' => array(
					'error' => array(
						'type' => ERROR_ZARAFA,
						'info' => array(
							'file' => $exception->getFileLine(),
							'display_message' => $exception->getDisplayMessage(),
							'original_message' => $exception->getMessage()
						)
					)
				)
			);
		} else if($exception instanceof BaseException) {
			$return = array(
				'success' => false,
				'zarafa' => array(
					'error' => array(
						'type' => ERROR_GENERAL,
						'info' => array(
							'file' => $exception->getFileLine(),
							'display_message' => $exception->getDisplayMessage(),
							'original_message' => $exception->getMessage()
						)
					)
				)
			);
		} else {
			$return = array(
				'success' => false,
				'zarafa' => array(
					'error' => array(
						'type' => ERROR_GENERAL,
						'info' => array(
							'display_message' => _('Operation failed'),
							'original_message' => $exception->getMessage()
						)
					)
				)
			);
		}
		echo JSON::Encode($return);
	}
}

// create instance of class to download message as file
$messageInstance = new DownloadMessage();

try {
	// initialize variables
	$messageInstance->init($_GET);
	// download message as file
	$messageInstance->downloadMessageAsFile();
} catch (Exception $e) {
	$messageInstance->handleSaveMessageException($e);
}
?>