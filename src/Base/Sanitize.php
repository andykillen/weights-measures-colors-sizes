<?php

namespace WMCS\Base;

abstract class Sanitize {

    /**
     * Filter string for valid string characters
     * 
     * @param string $value
     * @param string $regex
     * @param bool $filter
     * 
     * @return string
     */
    public function text($value, $regex = '', $filter = false) {
        // standard WordPress sanitize
        $value = sanitize_text_field($value);

        // optional filter using standard string filter
        if($filter) {
            $value = filter_var($value, FILTER_SANITIZE_STRING);
        }
        
        // optional additional regex filter
        if($regex != ''){
            $value = preg_filter($regex, '', $value);
        }

        return $value;
    }

    public function email($value) {
        return filter_var($value, FILTER_SANITIZE_EMAIL);
    }

    public function password($value, $min_length = 8) {
        if(strlen($value) <  $min_length) return '';
        
        return $value;
    }

    public function number($value , $min = false, $max = false) {
        if(!is_int($value)) return '';

        if($min && is_int($min) && $value < $min) return ''; 

        if($max && is_int($max) && $value > $max) return '';

        return $value;
    }

    public function textarea($value, $regex = '', $filter = false) {
        $value = sanitize_textarea_field($value);

         // optional filter using standard string filter
         if($filter) {
            $value = filter_var($value, FILTER_SANITIZE_STRING);
        }
        
        // optional additional regex filter
        if($regex != ''){
            $value = preg_filter($regex, '', $value);
        }

        return $value;
    }

    public function select($value, $valid_options = array() ) {
        if(in_array($value, $valid_options)){
            return $value;
        }
        return '';
    }


}