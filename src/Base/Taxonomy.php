<?php

namespace WMCS\Base;

use \WMCS\Walkers\EditScreenTaxonomy;
use \WMCS\Fields\TermMeta;

abstract class Taxonomy {
    protected $name                 = '';
    protected $singular             = '';
    protected $plural               = '';
    protected $fields               = array( );
    protected $columns              = array(
                                        'remove' =>  array(), 
                                        'add'=> array()
                                       );
    protected $textdomain           = WOO_WMCS_TEXTDOMAIN;
    protected $hierarchical         = true;
    protected $query_var            = false;
    protected $public               = false;
    protected $publicly_queryable   = false;
    protected $show_ui              = true;
    protected $show_in_menu         = true;
    protected $show_in_nav_menus    = true;
    protected $show_in_rest         = true;
    protected $show_tagcloud        = false;
    protected $used_by              = array( 'product' );
    
    

    public function __construct() { 
        
        $this->adaptions();


        add_action( 'init', [ $this, 'register']);
        add_filter( 'manage_' . $this->name .'_custom_column',[ $this , 'extra_column_content' ],10,3);
        add_filter( 'manage_edit-' . $this->name .'_columns', [ $this ,'extra_column_names'] );
        add_filter( 'wp_terms_checklist_args', [ $this ,'adapt_walker'], 10, 2 );
        add_action( $this->name . '_edit_form_fields', [$this,'edit_field_set'],10,2 );
        add_action( 'edited_' . $this->name, [$this,'save_term_fields'],10);

    }

    public function labels() {
        return array(
            'name'                          => __($this->singular, $this->textdomain ),
            'singular_name'                 => __($this->singular, $this->textdomain),
            'search_items'                  => __('Search '. $this->plural, $this->textdomain),
            'popular_items'                 => __('Popular '. $this->plural, $this->textdomain),
            'all_items'                     => __('All '. $this->plural, $this->textdomain),
            'edit_item'                     => __('Edit '. $this->singular, $this->textdomain),
            'edit_item'                     => __('Edit '. $this->singular, $this->textdomain),
            'update_item'                   => __('Update '. $this->singular, $this->textdomain),
            'add_new_item'                  => __('Add New '. $this->singular, $this->textdomain),
            'new_item_name'                 => __('New '.$this->singular.' Name', $this->textdomain),
            'separate_items_with_commas'    => __('Seperate '.$this->singular.' with Commas', $this->textdomain),
            'add_or_remove_items'           => __('Add or Remove '. $this->singular, $this->textdomain),
            'choose_from_most_used'         => __('Choose from Most Used '. $this->singular, $this->textdomain)
        );

    }
   
    public function options() {
        $args = array(
            'labels'                => $this->labels(),
            'hierarchical'          => $this->hierarchical,
            'query_var'             => $this->query_var,
            'public'                => $this->public,
            'publicly_queryable'    => $this->publicly_queryable,
            'show_ui'               => $this->show_ui,
            'show_in_menu'          => $this->show_in_menu,
            'show_in_nav_menus'     => $this->show_in_nav_menus,
            'show_in_rest'          => $this->show_in_rest,
            'show_tagcloud'         => $this->show_tagcloud

        );

        return apply_filters('wmcs_taxonom_' . $this->name .'_options', $args);
    }

    public function register() {
        register_taxonomy( $this->name, $this->post_types(), $this->options() );
    }

    public function post_types() {
        return apply_filters('wmcs_taxonom_' . $this->name .'_post_types', $this->used_by);
    }

    public function add_meta_fields() {

    }

    public function save_meta_fields() {
        
    }

    public function extra_column_names( $columns ) {
        error_log(print_r($this->columns['add'], true));
        if(!empty($this->columns['add'])){
            foreach($this->columns['add'] as $key => $text ){
                $columns[$key] = $text;    
            }
        }

        if(!empty($this->columns['remove'])){
            foreach($this->columns['remove'] as $key ){
                unset($columns[$key]);
            }
        }
        
        return $columns;
    }

    public function extra_columns_content( $content, $column_name, $term_id ) {
        
        if(!empty($this->columns['add']) && in_array( $column_name, array_keys( $this->columns['add']) ) ){
            $content = get_term_meta($term_id, $column_name, true );
        }
        
        return $content;
    }

    public function adapt_walker($args, $post_id){
        if($args['taxonomy'] != $this->name) {
            return $args;
        }

        $args['walker'] = new EditScreenTaxonomy();
    
        return $args;
    }

    protected function add_column($key, $text) {
        $this->columns['add'][$key] = $text; 
    }

    protected function remove_column($key) {
        $this->columns['remove'][] = $key;
    }

    protected function adaptions() {
        // do something
    }

    public function edit_field_set( $term ) {

        if( empty($this->fields) ) return;
        $fields = new TermMeta();

        foreach( $this->fields as $field) {
            
            $meta = get_term_meta($term->term_id, $field['name'],true);
            
            $value = (isset($field['value'])) ? $field['value'] : '';
            
            $field['value'] = ($meta) ? $meta : $value;
            
            $fields->add_field( $field );
        }
    }

    public function save_term_fields( $term_id ) {
        if( empty($this->fields) ) return;

        $fields = new TermMeta();

        foreach( $this->fields as $field) {
           $fields->save_field( $term_id, $field['name'], $field['type'] );
        }

    }

}
