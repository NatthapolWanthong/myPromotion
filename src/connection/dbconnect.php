<?php
    $connection = mysqli_connect($hostname_connection, $username_connection, $password_connection, $database_connection) 
    or trigger_error(mysqli_error(),E_USER_ERROR); 
    mysqli_query($connection, "SET character_set_results=utf8");
    mysqli_query($connection, "SET character_set_client=utf8");
    mysqli_query($connection, "SET character_set_connection=utf8");
?>