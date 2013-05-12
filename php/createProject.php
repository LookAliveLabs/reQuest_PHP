<?php
	/*
        createProject - creates Client and Project folders, uploads video file if one is passed
                POST body: form data
    */
    $out = array();

    // (1) Check file size agains server limit
    // if($_SERVER[CONTENT_LENGTH] > ini_get('post_max_size')){
    //      $out['error'] = "File size too large. ".$_SERVER[CONTENT_LENGTH]." bytes exceeds the maximum size of ". ini_get('post_max_size');
    // }else{
            // (2) Create client and project folders
            $clientName = $_POST['clientName'];
            $projectName = $_POST['projectName'];
            $folder_path = '../Projects/'.$clientName.'/'.$projectName;

            if(is_dir($folder_path)){
                    // delete the directory and all contents
                    $files = glob($folder_path.'/*'); // get all file names
                    foreach($files as $file){ // iterate files
                      if(is_file($file)){
                        unlink($file); // delete file
                      }
                    }
                    rmdir($folder_path);
            }
            $oldmask = umask(0); // set umask to 0 temporarily, so that it does not mess with my permissions for the new dir
            mkdir($folder_path, 0777, true);
            umask($oldmask); // set umask back to what it was

            // (3) Upload file if there is a file posted
            if(!empty($_FILES['myFile']['name'])){
                    $out['file'] = true;
                    $newPath = '../Projects/'.$clientName.'/'.$projectName.'/video.'.$_POST['extFile'];
                    move_uploaded_file($_FILES['myFile']['tmp_name'], $newPath);
            }
            $out['path'] = $clientName.'/'.$projectName;
    // }

    echo json_encode($out);

?>


