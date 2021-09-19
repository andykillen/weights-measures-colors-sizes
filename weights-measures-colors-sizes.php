<?php
/**
 * Plugin Name: WooCommerce Weights, Measures, Colors and Sizes
 * Author: Andrew Killen
 * Author URI: https://grok.codes
 * Text Domain: woocomwmcs
 */

 // stop now if not WP.
if(!defined('ABSPATH')){
    die();
}

/**
 * Contstants used throughout the project.
 */
define('WOO_WMCS_TEXTDOMAIN', 'woocomwmcs');
define("WOO_WMCS_PLUGIN_PATH", plugin_dir_path( __FILE__ ) );
define("WOO_WMCS_PLUGIN_URI", plugin_dir_url( __FILE__ ) );
define("WOO_WMCS_OPTIONS", 'weights_and_measures_settings');

/**
 * Autoloader for entire project.
 */
require dirname(__FILE__) . "/vendor/autoload.php";

/**
 * Singleton container to hold the project
 */
new WMCS\Taxonomy\ShoeSize;