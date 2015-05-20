<?php
interface iFeatureQuota {
	public function getQuotaBytesUsed($dir);
	public function getQuotaBytesAvailable($dir);
}
?>