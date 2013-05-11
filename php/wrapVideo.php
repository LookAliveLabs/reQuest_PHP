<?php
/*
	wrapVideo - receives data object, writes it to file, Copies template index.html to a location ont the server
*/
	// $out = array();
	// $out['size'] = $_SERVER[CONTENT_LENGTH];
	// $out['limit'] = ini_get('post_max_size');
	// $out['memory'] = ini_get('memory_limit');


	$data = $_POST['myData'];
	$data = json_decode($data, true);
	// (1) save postData in json file
	$file_path = '../Projects/'.$data['dirName'].'/data.json';
	file_put_contents($file_path, json_encode($data));
	// (2) copy index template into dirName directory
	copy('../projectFiles/index.html', '../Projects/'.$data['dirName'].'/index.html');

	$out = array();
	$out['dirName'] = $data['dirName'];

	echo json_encode($out);

?>