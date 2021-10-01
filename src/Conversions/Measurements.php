<?php

namespace WMCS\Conversions;

class Measurements {

    public static function cm_to_feet_and_inches($cm) {
        $inches = self::cm_to_inches($cm);
        // get feet.
        $feet = floor($inches/12);

        // find inches
        $inches = ($inches%12);

        return $feet ."\'".$inches."\""; 
    }

    public static function cm_to_inches($cm) {
        return round($cm / 2.54);
    }

    public static function inches_to_cm($inches) {
        return $inches * 2.54;
    }

    public static function feet_and_inches_to_cm($feet, $inches) {
        $totalInches = ($feet * 12) + $inches;
        return self::inches_to_cm($totalInches);
    }
    

    // TODO: check US/UK values;
    
    public static function lbs_to_kg($lbs){
        return $lbs / 0.45359237;
    }
    public static function kg_to_lbs($kg) {
        return $kg * 2.20462262185;
    }

    public static function kg_to_stones($cm) {
        return $kg * 0.1574730444;
    }

    public static function stones_to_kg($cm) {

    }

    public static function stones_to_lbs($cm) {

    }

}
    