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

(function($) {
	$(document).ready( function() {
		
		var account = jscob_data.account;
		if( ! account ) return;
		
		var churchUrl = 'http://' + account + '.online.church/graphql';
		
		// Create the notification bar
		var jscob_bar = $( '<div id="jscob_bar"></div>' );
		var jscob_clock = jscob_bar.find( '#jscob_clock' );
		if( ! jscob_clock ) { jscob_clock = $( '<span id="jscob_clock"></span>' ); }
			
		async function startCountdown() {
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

			// Set the date we're counting down to
			const startTime = new Date( service.data.currentService.startTime ).getTime();
			const endTime = new Date( service.data.currentService.endTime ).getTime();
			
			jscob_data.bar = jscob_bar;
			jscob_data.start_time = startTime;
			
			// Create a one second interval to tick down to the startTime
			const intervalId = setInterval( function () {
				var is_live = false;
				const now = new Date().getTime();

				// If we are between the start and end time, the service is live
				if( now >= startTime && now <= endTime ) {
					clearInterval( intervalId );
					is_live = true;
					jscob_bar.html( jscob_data.live_text );
					jscob_bar.removeClass( 'jscob-hiddenbar upcoming' ).addClass( 'live' );
					return;
				} else {
					jscob_bar.html( jscob_data.upcoming_text );
					jscob_bar.addClass( 'upcoming' );
				}

				// Find the difference between now and the start time
				const difference = startTime - now;

				// Time calculations for days, hours, minutes and seconds
				const days = Math.floor( difference / ( 1000 * 60 * 60 * 24 ) );
				const hours = Math.floor(
					( difference % (1000 * 60 * 60 * 24) ) / ( 1000 * 60 * 60 )
				);
				const minutes = Math.floor( ( difference % ( 1000 * 60 * 60 ) ) / ( 1000 * 60 ) );
				const seconds = Math.floor( ( difference % ( 1000 * 60) ) / 1000 );
				
				var sclock = "";
				if( days > 0 ) { sclock = '<span class="days">' + days + 'd</span> '; }
				if( hours > 0 && t.total > 3600 ) { sclock = sclock + '<span class="hours">' + hours + 'h</span> '; }
				if( minutes > 0 && t.total > 60 ) { sclock = sclock + '<span class="minutes">' + ('0' + minutes).slice(-2) + 'm</span> '; }
				if( seconds > 0 )  { sclock = sclock + '<span class="seconds">' + ('0' + seconds).slice(-2) + 's</span> '; }
				
				if( difference > 0 ){
					if( difference > delay * 60000 ) {
						if( ! jscob_data.bar.hasClass( 'jscob-hiddenbar' ) ) 
							jscob_data.bar.addClass( 'jscob-hiddenbar' );
					} else {
						jscob_data.bar.removeClass( 'jscob-hiddenbar' );
					}
				}
				
				// Display the results 
				jscob_clock.html( sclock );

				// If we are past the end time, clear the countdown
				if( difference < 0 ) {
					clearInterval( intervalId );
					jscob_clock.html = "";
					//document.getElementById("countdown").innerHTML = "";
					return;
				}
			}, 1000);
		}
		
		startCountdown();
	
	} );
		
	function debug( msg ){
		if( jscob_data.debug && console.log ){
			console.log( msg );
		}
	}
	
})( jQuery );