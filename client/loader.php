<?php

/**
 * Manager for including JS and CSS files into the desired order.
 */
class FileLoader {

	/**
	 * Obtain the list of Extjs & UX files
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @return array The array of Javascript files
	 */
	public function getExtjsJavascriptFiles($load)
	{
		$jsLoadingSequence = array();

		if ($load == LOAD_RELEASE) {
			$jsLoadingSequence[] = "client/extjs/ext-base.js";
			$jsLoadingSequence[] = "client/extjs/ext-all.js";
			$jsLoadingSequence[] = "client/extjs/ux/ux-all.js";
			$jsLoadingSequence[] = "client/extjs-mod/extjs-mod.js";
			$jsLoadingSequence[] = "client/jquery/jquery-1.6.2.min.js";
			$jsLoadingSequence[] = "client/tinymce/tinymce.min.js";
			$jsLoadingSequence[] = "client/third-party/ux-thirdparty.js";
		} else if ($load == LOAD_DEBUG) {
			$jsLoadingSequence[] = "client/extjs/ext-base-debug.js";
			$jsLoadingSequence[] = "client/extjs/ext-all-debug.js";
			$jsLoadingSequence[] = "client/extjs/ux/ux-all-debug.js";
			$jsLoadingSequence[] = "client/extjs-mod/extjs-mod-debug.js";
			$jsLoadingSequence[] = "client/jquery/jquery-1.6.2.min.js";
			$jsLoadingSequence[] = "client/tinymce/tinymce.js";
			$jsLoadingSequence[] = "client/third-party/ux-thirdparty-debug.js";
		} else {
			$jsLoadingSequence[] = "client/extjs/ext-base-debug.js";
			$jsLoadingSequence[] = "client/extjs/ext-all-debug.js";
			$jsLoadingSequence[] = "client/extjs/ux/ux-all-debug.js";
			$jsLoadingSequence = array_merge(
				$jsLoadingSequence,
				$this->buildJSLoadingSequence(
					$this->getListOfFiles('js', 'client/extjs-mod')
				)
			);
			$jsLoadingSequence[] = "client/jquery/jquery-1.6.2.min.js";
			$jsLoadingSequence[] = "client/tinymce/tinymce.dev.js";
			$jsLoadingSequence = array_merge(
				$jsLoadingSequence,
				$this->buildJSLoadingSequence(
					$this->getListOfFiles('js', 'client/third-party')
				)
			);
		}

		return $jsLoadingSequence;
	}

	/**
	 * Obtain the list of Extjs & UX files
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @return array The array of CSS files
	 */
	public function getExtjsCSSFiles($load)
	{
		$cssLoadingSequence = array();

		if ($load == LOAD_RELEASE) {
			$cssLoadingSequence[] = "client/extjs/resources/css/ext-all.css";
			$cssLoadingSequence[] = "client/extjs/ux/css/ux-all.css";
			$cssLoadingSequence[] = "client/third-party/resources/css/ux-thirdparty.css";
		} else if ($load == LOAD_DEBUG) {
			$cssLoadingSequence[] = "client/extjs/resources/css/ext-all.css";
			$cssLoadingSequence[] = "client/extjs/ux/css/ux-all.css";
			$cssLoadingSequence[] = "client/third-party/resources/css/ux-thirdparty.css";
		} else {
			$cssLoadingSequence[] = "client/extjs/resources/css/ext-all.css";
			$cssLoadingSequence[] = "client/extjs/ux/css/ux-all.css";
			$cssLoadingSequence = array_merge(
				$cssLoadingSequence,
				$this->buildCSSLoadingSequence(
					$this->getListOfFiles('css', 'client/third-party')
				)
			);
		}

		return $cssLoadingSequence;
	}

	/**
	 * Obtain the list of Zarafa WebApp files
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @param array $libFiles (optional) libary files when $load = LOAD_SOURCE
	 * @return array The array of Javascript files
	 */
	public function getZarafaJavascriptFiles($load, $libFiles = Array())
	{
		$jsLoadingSequence = array();

		if ($load == LOAD_RELEASE) {
			$jsLoadingSequence[] = "client/zarafa.js";
		} else if ($load == LOAD_DEBUG) {
			$jsLoadingSequence[] = "client/zarafa-debug.js";
		} else {
			$jsLoadingSequence = array_merge(
				$jsLoadingSequence,
				$this->buildJSLoadingSequence(
					$this->getListOfFiles('js', 'client/zarafa'),
					Array('client/zarafa/core'),
					$libFiles
				)
			);
		}

		return $jsLoadingSequence;
	}

