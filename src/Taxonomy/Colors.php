<?php

namespace WMCS\Taxonomy;

use WMCS\Base\Taxonomy;

class Colors extends Taxonomy{

    protected $name = 'colors';
    protected $singular = 'Color';
    protected $plural = 'Colors';

    
    protected function adaptions(){
        $this->add_column('hex', 'HEX color');
        

        $this->fields = array(
            array(
                'name' => 'hex',
                'type' => 'color',
                'title' => 'Hex Color value'
            ),
        );
    }

    public static function info() {
        return array(
            'name' => 'colors',
            'title' => 'Available colors',
            'type'  => 'radio',
            'options' => array(
                '1' => 'On',
                '2' => 'Off'
            ),
            'default' => 'off',
            'stem' => WOO_WMCS_PLUGIN_PATH . '/starters/colors.php'
        );
    }
}
