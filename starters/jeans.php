<?php

$jeans = []; 

foreach(range(24,44) as $width) {
    $upper_max = ($width < 28) ? 34 : 38;
    foreach(range(23,$upper_max) as $length) {
        $jeans[$width][] = $length;
    }
}

return $jeans;