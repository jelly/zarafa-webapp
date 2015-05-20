#!/usr/bin/php
<?php
/*
 * Script to concatenate JS/CSS files into a single file,
 * to reduce the number of files which must be loaded into
 * the browser, and to prepare it for compression.
 *
 * TODO: Better document this script...
 */
include('init.php');
include('client/loader.php');

$loader = new FileLoader();

// Argument 1 will be the folder which contains the
// files to concatenate. This will be searched recursively.
$folder = null;
if ($argc > 1) {
	$folder = $argv[1];
}

// Argument 2 will be the extension by which the files
// will be filtered. This must be either 'js' or 'css'
$ext = null;
if ($argc > 2) {
	$ext = $argv[2];
}

// Argument 3 and beyond will be the directories which
// will be given priority in ordering.
$core = Array();
if ($argc > 3) {
	for ($i = 3; $i < $argc; $i++) {
		if (is_dir($argv[$i])) {
			$core[] = $argv[$i];
		}
	}
}

// If the folder doesn't exist, bail out.
if (!is_dir($folder)) {
	echo('The folder \'' . $folder . '\' does\'t exist' . PHP_EOL);
	exit(1);
}

// Check if the Js or CSS files must be concatenated.
if ($ext === 'js') {
	$files = $loader->getJavascriptFiles($folder);
	$files = $loader->buildJSLoadingSequence($files, $core);
} else if ($ext === 'css') {
	$files = $loader->getCSSFiles($folder);
	$files = $loader->buildCSSLoadingSequence($files);
} else {
	echo('The exension \'' . $ext . '\' is unsupported' . PHP_EOL);
	exit(1);
}

// We have the list of files, start echo'ing each file so they can
// be saved into a single file.
foreach ($files as $file) {
	$data = $loader->getFileContents($file);
	echo $data . PHP_EOL;
}

exit(0);
?>
