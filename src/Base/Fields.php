<?php

namespace WMCS\Base;

abstract class Fields {

    protected $type = '';


    /**
     * Add a nonce to the form field, just after the actual
     * field in question, using the $name of the field.
     * 
     * @param string $name, form item name
     */
    protected function add_nonce( $name ) {
        wp_nonce_field( $name, $name . '-nonce' );
    }

    /**
     * check that the nonce field assiocated with the 
     * form field is good.
     * 
     * @param string $name, form item name
     * 
     * @return bool
     */
    protected function check_nonce( $name ) {
        if( ! isset( $_POST[ $name . '-nonce' ] ) ) return false;

        return wp_verify_nonce( $_POST[ $name . '-nonce' ], $name);
    }

    public function add_field( $field_info = array( ) ){
        if(empty($field_info)) return false;

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
            case 'number':
                $this->select_field($field_info['value'], $field_info['name'], $field_info['title'], $field_info['options'] );
                break;
        }
    }

    public function save_field( $id, $name, $field_type ) {
        // check we can later get/add/delete/update the type of meta.
        if( !function_exists("update_{$this->type}_meta") ) return false;

        // this checks for the nonce existance, and is correct
        if( ! $this->check_nonce( $name ) ) return false;
        // double check that the wanted value has been saved in the form.
        if( !isset( $_POST[ $name ] )) return false;

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
                // TODO: double check this is not depreciated.
                $data =  sanitize_url($_POST[ $name ]);
                break;
            default:
                $data =  sanitize_text_field($_POST[ $name ]);    
        }
        
        // setup the GET, ADD, UPDATE and DELETE functions for this meta type
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

    /**
     * Display a colour field.
     * 
     * @param mixed string/int $value
     * @param string $name
     * @param string $title
     * 
     */
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

    /**
     * Display a colour field.
     * 
     * @param mixed string/int $value
     * @param string $name
     * @param string $title
     * @param string $type [text, number, tel, url, password, email, color]
     * 
     */
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

    /**
     * Display a textarea field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
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

    /**
     * Display a select dropdown field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * @param array $options, key => text pair, where key is the saved value
     * 
     */
    protected function select_field($value, $name, $title = '', $options = []) {
        ?><tr class="form-field  <?php echo $this->type ?>-group-wrap">
            <th scope="row"><label for="<?php echo $name ?>"><?php echo $title ?></label></th>
            <td>
                <select name='<?php echo $name ?>' id='<?php echo $name ?>'>
                    <?php 
                        foreach($options as $key => $text) {
                            ?>
                            <option value='<?php echo $key ?>' <?php echo ($value == $key)? 'selected' : ''; ?>  ><?php echo $text ?></option>
                            <?php
                        }
                    ?>
                </select>
                <?php $this->add_nonce($name);  ?>
            </td>
        </tr><?php
    }

    /**
     * Display a text field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function text_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'text');
    }

    /**
     * Display a email field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function email_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'email');
    }

    /**
     * Display a number field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function number_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'number');
    }

    /**
     * Display a colorpicker field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function colorpicker_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'color');
    }

    /**
     * Display a password field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function password_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'password');
    }

    /**
     * Display a telephone number field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function phone_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'tel');
    }

    /**
     * Display a url field.
     * 
     * @param string $value
     * @param string $name
     * @param string $title
     * 
     */
    protected function url_field($value, $name, $title = '') {
        $this->input_field($value, $name, $title, 'url');
    }

}
