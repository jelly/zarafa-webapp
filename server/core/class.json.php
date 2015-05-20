<?php
	require_once("server/PEAR/JSON.php");
	require_once('server/exceptions/class.JSONException.php');

	/**
	 * A static JSON handling class that will fire JSONException when any error occurs in JSON parsing.
	 * this class is just created as a wrapper class for JSON methods so we can throw exception
	 * when something fails.
	 * We using a backward compatible method for JSON encoding/decoding if PHP matively supports JSON
	 * then we use default functions but if it doesn't support then we use Services_JSON library to handled
	 * JSON data. one drawback of this method is that we can't map json_last_error method to its
	 * counterpart in Serviced_JSON library as both method works differently. so when using Services_JSON
	 * library we have to assume an error occured when json_decode returns null.
	 * 
	 * @package core
	 */
	class JSON
	{
		/**
		 * Function will encode data into a JSON string.
		 * 
		 * @param {Object} $data data that should be encoded.
		 * @return {String} JSON encoded string.
		 */
		public static function Encode($data)
		{
			return json_encode($data);
		}

		/**
		 * Function will decode JSON string into objects.
		 * 
		 * @param {String} $jsonString JSON data that should be decoded.
		 * @param {Boolean} $toAssoc flag to indicate that associative arrays should be
		 * returned as objects or arrays, true means it will return associative array as arrays and
		 * false will return associative arrays as objects.
		 * @return {Object} decoded data.
		 */
		public static function Decode($jsonString, $toAssoc = false)
		{
			$data = json_decode($jsonString, $toAssoc);

			// if PHP > 5.3.0 then we can use default error checking mechanism
			if(function_exists("json_last_error")) {
				$errorString = '';
				switch(json_last_error())
				{
					case JSON_ERROR_DEPTH:
						$errorString = _("The maximum stack depth has been exceeded");
						break;
					case JSON_ERROR_CTRL_CHAR:
						$errorString = _("Control character error, possibly incorrectly encoded");
						break;
					case JSON_ERROR_STATE_MISMATCH:
						$errorString = _("Invalid or malformed JSON");
						break;
					case JSON_ERROR_SYNTAX:
						$errorString = _("Syntax error");
						break;
					/*case JSON_ERROR_UTF8:	// PHP > 5.3.3
						$errorString = _("Malformed UTF-8 characters, possibly incorrectly encoded");
						break;*/
				}

				if(!empty($errorString)) {
					throw new JSONException(sprintf(_("JSON Error: - %s") , $errorString), json_last_error(), null, _("Some problem encountered when encoding/decoding JSON data."));
				}
			} else if (is_null($data)) {
				/**
				 * json_decode can only return null when decoding null value or some error
				 * occured in decoding JSON data, so we can assume that we will not be decoding null and
				 * check for errors when decoding fails
				 */
				throw new JSONException(_("JSON Error: - Unknown Error"), 0, null, _("Some problem encountered when encoding/decoding JSON data."));
			}

			return $data;
		}
	}
?>