	/**
	 * Obtain the list of Zarafa WebApp files
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @return array The array of CSS files
	 */
	public function getZarafaCSSFiles($load)
	{
		$cssLoadingSequence = array();

		if ($load == LOAD_RELEASE) {
			$cssLoadingSequence[] = "client/resources/css/zarafa.css";
		} else if ($load == LOAD_DEBUG) {
			$cssLoadingSequence[] = "client/resources/css/zarafa.css";
		} else {
			$cssLoadingSequence = array_merge(
				$cssLoadingSequence,
				$this->buildCSSLoadingSequence(
					$this->getListOfFiles('css', 'client/resources/css')
				)
			);
		}

		return $cssLoadingSequence;
	}

	/**
	 * Obtain the list of all Javascript files as registered by the plugins.
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @param array $libFiles (optional) libary files when $load = LOAD_SOURCE
	 * @return array The array of Javascript files
	 */
	public function getPluginJavascriptFiles($load, $libFiles = Array())
	{
		if ($load === LOAD_SOURCE) {
			return $this->buildJSLoadingSequence(
				$GLOBALS['PluginManager']->getClientFiles($load),
				Array(),
				$libFiles
			);
		} else {
			return $GLOBALS['PluginManager']->getClientFiles($load);
		}
	}

	/**
	 * Obtain the list of all CSS files as registered by the plugins.
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @return array The array of CSS files
	 */
	public function getPluginCSSFiles($load)
	{
		if ($load === LOAD_SOURCE) {
			return $this->buildCSSLoadingSequence($GLOBALS['PluginManager']->getResourceFiles($load));
		} else {
			return $GLOBALS['PluginManager']->getResourceFiles($load);
		}
	}

	/**
	 * Obtain the list of all Javascript files as provided by plugins using PluginManager#triggerHook
	 * for the hook 'server.main.include.jsfiles'.
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @return array The array of Javascript files
	 */
	public function getRemoteJavascriptFiles($load)
	{
		$files = Array();
		$GLOBALS['PluginManager']->triggerHook('server.main.include.jsfiles', Array('load' => $load, 'files'=> & $files));
		return $files;
	}

	/**
	 * Obtain the list of all CSS files as provided by plugins using PluginManager#triggerHook
	 * for the hook 'server.main.include.cssfiles'.
	 *
	 * @param number $load The LOAD_RELEASE | LOAD_DEBUG | LOAD_SOURCE flag
	 * to indicate which files should be loaded.
	 * @return array The array of CSS files
	 */
	public function getRemoteCSSFiles($load)
	{
		$files = Array();
		$GLOBALS['PluginManager']->triggerHook('server.main.include.cssfiles', Array('load' => $load, 'files'=> & $files));
		return $files;
	}

	/**
	 * Print each file on a new line using the given $template
	 * @param Array $files The files to print
	 * @param String $template The template used to print each file, the string {file} will
	 * be replaced with the filename
	 * @param Boolean $base True if only the basename of the file must be printed
	 */
	public function printFiles($files, $template = '{file}', $base = false)
	{
		foreach($files as $file) {
			echo str_replace('{file}', $base === true ? basename($file) : $file, $template) . PHP_EOL;
		}
	}

	/**
	 * getJavascriptFiles
	 *
	 * Scanning files and subdirectories that can be found withing the supplied
	 * path and add all located Javascript files to a list.
	 * @param $path String Path of the directory to scan
	 * @param $recursive Boolean If set to true scans subdirectories as well
	 * @param $excludeFiles Array Optional Paths of files or directories that
	 *                                     are excluded from the search.
	 * @return Array List of arrays containing the paths to files that have to be included.
	 */
	public function getJavascriptFiles($path, $recursive = true, $excludeFiles = Array()) {
		return $this->getListOfFiles('js', $path, $recursive, $excludeFiles);
	}

	/**
	 * getCSSFiles
	 *
	 * Scanning files and subdirectories that can be found withing the supplied
	 * path and add all located CSS files to a list.
	 * @param $path String Path of the directory to scan
	 * @param $recursive Boolean If set to true scans subdirectories as well
	 * @param $excludeFiles Array Optional Paths of files or directories that
	 *                                     are excluded from the search.
	 * @return Array List of arrays containing the paths to files that have to be included.
	 */
	public function getCSSFiles($path, $recursive = true, $excludeFiles = Array()) {
		return $this->getListOfFiles('css', $path, $recursive, $excludeFiles);
	}

