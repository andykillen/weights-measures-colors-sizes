<?php

namespace WMCS\Conversions;

class Temperature {
    
    /**
     * Reply with Farenheit when given celcius, show marker option adds degrees F.
     * 
     * @param int $temp_in_celcius
     * @param bool $show_marker
     */
    public static function celcius_to_farenheit($temp_in_celcius, $show_marker = false) {
        $output = ($temp_in_celcius * 1.8) + 32;
        return $output . ($show_marker) ? '&deg;F' : '';
    }

    /**
     *  Reply with Celcius when given Farenheit, show marker option adds degrees C. 
     * 
     * @param int $temp_in_farenheit
     * @param bool $show_marker
     */
    public static function farenheit_to_celcius($temp_in_farenheit, $show_marker = false ) {
        $output = ($temp_in_farenheit - 32)  * 0.5556;
        return $output . ($show_marker) ? '&deg;C' : '';
    }
}