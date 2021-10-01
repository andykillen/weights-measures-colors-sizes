<?php 

namespace WMCS\Taxonomy;

use WMCS\Base\Taxonomy;

class ShoeSize extends Taxonomy {
    protected $name = 'shoesize';
    protected $singular = 'EU Shoe Size';
    protected $plural = 'EU Shoe Sizes';

    
    protected function adaptions(){
        $this->add_column('us', 'US size');
        $this->add_column('uk', 'UK size');

        $this->fields = array(
            array(
                'name' => 'uk',
                'type' => 'number',
                'title' => 'UK shoe size'
            ),
            array(
                'name' => 'us',
                'type' => 'number',
                'title' => 'US shoe size'
            ),
        );
    }

    public static function info() {
        return array(
            'name' => 'shoesize',
            'title' => 'Shoe Sizes',
            'type'  => 'radio',
            'options' => array(
                '1' => 'On',
                '2' => 'Off'
            ),
            'default' => 'off',
            'stem' => array( 
                WOO_WMCS_PLUGIN_PATH . '/starters/adult_shoes.php',
                WOO_WMCS_PLUGIN_PATH . '/starters/child_shoes.php',
            ),
            'default_col_order' => array(
                'EU',
                'UK',
                'US'
            )
        );
    }
}