	/**
	 * getListOfFiles
	 *
	 * Scanning files and subdirectories that can be found withing the supplied
	 * path and add the files to a list.
	 * @param $ext The extension of files that are included ("js" or "css")
	 * @param $path String Path of the directory to scan
	 * @param $recursive Boolean If set to true scans subdirectories as well
	 * @param $excludeFiles Array Optional Paths of files or directories that
	 *                                     are excluded from the search.
	 * @return Array List of arrays containing the paths to files that have to be included.
	 */
	private function getListOfFiles($ext, $path, $recursive = true, $excludeFiles = Array()) {
		/*
		 * We are using two lists of files to make sure the files from the
		 * subdirectories are added after the current directory files.
		 */
		$files = Array();
		$subDirFiles = Array();

		$dir = opendir($path);
		if (!is_resource($dir)) {
			return $files;
		}

		$typeExt = '.' . $ext;
		$typeSize = strlen($typeExt);

		while(($file = readdir($dir)) !== false)
		{
			$filepath = $path.'/'.$file;
			// Skip entries like ".", ".." and ".svn"
			if (substr($file,0,1)!="." && !in_array($filepath, $excludeFiles)){
				// Make sure we have files to include
				$info = pathinfo($filepath, PATHINFO_EXTENSION);

				if(is_file($filepath) && $info == $ext){
					$files[] = $filepath;
				// Subdirectories will be scanned as well
				}elseif($recursive && is_dir($filepath)){
					$subDirFiles = array_merge($subDirFiles, $this->getListOfFiles($ext, $filepath, $recursive, $excludeFiles));
				}
			}
		}

		/*
		 * Make the lists alphabetically sorted, doing this separate makes sure
		 * the subdirectories are added after the files in the directory above.
		 */
		sort($files);
		sort($subDirFiles);
		$files = array_merge($files, $subDirFiles);

		return $files;
	}

	/**
	 * buildCSSLoadingSequence
	 *
	 * Will built the correct loading sequence for the CSS files in application based on the depends
	 * statements in the files itself. It will first extract the depends statements.
	 * It will put that information in a list that holds the dependencies for each file.
	 * With that list the proper sequence of loading can be constructed.
	 * @param $files Array List of files that have to be included.
	 * @return Array List of files that are sorted in the correct sequence
	 */
	public function buildCSSLoadingSequence($files)
	{
		// Create a lookup table to easily get the name of the file the class is defined in
		$fileDataLookup = Array();
		$fileDependencies = Array();

		for ($i = 0, $len = count($files); $i < $len; $i++){
			$filename = $files[$i];
			$content = $this->getFileContents($filename);

			$dependsFile = Array();

			preg_match_all('(#dependsFile\W([^\n\r\*]+))', $content, $dependsFile);

			$fileDataLookup[ $filename ] = Array(
				'dependsFile' => $dependsFile[1]
			);
			$fileDependencies[ $filename ] = Array(
				'depends' => Array(),
				'core' => false
			);
		}

		// Convert dependencies found by searching for @extends to a filename.
		foreach($fileDataLookup as $filename => &$fileData){
			// Add the file dependencies that have beed added by using #dependsFile in the file.
			for ($i = 0, $len = count($fileData['dependsFile']); $i < $len; $i++){
				$dependencyFilename = $fileData['dependsFile'][$i];
				// Check if the file exists to prevent non-existant dependencies
				if(isset($fileDataLookup[ $dependencyFilename ])){
					// Make sure the file does not depend on itself
					if($dependencyFilename != $filename){
						$fileDependencies[ $filename ]['depends'][] = $dependencyFilename;
					}
				}else{
					trigger_error('Unable to find file #dependsFile dependency "'.$fileData['dependsFile'][$i].'" for file "'.$filename.'"');
				}
			}
		}
		unset($fileData);

		$fileSequence = $this->generateDependencyBasedFileSeq($fileDependencies);

		return $fileSequence;
	}

