<?php

require('Httpful/Bootstrap.php');

use \Httpful\Request;
use \Httpful\Mime;

class SalesForceAPI
{

    private static $CLIENT_ID = PLUGIN_SALESFORCE_USER_CLIENT_ID;
    private static $CLIENT_SECRET = PLUGIN_SALESFORCE_USER_CLIENT_SECRET;
    private static $BASE_URL = PLUGIN_SALESFORCE_USER_API_BASE_URI;
    private static $API_VERSION = 'v24.0';
    private static $REDIRECT_URI = PLUGIN_SALESFORCE_USER_REDIRECT_URI;

    public function __construct() {
		\Httpful\Bootstrap::init();

        if(!$this->isAuthorized()) {
            if(!isset($_GET['code'])) {
                $this->getAuthorizationCode();
            } else {
                $this->getAccessToken();
            }
        }
    }

    public function isAuthorized() {
        return isset($_SESSION['salesforce']['access_token']);
    }

    public function getAuthorizationCode() {
        $params = array(
            'response_type' => 'code',
            'client_id'     => self::$CLIENT_ID,
            'redirect_uri'  => self::$REDIRECT_URI
        );
        $query_string = http_build_query($params);
        $uri = 'https://login.salesforce.com/services/oauth2/authorize?' . $query_string;
        header('Location: ' . $uri);
        exit();
    }

    public function getAccessToken() {

        $params = array(
            'client_id'     => self::$CLIENT_ID,
            'client_secret' => self::$CLIENT_SECRET,
            'redirect_uri'  => self::$REDIRECT_URI,
            'code'          => $_GET['code'],
            'grant_type'    => 'authorization_code'
        );
        $response = Request::post(self::$BASE_URL . '/services/oauth2/token')
                            ->mime(Mime::FORM)
                            ->body($params)
                            ->send();

        self::$BASE_URL = $response->body['instance_url'];

        $_SESSION['salesforce']['access_token'] = $response->body['access_token'];
        $_SESSION['salesforce']['instance_url'] = $response->body['instance_url'];

    }

    public function findContactsByEmail($email) {
        $query = urlencode("SELECT Id FROM Contact WHERE email = '" . $email . "'");
        $response = Request::get(self::$BASE_URL . '/services/data/' . self::$API_VERSION . '/query/?q=' . $query)
                        ->addHeader('Authorization', 'Bearer ' . $_SESSION['salesforce']['access_token'])
                        ->send();
        return $response->body->records;
    }

    public function createCase($data) {
        $response = Request::post(self::$BASE_URL . '/services/data/' . self::$API_VERSION . '/sobjects/Case')
            ->body($data)
            ->addHeader('Authorization', 'Bearer ' . $_SESSION['salesforce']['access_token'])
            ->mime(Mime::JSON)
            ->send();
        return self::$BASE_URL . '/' . $response->body->id;
    }

}
?>
