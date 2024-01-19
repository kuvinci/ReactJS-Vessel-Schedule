<?php
/**
 * Plugin Name: Vessel Schedule
 * Description: A plugin to integrate the Vessel Schedule ReactJS app into WordPress.
 * Version: 1.0.0
 * Author: Shero Commerce
 * Author URI: https://sherocommerce.com/
 * License: GPL-2.0+
 * Text Domain: vessel-schedule
 */

// Check if the ACF function exists
if (function_exists('acf_add_options_page')) {
    // Create an options page for the Vessel Schedule plugin
    acf_add_options_page([
        'page_title' => 'Vessel Schedule Settings',
        'menu_title' => 'Vessel Schedule',
        'menu_slug' => 'vessel-schedule-settings',
        'capability' => 'manage_options',
        'icon_url' => 'dashicons-schedule',
        'redirect' => false,
    ]);

    // Create ACF fields directly from the plugin to make it 100% modular
    if (function_exists('acf_add_local_field_group')) {
        acf_add_local_field_group([
            'key' => 'group_vessel_schedule',
            'title' => 'Vessel Schedule Settings',
            'fields' => [
                [
                    'key' => 'field_garden_city_terminal',
                    'name' => 'garden_city_terminal',
                    'label' => 'Garden City Terminal',
                    'type' => 'file',
                    'mime_types' => 'json',
                    'wrapper' => array(
                        'width' => '50',
                    ),
                ],
                [
                    'key' => 'field_ocean_terminal',
                    'name' => 'ocean_terminal',
                    'label' => 'Ocean Terminal',
                    'type' => 'file',
                    'mime_types' => 'json',
                    'wrapper' => array(
                        'width' => '50',
                    ),
                ],
//                 [
//                     'key' => 'field_vessel_schedule_title',
//                     'name' => 'vessel_schedule_title',
//                     'label' => 'Title',
//                     'type' => 'text',
//                     'wrapper' => array(
//                         'width' => '40',
//                     ),
//                 ],
//                 [
//                     'key' => 'field_vessel_schedule_top_text',
//                     'name' => 'vessel_schedule_top_text',
//                     'label' => 'Crane info',
//                     'type' => 'textarea',
//                     'wrapper' => array(
//                         'width' => '50',
//                     ),
//                 ],
//                 [
//                     'key' => 'field_vessel_schedule_bottom_text',
//                     'name' => 'vessel_schedule_bottom_text',
//                     'label' => 'Bottom disclaimer',
//                     'type' => 'textarea',
//                     'wrapper' => array(
//                         'width' => '50',
//                     ),
//                 ],
            ],
            'location' => [
                [
                    [
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'vessel-schedule-settings',
                    ],
                ],
            ],
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'hide_on_screen' => '',
            'active' => true,
            'description' => '',
        ]);
    }
} else {
    add_action('admin_notices', function () {
        ?>
        <div class="notice notice-error">
            <p><?php _e('The Vessel Schedule plugin requires Advanced Custom Fields Pro to be installed and activated.', 'vessel-schedule'); ?></p>
        </div>
        <?php
    });

    return;
}

// Allow JSON mime type files
function add_upload_mimes($types) {
    $types['json'] = 'text/plain';
    return $types;
}
add_filter('upload_mimes', 'add_upload_mimes');


function save_vessel_schedule_options($post_id) {
    // Check if it's the correct options page
    if ($post_id != 'options') {
        return;
    }

    $vessel_schedule_base_path = plugin_dir_path(__FILE__);

    // Get the garden_city_terminal and ocean_terminal files
    $gct_file = get_field('garden_city_terminal', 'option');
    $ot_file = get_field('ocean_terminal', 'option');

    $gct_file_path = get_attached_file($gct_file["ID"]);
    $ot_file_path = get_attached_file($ot_file["ID"]);

    // Rename the files and replace them in the specified directories
    if ($gct_file_path) {
        $new_gct_file_name = 'vessel_gct_data.json';

        $build_assets_dir = $vessel_schedule_base_path . 'build/assets/';
        $public_assets_dir = $vessel_schedule_base_path . 'public/assets/';

        copy($gct_file_path, $build_assets_dir . $new_gct_file_name);
        copy($gct_file_path, $public_assets_dir . $new_gct_file_name);
    }
    if ($ot_file_path) {
        $new_ot_file_name = 'vessel_ot_data.json';

        $build_assets_dir = $vessel_schedule_base_path . 'build/assets/';
        $public_assets_dir = $vessel_schedule_base_path . 'public/assets/';

        copy($ot_file_path, $build_assets_dir . $new_ot_file_name);
        copy($ot_file_path, $public_assets_dir . $new_ot_file_name);
    }
}
add_action('acf/save_post', 'save_vessel_schedule_options', 20);


function vessel_schedule_enqueue_scripts() {
    $plugin_url = plugin_dir_url(__FILE__);
    $plugin_path = plugin_dir_path(__FILE__);
    $manifest = $plugin_path . 'build/asset-manifest.json';

    if (file_exists($manifest)) {
        $manifest = json_decode(file_get_contents($manifest), true);
    }

    if (!empty($manifest) && isset($manifest['entrypoints'])) {
        foreach ($manifest['entrypoints'] as $entrypoint) {
            if (preg_match('/\.css$/', $entrypoint)) {
                wp_enqueue_style('vessel-schedule-css', $plugin_url . 'build/' . $entrypoint);
            }
            if (preg_match('/\.js$/', $entrypoint)) {
                $handle = 'vessel-schedule-js-' . md5($entrypoint);
                wp_enqueue_script($handle, $plugin_url . 'build/' . $entrypoint, [], null, true);
                wp_localize_script($handle, 'pluginParams', array(
                    'assetsUrl' => plugins_url('/build/assets/images/', __FILE__)
                ));
            }
        }
    }
}
add_action('wp_enqueue_scripts', 'vessel_schedule_enqueue_scripts');

function vessel_schedule_shortcode($atts) {
    return '<div id="vessel-schedule-root"></div>';
}
add_shortcode('vessel-schedule', 'vessel_schedule_shortcode');