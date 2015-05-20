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
 *
 * @author S.B. Kok
 * @version 1.0
 *
 * This class is used to store the file types for each
 * Spreed Conference that is being setup.
 *
 */
class SpreedFile
{
	private $filePath;
	private $typeIsPresentation;

	/**
	 * The constructor of the SpreedFile class.
	 * The type of the file (presentation or normal attachment)
	 * is determined on the fly.
	 * @param string $filePath The full file-path to the file that
	 * needs to be uploaded to the Spreed Server.
	 **/
	function __construct($filePath)
	{
		$this->filePath = $filePath;
		$this->typeIsPresentation = self::isPresentationFile($filePath);
	}

	/**
	 * The full file-path to the file that needs to be
	 * uploaded on the server where this code is running on.
	 * @return string The full path to the file.
	 **/
	public function getFilePath()
	{
		return $this->filePath;
	}

	/**
	 * Override the detection mechanism and set the file type to
	 * the type specified.
	 * @param boolean $typeIsPresentation True if this file is a presentation
	 * file, or false if it is an attachment to the conference call.
	 **/
	public function overrideFileType($typeIsPresentation){
		$this->typeIsPresentation = $typeIsPresentation;
	}

	/**
	 * The type of this file in the conference, is it a
	 * presentation file or an attachment to the conference
	 * call.
	 * @return boolean True If this is a presentation file, otherwise
	 * it is an attachment file.
	 **/
	public function isPresentation()
	{
		return $this->typeIsPresentation;
	}

	/**
	 * This function determines the file type of the specified
	 * file. The file type is determined based on the extension
	 * of the file. Supported list of extensions for presentations
	 * by spreed:
	 * ppt, pptx, odt,
	 * @param string $filePath The full file-path to the file that
	 * needs to be uploaded to the Spreed Server.
	 * @return boolean True if the file is a presentation file.
	 **/
	private static function isPresentationFile($filePath){
		$fileInfo = pathinfo($filePath);
		$presentationExts = array(
				'ppt',      // Microsoft Powerpoint
				'pptx',     // Microsoft Powerpoint XML
				'pps',      // Microsoft Powerpoint
				'doc',      // Microsoft Word
				'docx',     // Microsoft Word XML
				'xls',      // Microsoft Excel Spreadsheet
				'xlt',      // Microsoft Excel Spreadsheet
				'xlm',      // Microsoft Excel Spreadsheet
				'xld',      // Microsoft Excel Spreadsheet
				'xla',      // Microsoft Excel Spreadsheet
				'xlc',      // Microsoft Excel Spreadsheet
				'xlw',      // Microsoft Excel Spreadsheet
				'xll',      // Microsoft Excel Spreadsheet
				'odp',      // Open office presentation
				'odt',      // Open office document
				'ods',      // Open office spreadsheet
				'eps',      // Enhanced Postscript file
				'ps',       // Postscript file
				'pdf',      // Portable Document Format
				'rtf',      // General Rich Text Format
				//'txt',      // General Plain Text File
				'png',      // Image
				'jpe',      // Image
				'jpg',      // Image
				'jpeg',     // Image
				'gif',      // Image
				'bmp',      // Image
				'ico',      // Image
				'tiff',     // Image
				'tif',      // Image
				'svg',      // Image
				'svgz',     // Image
				'mpeg',     // Movie
				'mpg',      // Movie
				'mpe',      // Movie
				'avi',      // Movie
				'mov'       // Movie
			);
		return isset($fileInfo['extension']) && in_array(strtolower($fileInfo['extension']), $presentationExts);
	}
}

?>
