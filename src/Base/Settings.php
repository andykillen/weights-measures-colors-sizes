<?php

namespace WMCS\Base;

use WMCS\Settings\SanitizeFields;
use WMCS\Fields\Settings as SettingsFields;

abstract class Settings {

    protected $fields = array();
    protected $option_name = '';
    protected $option_group = 'wmcs_taxonomies';
    protected $option = array();



    public function __construct() {
        add_action('admin_init', array($this,'register_setting'),10 );
        add_action('admin_init', array($this,'show_fields'),10 );
    }

    public function register_setting() {
        $args = array(
            'type' => 'array', 
            'sanitize_callback' => 'sanitize_array',
            'default' => array(),
            );
        register_setting( $this->option_group, $this->option_name, $args ); 
    }

    public function sanitize_array($values) {
        if(empty($this->fields)) return false;

        $sanitize = new SanitizeFields();

        foreach($this->fields as $field) {
            $values[ $field['name'] ] = $sanitize->$field['type']($values[ $field['name'] ]);
        }

        return $values;
    }

    public function show_fields() {
        if(empty($this->fields)) return false;

        $settingsFields = new SettingsFields();

        foreach($this->fields as $field){
            $settingsFields->add_field( $field );   
        }
    }
}