	/**
	 * buildJSLoadingSequence
	 *
	 * Will build the correct loading sequence for the JS files in application based on the class,
	 * extends and depends statements in the files itself. It will first extract the class
	 * definitions and dependencies. It will put that information in a list that holds the
	 * dependencies for each file. With that list the proper sequence of loading can be constructed.
	 * Files that originate from any of the specified coreFiles folders will be marked as core files.
	 * @param $files Array List of files that have to be included.
	 * @param $coreFiles Array (Optional) List of folders that contain core files.
	 * @param $libFiles Array (Optional) List of files that is used as library (and can contain
	 * classed which are depended upon by the given files).
	 * @return Array List of files that are sorted in the correct sequence
	 */
	public function buildJSLoadingSequence($files, $coreFiles = Array(), $libFiles = Array()){
		// Create a lookup table to easily get the classes which are defined in the library files
		$libFileLookup = Array();
		// Create a lookup table to easily get the name of the file the class is defined in
		$classFileLookup = Array();

		$fileDataLookup = Array();
		$fileDependencies = Array();

		// Read all library files to determine the classes which are defined
		for ($i = 0, $len = count($libFiles); $i < $len; $i++) {
			$filename = $libFiles[$i];
			$content = $this->getFileContents($filename);

			$class = Array();
			preg_match_all('(@class\W([^\n\r]*))', $content, $class);

			$libFileLookup[ $filename ] = Array(
				'class' => $class[1]
			);

			for ($j = 0, $lenJ = count($class[1]); $j < $lenJ; $j++){
				$libFileLookup[ $class[1][$j] ] = true;
			}
		}

		for ($i = 0, $len = count($files); $i < $len; $i++) {
			$content = $this->getFileContents($files[$i]);
			$filename = $files[$i];

			$extends = Array();
			$depends = Array();
			$dependsFile = Array();
			$class = Array();

			preg_match_all('(@extends\W([^\n\r]*))', $content, $extends);
			preg_match_all('(@class\W([^\n\r]*))', $content, $class);
			preg_match_all('(#depends\W([^\n\r\*]+))', $content, $depends);
			preg_match_all('(#dependsFile\W([^\n\r\*]+))', $content, $dependsFile);
			$core = (strpos($content, '#core') !== false)? true : false;

			for ($j = 0, $lenJ = count($coreFiles); $j < $lenJ; $j++){
				if(strpos($filename, $coreFiles[$j]) === 0){
					$core = true;
					break;
				}
			}

			$fileDataLookup[ $filename ] = Array(
				'class' => $class[1],
				'extends' => $extends[1],
				'depends' => $depends[1],	//TODO: implement
				'dependsFile' => $dependsFile[1]
			);
			$fileDependencies[ $filename ] = Array(
				'depends' => Array(),
				'core' => $core		// Based on tag or on class or on file path?
			);

			for ($j = 0, $lenJ = count($class[1]); $j < $lenJ; $j++){
				$classFileLookup[ $class[1][$j] ] = $filename;
			}
		}

		// Convert dependencies found by searching for @extends to a filename.
		foreach ($fileDataLookup as $filename => &$fileData) {

			// First get the extended class dependencies. We also have to convert them into files names using the $classFileLookup.
			for ($i = 0, $len = count($fileData['extends']); $i < $len; $i++) {
				// The check if it extends the Zarafa namespace is needed because we do not index other namespaces.
				if(substr($fileData['extends'][$i], 0, strlen('Zarafa')) == 'Zarafa'){
					if (isset($libFileLookup[ $fileData['extends'][$i] ])) {
						// The @extends is found in the library file.
						// No need to update the depdencies
					} else if(isset($classFileLookup[ $fileData['extends'][$i] ])){
						// The @extends is found as @class in another file
						// Convert the class dependency into a filename
						$dependencyFilename = $classFileLookup[ $fileData['extends'][$i] ];
						// Make sure the file does not depend on itself
						if($dependencyFilename != $filename){
							$fileDependencies[ $filename ]['depends'][] = $dependencyFilename;
						}
					}else{
						trigger_error('Unable to find @extends dependency "'.$fileData['extends'][$i].'" for file "'.$filename.'"');
					}
				}
			}
			// Next use the #depends class dependencies. We also have to convert them into files names using the $classFileLookup.
			for ($i = 0, $len = count($fileData['depends']); $i < $len; $i++){
				// The check if it extends the Zarafa namespace is needed because we do not index other namespaces.
				if(substr($fileData['depends'][$i], 0, strlen('Zarafa')) == 'Zarafa'){
					if (isset($libFileLookup[ $fileData['extends'][$i] ])) {
						// The #depends is found in the library file.
						// No need to update the depdencies
					} else if(isset($classFileLookup[ $fileData['depends'][$i] ])){
						// The #depends is found as @class in another file
						// Convert the class dependency into a filename
						$dependencyFilename = $classFileLookup[ $fileData['depends'][$i] ];
						// Make sure the file does not depend on itself
						if($dependencyFilename != $filename){
							$fileDependencies[ $filename ]['depends'][] = $dependencyFilename;
						}
					}else{
						trigger_error('Unable to find #depends dependency "'.$fileData['depends'][$i].'" for file "'.$filename.'"');
					}
				}
			}

			// Add the file dependencies that have beed added by using #dependsFile in the file.
			for ($i = 0, $len = count($fileData['dependsFile']); $i < $len; $i++){
				$dependencyFilename = $fileData['dependsFile'][$i];
				// Check if the file exists to prevent non-existant dependencies
				if(isset($fileDataLookup[ $dependencyFilename ])){
					// Make sure the file does not depend on itself
					if($dependencyFilename != $filename){
						$fileDependencies[ $filename ]['depends'][] = $dependencyFilename;
					}
				}else{
					trigger_error('Unable to find file #dependsFile dependency "'.$fileData['dependsFile'][$i].'" for file "'.$filename.'"');
				}
			}
		}
		unset($fileData);

		$fileSequence = $this->generateDependencyBasedFileSeq($fileDependencies);

		return $fileSequence;
	}

