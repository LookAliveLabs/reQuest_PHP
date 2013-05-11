<?php
	/*
		createProject - creates Client and Project folders, uploads video file if one is passed
			POST body: form data
	*/
	$out = array();

	// (1) Check file size agains server limit
	// if($_SERVER[CONTENT_LENGTH] > ini_get('post_max_size')){
	// 	$out['error'] = "File size too large. ".$_SERVER[CONTENT_LENGTH]." bytes exceeds the maximum size of ". ini_get('post_max_size');
	// }else{
		// (2) Create client and project folders
		$clientName = $_POST['clientName'];
		$projectName = $_POST['projectName'];
		$folder_path = '../Projects/'.$clientName.'/'.$projectName;
		mkdir($folder_path, 0777, true);

		// (3) Upload file if there is a file posted
		if($_FILES['myFile']){
			$out['file'] = true;
			$newPath = '../Projects/'.$clientName.'/'.$projectName.'/video.'.$_POST['extFile'];
			move_uploaded_file($_FILES['myFile']['tmp_name'], $newPath);
		}
		$out['path'] = $clientName.'/'.$projectName;
	// }

	echo json_encode($out);

?>