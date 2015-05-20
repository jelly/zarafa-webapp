<?php
header("Content-Type: text/javascript; charset=utf-8");

// compress output
ob_start("ob_gzhandler");
?>

/**
 * WebAppTimezones object
 *
 * Array containing descriptors for each available
 * timezone with their corresponding offset.
 */
WebappTimezones = [{
<?php
	// Request the complete list of timezone identifiers from PHP.
	$timezones = DateTimeZone::listIdentifiers();
	$last = $timezones[count($timezones) - 1];

	// Go over all identifiers and request the timezone offset.
	foreach ($timezones as $tz) {
		$timezone = new DateTimeZone($tz);
		// Take the first day of the year, which is never a DST switch
		$date = new DateTime('01-01-2000', $timezone);

		// If this date is summertime (for southern hemisphere),
		// then go to halfway the year, which is never a DST switch either.
		if ($date->format('I') == 1) {
			$date = new DateTime('01-07-2000', $timezone);
		}

		// Print the array item.
		print("\t" . 'name: \'' . $tz . '\',' . PHP_EOL .
		      "\t" . 'offset: \'GMT' . $date->format('P') . '\'' . PHP_EOL .
		      "\t" . 'timezone: \'' . $date->format('T') . '\'' . PHP_EOL);

		// Insert the array seperator only when this wasn't the
		// last item in the array.
		if ($tz != $last) {
			print('},{' . PHP_EOL);
		}
	}
?>
}];
