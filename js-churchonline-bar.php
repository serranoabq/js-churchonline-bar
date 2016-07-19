<?php
/*
	Plugin Name: ChurchOnline Notification Bar
	Description: Plugin to create a notification bar at the top of your site to notify when your ChurchOnline event is live
	Version: 1.0
	Author: Justin R. Serrano
*/

class JS_ChurchOnlineBar {
	
	private $account_name;
	private $debug_enabled = false;
	
	function __construct(){
		// Use Custommizer to set settings
		add_action( 'customize_register', array( $this, 'customize_register' ), 11 );
		
		$this->account_name = get_theme_mod( 'churchonline_account' );

		if( ! $this->account_name ) {
			add_action( 'admin_notices', array( $this, 'setting_admin_notice__error' ) );
		}
		
		add_action( 'wp_enqueue_scripts', array( $this, 'add_scripts' ) );
		
	}
	
	function setting_admin_notice__error() {
		$class = 'notice notice-error';
		$message = sprintf( __( 'The ChurchOnline account name must be set in the <a href="%s">Customizer</a>.', 'js_churchonline' ), admin_url( 'customize.php?autofocus[control]=churchonline_account' ) );

		printf( '<div class="%1$s"><p>%2$s</p></div>', $class, $message ); 
	}
	
	// Customizer settings
	function customize_register( $wp_customize ){
		
		// Add new section
		$this->customize_createSection( $wp_customize, array(
			'id' => 'churchonline',
			'title' => _x( 'Church Online Notification Bar', 'Customizer section title', 'js_churchonline' ),
			'description' => _x( 'Settings for ChurchOnline notification bar', 'Customizer section description', 'js_churchonline' ),
		) );
		
		// Add controls
		// Username
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_account',
			'label' => _x( 'ChurchOnline username', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'text',
			'description' => _x( 'Enter the account username.', 'Customizer setting description', 'js_churchonline' ),
			'default' => '',
			'section' => 'churchonline',
		) );
		
