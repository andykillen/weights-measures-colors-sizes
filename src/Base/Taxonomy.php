<?php

namespace WMCS\Base;

use \WMCS\Walkers\EditScreenTaxonomy;
use \WMCS\Fields\TermMeta;
use \WP_Term;

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
    
    private $settings               = array ( 'name', 'singular', 'plural', 'fields',
                                              'columns', 'textdomain', 'hierarchical',
                                              'query_var', 'public', 'publicly_queryable',
                                              'show_ui', 'show_in_menu', 'show_in_nav_menus',
                                              'show_in_rest', 'show_tagcloud', 'used_by'
                                    );

    public function __construct( $settings = array() ) {
        
        /**
         * Loop the settings array if not empty.
         * 
         * Look for named keys and assign the new setting.
         *
         */ 
        if(!empty($settings)) {
            foreach ($this->settings as $param){
                if(isset($settings[$param])){
                    $this->$param = $settings[$param];
                }
            }
        }
        
        /**
         * 2nd chance to override the class variables, params or values.
         * Setup for hard coding in the sub class without having to remember how to
         * call the super class with parent::__constuct.
         */
        $this->adaptions();


        /**
         * load all possible actions for setting up a taxonomy
         */
        // register the taxonomy
        add_action( 'init', [ $this, 'register']);
        // add extra column content where there are new columns
        add_filter( 'manage_' . $this->name .'_custom_column',[ $this , 'extra_column_content' ],10,3);
        // Show extra columns in the CRUD listing
        add_filter( 'manage_edit-' . $this->name .'_columns', [ $this ,'extra_column_names'] );
        // Use a different walker than normal that overrides slightly to add more filters. For edit screens only.
        add_filter( 'wp_terms_checklist_args', [ $this ,'adapt_walker'], 10, 2 );
        // Add new form fields from the $fields array
        add_action( $this->name . '_edit_form_fields', [$this,'edit_field_setup'],10,2 );
        // Save the form fields from the $fields array
        add_action( 'edited_' . $this->name, [$this,'save_term_fields'],10);
        // Save the form fields from the $fields array
        add_action( 'saved_' . $this->name, [$this,'saved_hook'],10);

    }

    /**
     * Standard lables for a taxonomy
     * 
     * Allows for text translations by doing it this way.
     * 
     * TODO: check this really works for translations!
     * 
     * @return array 
     */
    public function labels() {
        $args = array(
            'name'                          => $this->singular, 
            'singular_name'                 => $this->singular,
            'search_items'                  => sprintf( __( 'Search %s', $this->textdomain ), $this->plural),
            'popular_items'                 => sprintf( __( 'Popular %s', $this->textdomain ), $this->plural),
            'all_items'                     => sprintf( __( 'All %s', $this->textdomain ), $this->plural),
            'edit_item'                     => sprintf( __('Edit %s', $this->textdomain ), $this->singular),
            'edit_item'                     => sprintf( __('Edit %s', $this->textdomain ), $this->singular),
            'update_item'                   => sprintf( __('Upadate %s', $this->textdomain ), $this->singular),
            'add_new_item'                  => sprintf( __('Add New %s', $this->textdomain ), $this->singular),
            'new_item_name'                 => sprintf( __('New %s Name', $this->textdomain ), $this->singular),
            'separate_items_with_commas'    => sprintf( __('Seperate %s with Commas', $this->textdomain ), $this->singular),
            'add_or_remove_items'           => sprintf( __('Add or Remove %s', $this->textdomain ), $this->singular),
            'choose_from_most_used'         => sprintf( __('Choose from Most Used %s', $this->textdomain ), $this->singular),
        );

        return apply_filters('wmcs_taxonom_' . $this->name .'_labels', $args);
    }
   
    /**
     * 
     */
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

    /**
     * Add content to the column if it exists
     * 
     * @param string $content
     * @param string $column_name
     * @param int $term_id
     * 
     * @return string $content
     */
    public function extra_columns_content( $content, $column_name, $term_id ) {
        
        // Check if there are any columns to add.
        // If there are, check if the wanted column name exists in the array.
        if( !empty($this->columns['add']) && 
            in_array( $column_name, array_keys( $this->columns['add']) ) 
            ) {
            $content = get_term_meta($term_id, $column_name, true );
        }
        
        return $content;
    }

    /**
     * Adapt the walker used by the Edit screen to be one with more
     * filters.
     * 
     * @param array $args
     * @param int $post_id
     * 
     * @return array $args 
     */
    public function adapt_walker($args, $post_id){
        if($args['taxonomy'] != $this->name) {
            return $args;
        }

        $args['walker'] = new EditScreenTaxonomy();
    
        return $args;
    }

    /**
     * Add a column to the $columns array
     * 
     * @param string $key, hyphenated lowercase
     * @param string $text, free format text
     */
    protected function add_column($key, $text) {
        $this->columns['add'][$key] = $text; 
    }

    /**
     * Add a column to the remove array so that it will be removed
     * from the CRUD listing
     * 
     * @param string $key
     */
    protected function remove_column($key) {
        $this->columns['remove'][] = $key;
    }

    protected function adaptions() {
        // do something in the sub class to adapt.
    }

    /**
     * Add fields to the Term edit screen
     * 
     * @param object $term, WP_Term object
     */
    public function edit_field_setup( WP_Term $term ) {

        if( empty($this->fields) ) return;
        $fields = new TermMeta();

        foreach( $this->fields as $field) {
            
            $meta = get_term_meta($term->term_id, $field['name'],true);
            
            $value = (isset($field['value'])) ? $field['value'] : '';
            
            $field['value'] = ($meta) ? $meta : $value;
            
            $fields->add_field( $field );
        }
    }

    /**
     * Save the fields from the Field array on save of the
     * taxonomy item
     * 
     * @param int $term_id 
     */
    public function save_term_fields( $term_id ) {
        if( empty($this->fields) ) return;

        $fields = new TermMeta();

        foreach( $this->fields as $field) {
           $fields->save_field( $term_id, $field['name'], $field['type'] );
        }
    }

    /**
     * 
     */
    public function saved_hook() {
        // do something on save.
    }

}