	/**
	 * generateDependencyBasedFileSeq
	 *
	 * This function will generate a loading sequence for the supplied list of files and their
	 * dependencies. This function calculates the depth of each file in the dependencytree. Based on
	 * that depth it calculates a weight for each file and that will determine the order in which
	 * the files will be included.
	 * The weight consists of two times the depth of the node and a penalty for files that have not
	 * been marked as a core file. This way core files get included prior to other files at the same
	 * depth. Files with the same weight are added in the order they are in the list and that should
	 * be alphabetically.
	 *
	 * @param $fileData Array List of files with dependency data in the format of
	 *                        $fileData[ FILENAME ] = Array(
	 *                          'depends' => Array(FILENAME1, FILENAME2),
	 *                          'core' => true|false
	 *                        );
	 * @return Array List of filenames in the calculated loading sequence
	 */
	private function generateDependencyBasedFileSeq($fileData){
		$fileDepths = Array();

		$changed = true;
		while($changed && (count($fileDepths) < count($fileData)) ){
			$changed = false;

			// Loop through all the files and see if for each file we can get a depth assigned based on their parents depth.
			foreach($fileData as $file => $dependencyData){
				$dependencies = $dependencyData['depends'];

				if(!isset($fileDepths[ $file ])){
					if(count($dependencies) > 0){
						$parentsDepthAssigned = true;
						$highestParentDepth = 0;
						// See if all the parents already have a depth assigned and if so take the highest one.
						for($i=0;$i<count($dependencies);$i++){
							// Not all parents depths have been assigned yet, wait another turn
							if(!isset($fileDepths[ $dependencies[$i] ])){
								$parentsDepthAssigned = false;
								break;
							}else{
								// We should only take the highest depth
								$highestParentDepth = max($highestParentDepth, $fileDepths[ $dependencies[$i] ]);
							}
						}
						// All parents have a depth assigned, we can calculate the one for this node.
						if($parentsDepthAssigned){
							$fileDepths[ $file ] = $highestParentDepth + 1;
							$changed = true;
						}
					// The node does not have any dependecies so its a root node.
					}else{
						$fileDepths[ $file ] = 0;
						$changed = true;
					}
				}
			}
		}

		// If not all the files have been assigned a depth, but nothing changed the last round there
		// must be something wrong with the dependencies of the skipped files. So lets tell someone.
		if(count($fileDepths) < count($fileData)){
			$errorMsg = '[LOADER] Could not compute all dependecies. The following files cannot be resolved properly: ';
			$errorMsg .= implode(', ', array_diff(array_keys($fileData), array_keys($fileDepths)));
			trigger_error($trigger_error);
		}

		$fileWeights = Array();
		// Now lets determine each file's weight
		foreach($fileData as $file => $dependencyData){
			if($fileDepths[ $file ] !== null){
				$weight = $fileDepths[ $file ] * 2;
				// Add a penalty of 1 to non-core files to up the core-files in the sequence.
				if(!$dependencyData['core']){
					$weight++;
				}
			}else{
				// Make up a weight to put it at the end
				$weight = count($fileData);
			}
			if(!isset($fileWeights[ $weight]))
				$fileWeights[ $weight ] = Array();
			$fileWeights[ $weight ][] = $file;
		}

		// The weights have not been added in the correct order, so sort it first on the keys.
		ksort($fileWeights);

		// Now put it all in the correct order. Files with the same weight are added in the order
		// they are in the list. This order should still be alphabetically.
		$fileSequence = Array();
		foreach($fileWeights as $weight => $fileList){
			for($i=0;$i<count($fileList);$i++){
				$fileSequence[] = $fileList[$i];
			}
		}

		return $fileSequence;
	}

	/**
	 * getFileContents
	 *
	 * Returns the content of the supplied file name.
	 * @param $fn String File name
	 * @return String Content of the file
	 */
	private function getFileContents($fn){
		$fc="";
		$fh = fopen($fn, "r");
		if($fh) {
			while(!feof($fh)){
				$fc .= fgets($fh, 4096);
			}
		}
		fclose($fh);
		return $fc;
	}
}
?>
