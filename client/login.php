<?php
	$user = sanitizeGetValue('user', '', USERNAME_REGEX);

	$url = '?logon';
	foreach($_GET as $key => $value) {
		if(!empty($key) && !in_array($key, array('logon', 'load'))){
			$url.= '&' . $key;
			if(!empty($value)) {
				$url.= '=' . urlencode($value);
			}
		}
	}

	$version = trim(file_get_contents('version'));
	$longversion = '';
	$server = DEBUG_SHOW_SERVER ? DEBUG_SERVER_ADDRESS : '';
	if (!empty($server)) {
		$longversion .= _('Server') . ': ' . $server . ' - ';
	}
	$longversion .=  _('WebApp') . ' ' . $version;
	if (DEBUG_LOADER === LOAD_SOURCE) {
		$longversion .= '-' . svnversion();
	}
	$longversion .= ' - ' . _('ZCP') . ' ' . phpversion('mapi');

	header("Content-type: text/html; charset=utf-8");
?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
	<head>
		<meta name="Generator" content="Zarafa WebApp v<?=$version?>">
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Zarafa WebApp</title>
		<link rel="stylesheet" type="text/css" href="client/resources/css-extern/login.css">
		<link rel="icon" href="client/resources/images/favicon.ico" type="image/x-icon">
		<link rel="shortcut icon" href="client/resources/images/favicon.ico" type="image/x-icon">
		<script type="text/javascript">
			window.onload = function(){
				if (document.getElementById("username").value == ""){
					document.getElementById("username").focus();
				}else if (document.getElementById("password").value == ""){
					document.getElementById("password").focus();
				} else {
					document.getElementById("submitbutton").focus();
				}
			}
		</script>
	</head>
	<body class="login">
		<table id="layout">
			<tr><td>
				<div id="login_main">
					<form action="index.php<?= $url ?>" method="post">
						<div id="login_data">
							<p><?=!(isset($GLOBALS["hresult"]))?_("Please logon"):"&nbsp;"?></p>
							<p class="error"><?php

	if (isset($GLOBALS["hresult"])) {
		switch($GLOBALS["hresult"]){
			case MAPI_E_LOGON_FAILED:
			case MAPI_E_UNCONFIGURED:
				echo _("Logon failed, please check your name/password.");
				break;
			case MAPI_E_NETWORK_ERROR:
				echo _("Cannot connect to the zarafa server.");
				break;
			case MAPI_E_INVALID_WORKSTATION_ACCOUNT:
				echo _("Logon failed, another session already exists.");
				break;
			default:
				echo "Unknown MAPI Error: ".get_mapi_error_name($GLOBALS["hresult"]);
		}
		unset($GLOBALS["hresult"]);
	}else if (isset($_GET["logout"]) && $_GET["logout"]=="auto"){
		echo _("You have been automatically logged out");
	}else{
		echo "&nbsp;";
	}
							?></p>
							<table id="form_fields">
								<tr>
									<td><input type="text" name="username" id="username" placeholder="Username" class="inputelement" value=<?= $user ?>></td>
								</tr>
								<tr>
									<td><input type="password" name="password" id="password" placeholder="Password" class="inputelement"></td>
								</tr>
								<tr>
									<td class="button-row"><input id="submitbutton" class="button" type="submit" value=<?=_("Logon")?>></td>
								</tr>
							</table>
						</div>
					</form>
					<span id="version"><?= $longversion ?></span>
				</div>
			</td></tr>
		</table>
	</body>
</html>