		// Location
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_location',
			'label' => _x( 'Location', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'select',
			'choices' => array(
				'front' => 'Front Page',
				'all' => 'Everywhere'
			),
			'description' => _x( 'Choose whether to display the notification bar on the front page only or everywhere.', 'Customizer setting description', 'js_churchonline' ),
			'default' => 'front',
			'section' => 'churchonline',
		) );
		
		// Injection point
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_inject',
			'label' => _x( 'DOM Element to inject into', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'text',
			'description' => _x( 'Enter the CSS selector of the parent element the notification bar will be injected into (e.g. <code>body</code>, <code>#header</code>, <code>.top</code>).', 'Customizer setting description', 'js_churchonline' ),
			'default' => 'body',
			'section' => 'churchonline',
		) );
		
		// Live link text
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_livelink',
			'label' => _x( 'Link text', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'text',
			'description' => _x( 'Enter the text to include in the link when the event is live.', 'Customizer setting description', 'js_churchonline' ),
			'default' => __( 'Click here to watch LIVE.' , 'js_churchonline' ),
			'section' => 'churchonline',
		) );
		
		// Upcoming text
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_upcomingtext',
			'label' => _x( 'Upcoming  text', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'text',
			'description' => _x( 'Enter the text to include bar when the event is scheduled. Use <code>{{CLOCK}}</code> for a countdown timer', 'Customizer setting description', 'js_churchonline' ),
			'default' => __( 'Next live event starts in {{CLOCK}}' , 'js_churchonline' ),
			'section' => 'churchonline',
		) );
		
		// Custom CSS
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_css',
			'label' => _x( 'Custom CSS', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'textarea',
			'description' => _x( 'Enter any custom CSS to apply to the notification bar. The following ids and classes are used: <code>#jscob_bar</code>, <code>#jscob_link</code>, <code>#jscob_clock</code>, <code>#jscob_clock.live</code>, <code>#jscob_clock.upcoming</code>. Depending on your theme, you might have to override some styles with <code>!important</code>.', 'Customizer setting description', 'js_churchonline' ),
			'default' => '',
			'section' => 'churchonline',
		) );
		
		// Cache time
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_delay',
			'label' => _x( 'Notification delay', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'select',
			'choices'=> array(
				'2880' => '2 days',
				'1440' => '1 day',
				'720'  => '12 hours',
				'360'  => '6 hours',
				'120'  => '2 hours',
				'60'   => '1 hour',
				'30'   => '30 minutes',
				'15'   => '15 minutes',
				'10'   => '10 minutes',
				'5'    => '5 minutes',
				'1'    => '1 minute',
				'-1'   => 'No delay',
			),
			'description' => _x( 'Choose how long before the event the notification bar is displayed. <code>No delay</code> shows the notification as soon as there is an event date announced.', 'Customizer setting description', 'js_churchonline' ),
			'default' => '-1',
			'section' => 'churchonline',
		) );
		
		$this->customize_createSetting( $wp_customize, array(
			'id' => 'churchonline_showupcoming',
			'label' => _x( 'Show bar when upcoming', 'Customizer setting label', 'js_churchonline' ),
			'type' => 'checkbox',
			'description' => _x( 'Check to display the notification bar when an event is scheduled, but not live yet. ', 'Customizer setting description', 'js_churchonline' ),
			'default' => true,
			'section' => 'churchonline',
		) );

	}
	
	function add_scripts(){
		
		$this->debug_enabled = $this->debug_enabled || is_customize_preview();
		
		$location = get_theme_mod( 'churchonline_location' );
		if( 'front' == $location && ! is_front_page() ) return;
				
		wp_enqueue_script( 'jscob-script', plugins_url( 'jscob-script.js', __FILE__ ), array( 'jquery') );
		
		// Add scripts
		$jscob_data = array(
			'account'   => get_theme_mod( 'churchonline_account' ),
			'live_text' => sprintf( '<a href="http://%s.churchonline.org" id="jscob_link" target="_blank">' . get_theme_mod( 'churchonline_livelink' ) . '</a>', get_theme_mod( 'churchonline_account' ) ),
			'upcoming_text' => str_replace( '{{CLOCK}}', '<span id="jscob_clock"></span>', get_theme_mod( 'churchonline_upcomingtext' ) ),
			'parent'    => get_theme_mod( 'churchonline_inject' ),
			'show_upc'  => get_theme_mod( 'churchonline_showupcoming' ),
			'delay'     => get_theme_mod( 'churchonline_delay' ),
			'debug'     => $this->debug_enabled,
		);
		
		wp_localize_script( 'jscob-script', 'jscob_data', $jscob_data );
		add_action( 'wp_footer', array( $this, 'style_footer' ) );
			
	}
	
	function style_footer(){
		// Add custom CSS
		$style = "
		.jscob-hiddenbar { 
			position: absolute; 
			overflow: hidden; 
			clip: rect(0 0 0 0); 
			height: 1px; width: 1px; 
			margin: -1px; padding: 0; border: 0; 
		}
		";
		echo '<style>' . $style; 
		if( get_theme_mod( 'churchonline_css' ) ){
			echo get_theme_mod( 'churchonline_css' ); 
		}
		echo '</style>';
	}
	
	// Customizer shortcut for section creation
	function customize_createSection( $wp_customize, $args ) {
		$default_args = array(
			'id' 	            => '', // required
			'title'           => '', // required
			'priority'        => '', // optional
			'description'     => '', // optional
			'active_callback' => '', // optional
			'panel'           => '', // optional
		);
		
		// Check for required inputs
		if( ! ( isset( $args[ 'id' ] ) AND isset( $args[ 'title' ] ) ) ) return;
		if( empty( $args[ 'id' ] ) ||  empty( $args[ 'title' ] ) ) return;
		
		$id = $args[ 'id' ];
		unset( $args[ 'id' ] );
		$wp_customize->add_section( $id, $args );
	}

	// Customizer shortcut for setting creation
	function customize_createSetting( $wp_customize, $args ) {
		$default_args = array(
			'id' 	              => '', // required
			'type'              => 'text', // required. This refers to the control type. 
																		 // All settings are theme_mod and accessible via get_theme_mod.  
																		 // Other types include: 'number', 'checkbox', 'textarea', 'radio',
																		 // 'select', 'dropdown-pages', 'email', 'url', 'date', 'hidden',
																		 // 'image', 'color'
			'label'             => '', // required
			'default'           => '', // required
			'section'           => '', // required
			'sanitize_callback' => '', // optional
			'transport'         => '', // optional
			'description'       => '', // optional
			'priority'          => '', // optional
			'choices'           => '', // optional
			'panel'             => '', // optional
		);
		
		// Available types and arguments
		$available_types = array( 'text', 'number', 'checkbox', 'textarea', 'radio', 'select', 'dropdown-pages', 'email', 'url', 'date', 'hidden', 'image', 'color' );
		$setting_def_args = array( 'default'=> '', 'sanitize_callback'=>'', 'transport'=>'' );
		$control_def_args = array( 'type'=>'', 'label'=>'', 'description'=>'', 'priority'=>'', 'choices'=>'', 'section'=>'' );
		// Check for required inputs
		if( ! ( isset( $args[ 'id' ] ) AND 
						isset( $args[ 'default' ] ) AND 
						isset( $args[ 'section' ] ) AND 
						isset( $args[ 'type' ] ) ) )
			return;
		// Check for non-empty inputs, too
		if( empty( $args[ 'id' ] ) ||  
				empty( $args[ 'section' ] ) ||  
				empty( $args[ 'type' ] ) )
			return;
			
		// Check for a right type
		if( ! in_array( $args[ 'type' ], $available_types ) ) $args[ 'type' ] = 'text';
		
		$id = $args[ 'id' ];
		unset( $args[ 'id' ] );
		
		// Split setting arguments and control arguments
		$setting_args = array_intersect_key( $args, $setting_def_args );
		$control_args = array_intersect_key( $args, $control_def_args );
		
		$wp_customize->add_setting( $id, $setting_args );
		
		if( 'image' == $args[ 'type' ] ) {
			$wp_customize->add_control( new WP_Customize_Image_Control(
				$wp_customize,
				$id,
				array(
					'label'      => $args[ 'label' ] ? $args[ 'label' ] : '',
					'section'    => $args[ 'section' ],
					'settings'   => $id,
					'description'=> $args[ 'description' ] ? $args[ 'description' ] : ''
				)
			) );
		} elseif( 'color' == $args[ 'type' ] ) {
			$wp_customize->add_control( new WP_Customize_Image_Control(
				$wp_customize,
				$id,
				array(
					'label'      => $args[ 'label' ] ? $args[ 'label' ] : '',
					'section'    => $args[ 'section' ],
					'settings'   => $id,
					'description'=> $args[ 'description' ] ? $args[ 'description' ] : ''
				)
			) );
		} else {
			$wp_customize->add_control( $id, $control_args );
		}
	}
	
	// Debug function
	function debug( $msg ){
		if( is_user_logged_in() && $this->debug_enabled ){
			error_log( __CLASS__ . ':' . $msg );
		}
	}
	
}
new JS_ChurchOnlineBar();