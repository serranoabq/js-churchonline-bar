/* 	
	Countdown clock for js-churchonline-bar
*/

const CURRENT_SERVICE_QUERY = `
query CurrentService {
  currentService(onEmpty: LOAD_NEXT) {
    id
    startTime
    endTime
    content {
      title
    }
  }
}
`;

( function($) {
	$(document).ready( function() {
		var jscob_bar, jscob_clock;
		var account = jscob_data.account;
		if( ! account ) return;
		
		var churchUrl = 'https://' + account + '.online.church/graphql';
		
		// get time until event start
		//	returns: { string with countdown, remiaining time in ms }
		function getRemainingTime( start_time ){
			var now = new Date().getTime();
			var t = start_time - now;

			// Time calculations for days, hours, minutes and seconds
			var days = Math.floor( t / ( 1000 * 60 * 60 * 24 ) ) ;
			var hours = Math.floor(
				( t % (1000 * 60 * 60 * 24) ) / ( 1000 * 60 * 60 )
			);
			var minutes = Math.floor( ( t % ( 1000 * 60 * 60 ) ) / ( 1000 * 60 ) );
			var seconds = Math.floor( ( t % ( 1000 * 60) ) / 1000 );
			
			// Format clock
			var sclock = "";
			if( days > 0 ) 
				sclock = '<span class="digits days">' + days + ( jscob_data.show_units ? '<span class="jscob_units">d</span>' : '' ) + '</span> '; 
			if( hours > 0 ) 
				sclock = sclock + '<span class="digits hours">' + hours + ( jscob_data.show_units ? '<span class="jscob_units">h</span>' : '' )  + '</span> ';
			if( minutes > 0 ) 
				sclock = sclock + '<span class="digits minutes">' + ('0' + minutes).slice(-2) + ( jscob_data.show_units ? '<span class="jscob_units">m</span>' : '' ) + '</span> '; 
			if( seconds >= 0 && days == 0 && hours < 1 )  
				sclock = sclock + '<span class="digits seconds">' + ('0' + seconds).slice(-2) + ( jscob_data.show_units ? '<span class="jscob_units">s</span>' : '' ) + '</span> '; 
			
			return { "clock" : sclock, "time_remaining": t };
		}
		
		/**/ 
		async function fetchData(){
			
			// Fetch the current or next service data
			const service = await fetch( "https://" + account + ".online.church/graphql", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: JSON.stringify( {
					query: CURRENT_SERVICE_QUERY,
					operationName: "CurrentService"
				} )
			} )
			.then( ( response ) => response.json() )
			.catch( ( error ) => console.error( error ) );

			// If no service was returned from the API, don't display the countdown
			if( ! service.data.currentService || ! service.data.currentService.id ) {
				return;
			}
			
			// We're good to go; make the bar
			createBar( service.data );
			
		} // fetchData
		
		function createBar( data ){
			// Create the bar
			
			// Figure out the time
			var now = new Date().getTime();
			if( jscob_data.debug ){
				// some dummy time for debugging
				var d = new Date();
				var d2 = new Date( d );
				d2.setSeconds( d.getSeconds() + 90 );
				d.setSeconds( d.getSeconds() + 120 );
				var startTime = d2.getTime();
				var endTime = d.getTime();
			} else {
				var startTime = new Date( data.currentService.startTime ).getTime();
				var endTime = new Date( data.currentService.endTime ).getTime();
			}
			var is_live = ( now >= startTime && now <= endTime );
			
			// Set up the bar text		
			jscob_data.upcoming_text = jscob_data.upcoming_text.replace( "{{CLOCK}}", '<span id="jscob_clock"></span>' );
			if( jscob_data.upcoming_text.indexOf('<span id="jscob_clock"' ) == -1 ){
				jscob_data.upcoming_text + ' <span id="jscob_clock"></span>';
			}
			
			jscob_bar = $( '<div id="jscob_bar"></div>' );
			jscob_bar.html( is_live ? jscob_data.live_text : jscob_data.upcoming_text );
			
			// add classes
			jscob_bar.addClass( is_live ? 'live' : 'upcoming' );
			if( ! jscob_data.show_upc ){ 
				jscob_bar.addClass( 'jsls-hiddenbar' );
			}
			
			// Add bar to DOM
			$( jscob_data.parent ).prepend( jscob_bar ); 
			jscob_data.bar = jscob_bar;
			jscob_data.live = is_live;
			
			// if the event is live, no need for a clock
			if( is_live ) return;
			
			jscob_data.start_time = startTime;
			
			// Start the clock
			intializeClock();
			
		}
		
		function intializeClock(){
			// Start the clock
			
			var jscob_clock = jscob_data.bar.find("#jscob_clock");
			if( ! jscob_data.delay ) jscob_data.delay = -1;
			
			function updateClock(){
				// Update the clock
				
				var t = getRemainingTime( jscob_data.start_time );
				
				// hide the bar if the event is too far out
				if( jscob_data.delay > 0 ){
					if( t.time_remaining > jscob_data.delay * 60000 ){
						if( ! jscob_data.bar.hasClass( 'jscob-hiddenbar' ) ) 
							jscob_data.bar.addClass( 'jscob-hiddenbar' );
					} else {
						jscob_data.bar.removeClass( 'jscob-hiddenbar' );
					}
				}
				
				// output the clock
				jscob_clock.html( t.clock );
				
				// update the clock depending on how much time is left
				if( t.time_remaining > 1000 * 60 * 60 * 24 ) {
					clearInterval( intervalId )
					intervalId = setInterval( updateClock, 60000 );
				}
				if( t.time_remaining < 1000 ){
					clearInterval( intervalId )
					//(function(){
					jscob_bar.html( jscob_data.live_text );
					jscob_bar.removeClass( 'jscob-hiddenbar upcoming' ).addClass( 'live' );
					//})();
				}
				
			}
			
			updateClock();
			var intervalId = setInterval( updateClock, 1000 );
			
		}
	
		fetchData();
		
	} );
	
	function debug( msg ){
		if( jscob_data.debug && console.log ){
			console.log( msg );
		}
	}
	
} )( jQuery );