<?php

namespace WMCS\Base;

abstract class Fields {

    protected $type = '';


    protected function add_nonce( $name ) {
        wp_nonce_field( $name, $name . '-nonce' );
    }

    protected function check_nonce( $name ) {
        if( ! isset( $_POST[ $name . '-nonce' ] ) ) return false;

        return wp_verify_nonce( $_POST[ $name . '-nonce' ], $name);
    }

    public function add_field( $field_info = array( ) ){
        switch($field_info['type']){
            case 'email':
                $this->email_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
            case 'url':
                $this->url_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
            case 'password':
                $this->password_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
            case 'tel':
                $this->tel_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
            case 'text':
                $this->text_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
            case 'textarea':
                $this->textarea_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
            case 'number':
                $this->number_field($field_info['value'], $field_info['name'], $field_info['title'] );
                break;
        }
    }

    public function save_field( $id, $name, $field_type ) {
        if( !function_exists("update_{$this->type}_meta") ) return false;

        if( ! $this->check_nonce( $name ) ) return false;

        switch ( $field_type ) {
            case 'textarea': 
                $data =  sanitize_textarea_field($_POST[ $name ]);             
                break;
            case 'password':
            case 'text':
                $data =  sanitize_text_field($_POST[ $name ]);
                break;            
            case 'email':
                $data = filter_input( INPUT_POST, $name, FILTER_SANITIZE_EMAIL ); 
                break;
            case 'tel':    
            case 'number':
                $data = filter_input( INPUT_POST, $name, FILTER_SANITIZE_NUMBER_INT );                
                break;
            case 'url':
                $data =  sanitize_url($_POST[ $name ]);
                break;
            default:
                $data =  sanitize_text_field($_POST[ $name ]);    
        }
        
        $get = "get_{$this->type}_meta";
        $add = "add_{$this->type}_meta";
        $update = "update_{$this->type}_meta";
        $delete = "delete_{$this->type}_meta";
        
        if ($get($id, $name) == '') {
            $add($id, $name, $data, true);
        }

        elseif ($data != $get($id, $name, true)){
            $update($id, $name, $data);
        }

        elseif ($data == '') {
            $delete($id, $name, $get($id, $name, true));
        }

    }

    
    protected function color_field($value, $name, $title = "Colour in hex") {
        ?><tr class="form-field  <?php echo $this->type ?>-group-wrap">
            <th scope="row"><label for="<?php echo $name ?>"><?php echo $title ?></label></th>
            <td>
                <input type='text' name="<?php echo $name ?>" id="<?php echo $name ?>" value="<?php 
                    echo ($value)?$value:"";
                ?>" />
                <?php $this->add_nonce($name);  ?>
            </td>
        </tr><?php
    }

    protected function input_field($value, $name, $title = '', $type = 'text') {
        ?><tr class="form-field  <?php echo $this->type ?>-group-wrap">
            <th scope="row"><label for="<?php echo $name ?>"><?php echo $title ?></label></th>
            <td>
                <input type='<?php echo $type ?>' name="<?php echo $name ?>" id="<?php echo $name ?>" value="<?php 
                    echo ($value)?$value:"";
                ?>" />
                <?php $this->add_nonce($name);  ?>
            </td>
        </tr><?php
    }

    protected function textarea_field($value, $name, $title = '') {
        ?><tr class="form-field  <?php echo $this->type ?>-group-wrap">
            <th scope="row"><label for="<?php echo $name ?>"><?php echo $title ?></label></th>
            <td>
                <textarea name="<?php echo $name ?>" id="<?php echo $name ?>" ><?php 
                     echo ($value)?$value:"";
                ?></textarea>
                <?php $this->add_nonce($name);  ?>
            </td>
        </tr><?php
    }

    protected function select_field($term_id, $code, $lang) {
        ?><tr class="form-field  <?php echo $this->type ?>-group-wrap">
            <th scope="row"><label for="feature-group">Question description in <?php echo $lang ?></label></th>
            <td>
                <textarea name="lang-question-<?php echo $code ?>"><?php 
                     echo ($value)?$value:"";
                ?></textarea>
                <?php $this->add_nonce($name);  ?>
            </td>
        </tr><?php
    }

    protected function text_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'text');
    }

    protected function email_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'email');
    }

    protected function number_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'number');
    }

    protected function colorpicker_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'color');
    }

    protected function password_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'password');
    }

    protected function phone_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'tel');
    }

    protected function url_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'url');
    }

}
