<?php
	// checkExistence - checks if project with this name already exists
	// 	POST body: clientName, projectName
	// 	Return: project data (json) if exists
	// 			{exists:false} if doesn't exist

	$clientName = $_POST['clientName'];
	$projectName = $_POST['projectName'];

	$out = array();

	// (1) Check if project folder exists
	$file_path = '../Projects/'.$clientName.'/'.$projectName.'/data.json';
	if(file_exists($file_path)){
		// (2) If exists - read data file and return data
		$data = file_get_contents($file_path);
		$out = json_decode($data, true);
		$out['exists'] = true;
	}else{
		$out['exists'] = false;
	}
	// 
	echo json_encode($out);
	
?>