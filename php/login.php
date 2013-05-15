<?php
/*
	LOGIN USER - check authentication, return login:true if OK, login:false if NOT
*/

	$lines = file('.passwd');
    $p = array();
    $out['login']=false;

    foreach ($lines as $line) {
            $pieces = explode(":", $line);
            $p[$pieces[0]] = trim($pieces[1]);
    }
    $user = $_POST['user'];
    $pass = $_POST['pass'];

    if(array_key_exists($user, $p)) {
            $pass = base64_encode($pass);
            if($pass == $p[$user]){
                    $out['login'] = true;
            }
    }


    echo json_encode($out);


?>