<?php

#
# Script to make reading the State files a bit more convenient,
# invoke this script where the first argument is the state file
# to open.
#

$fp = fopen($argv[1], "a+");
fseek($fp, 0);

$contents = '';

while($data = fread($fp, 32768)) {
	        $contents .= $data;
}

$data = unserialize($contents);

print_r($data);

?>
