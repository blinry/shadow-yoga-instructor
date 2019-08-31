<?php

header("Access-Control-Allow-Origin: *");

if($_POST["image"]) {
    $prefix = "data:image/png;base64,";
    $prefix_len = strlen($prefix);

    $image = $_POST["image"];

    if(substr($image, 0, $prefix_len) === $prefix) {
        $content = substr($image, $prefix_len);
        $data = base64_decode($content);
        $now = date("Ymd-H:i:s");
        $name = "gallery/".$now.".png";
        file_put_contents($name, $data);
    }
} else {
}

?>


