<?php

$api_key = '';
$symbol = $_REQUEST['symbol'];
$date = $_REQUEST['date'];
$contract_type = $_REQUEST['contractType'];
$date_params = null;

if ($date != null){
	$date_params = "&fromDate=$date&toDate=$date";
}

try {
	$data = file_get_contents("https://api.tdameritrade.com/v1/marketdata/chains?apikey=$api_key&symbol=$symbol&contractType=$contract_type&includeQuotes=TRUE$date_params");
} catch (Exception $e){
	exit("An unexpected error occured. ".$e);
}

exit($data);