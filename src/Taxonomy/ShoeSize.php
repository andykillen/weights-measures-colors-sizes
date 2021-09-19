<?php 

namespace WMCS\Taxonomy;

use WMCS\Base\Taxonomy;

class ShoeSize extends Taxonomy {
    protected $name = 'shoesize';
    protected $singular = 'Metric Shoe Size';
    protected $plural = 'Metric Shoe Sizes';

    
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
}