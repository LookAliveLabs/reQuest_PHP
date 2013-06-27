<?php
	include "signAmazon.php";
	include "config.php";


	$secret_key = "ufINXQ6umNZR1/e9+MycKBirSBquKi2j4N+Z8vNF";

	// $url = "http://webservices.amazon.com/onca/xml?CartId=175-5420853-9083562&HMAC=9GTLsvfEMzWf3%2BEjIyPr%2ByXnbPY%3D&Operation=CartAdd&Item.1.ASIN=B007TIE0GQ&Item.1.Quantity=1";
	$url = "http://webservices.amazon.com/onca/xml?";
	$params = array(
        'Service' => 'AWSECommerceService',
        'AWSAccessKeyId' => AWS_ACCESS_KEY_ID,
        'AssociateTag' => AWS_ASSOC_TAG);
        
    $data = $_REQUEST['params'];
    foreach(array_keys($data) as $key){
    	$params[$key] = $data[$key];
    }


	$signed_url = signAmazonUrl($url, $params, AWS_SECRET_ACCESS_KEY);

	$response = file_get_contents($signed_url);
    $xml = simplexml_load_string($response);

    if($data['Operation'] == 'ItemLookup'){
    	// echo json_encode($xml);
    	if(!count($xml->Items->Request->Errors)){
    		$result = array(
    			'ASIN'=> (string)$xml->Items->Item->ASIN,
    			'Title'=> (string)$xml->Items->Item->ItemAttributes->Title,
    			'Manufacturer'=> (string)$xml->Items->Item->ItemAttributes->Manufacturer
    			);
    		
    	}else{
    		$error = (string)$xml->Items->Request->Errors->Error->Message;

    		header('HTTP/1.1 400 Item not found');
        	header('Content-Type: application/json');
        	die($error);		
    		
    	}
  //   }else{
  //   	$result = array(
		// 	'CartId' => (string)$xml->Cart->CartId,
		// 	'HMAC' => (string)$xml->Cart->HMAC,
		// 	'Subtotal' => (string)$xml->Cart->SubTotal->FormattedPrice,
		// 	'Item' => array(
		// 		'quantity' => $params['Item.1.Quantity'],
		// 		'ASIN' => $params['Item.1.ASIN']
		// 		),
		// 	'PurchaseUrl' => (string)$xml->Cart->PurchaseURL
		// 	);
  //   	$lookup = array(
		// 			'Service' => 'AWSECommerceService',
		// 			'AWSAccessKeyId' => AWS_ACCESS_KEY_ID,
		// 			'AssociateTag' => AWS_ASSOC_TAG,
		// 			'Operation'=> 'ItemLookup',
		// 			'ItemId'=>$params['Item.1.ASIN'],
		// 			'IdType'=>'ASIN',
		// 			'Condition'=> 'All',
		// 			'ResponseGroup'=>'Images,ItemAttributes'
		// 	);
		// $signed_url = signAmazonUrl($url, $lookup, AWS_SECRET_ACCESS_KEY);
		// $res = file_get_contents($signed_url);
		// $item_xml = simplexml_load_string($res);
		// $out['img'] = (string)$item_xml->Items->Item->MediumImage->URL;
  //   }
    }else{
    	// echo 'no';
		$result = array(
			'CartId' => (string)$xml->Cart->CartId,
			'HMAC' => (string)$xml->Cart->HMAC,
			'Subtotal' => (string)$xml->Cart->SubTotal->FormattedPrice,
			'Item' =>array(),
			'Cart' => array(),
			'PurchaseUrl' => (string)$xml->Cart->PurchaseURL
			);

		foreach($xml->Cart->CartItems->CartItem as $item){
			$out = array(
					'ASIN'=> (string)$item->ASIN,
					'quantity'=> (string)$item->Quantity,
					'title'=> (string)$item->Title,
					'price'=> (string)$item->Price->FormattedPrice,
					'CartItemId'=> (string)$item->CartItemId
				);
			// if($data['Operation'] == 'CartGet'){
				// lookup images of each item
				$lookup = array(
						'Service' => 'AWSECommerceService',
       					'AWSAccessKeyId' => AWS_ACCESS_KEY_ID,
        				'AssociateTag' => AWS_ASSOC_TAG,
        				'Operation'=> 'ItemLookup',
        				'ItemId'=>(string)$item->ASIN,
        				'IdType'=>'ASIN',
        				'Condition'=> 'All',
        				'ResponseGroup'=>'Images'
					);
				$signed_url = signAmazonUrl($url, $lookup, AWS_SECRET_ACCESS_KEY);
				$res = file_get_contents($signed_url);
    			$item_xml = simplexml_load_string($res);
    			$out['img'] = (string)$item_xml->Items->Item->MediumImage->URL;

			// }
			$result['Cart'][] = $out;
			if((string)$item->ASIN == $params['Item.1.ASIN']){
				$result['Item'] = $out;
			}
		}
	}

	echo json_encode($result);
	// echo $signed_url;
?>