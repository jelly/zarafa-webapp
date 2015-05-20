<?php
	require_once("server/PEAR/XML/Unserializer.php");

	/**
	* XML Parser
	*
	* This class parses a XML string, which is received from the client. The XML is parsed
	* and the data is saved into an associative array. Strings are stored as utf-8 in the
	* data structure.
	*
	* We just use the PEAR XML::Unserializer class to do this
	* @package core
	*/
	
	class XMLParser
	{
		/**
		 * @var object this object is the PEAR unserializer		
		 */		
		var $unserializer;

		/**
		 * Constructor
		 * This intializes the Unserializer from PEAR with the correct options		 
		 */		 				
		function XMLParser($enum = false)
		{
			if(!$enum)
				$enum = array();
				
			$options = array (
				"parseAttributes" => TRUE,
				"attributesArray" => "attributes",
				// This option forces the values in this keys to be set in an array 
				"forceEnum" => $enum
			); 

			$this->unserializer = new XML_Unserializer($options);
		} 
		
		/**
		 * Parse the XML which is received from the client
		 * @param string $xml the XML string
		 * @return array The parsed XML string in an array		 		 
		 */		 		
		function getData($xml)
		{
			$xml = replaceControlCharactersInXML($xml);

			$result = $this->unserializer->unserialize($xml);
			if(PEAR::isError($result)) {
				return $result;
			}

			return $this->unserializer->getUnserializedData();
		}
	}
?>
