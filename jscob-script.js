/* 	
	Countdown clock for js-churchonline-bar
*/
(function($) {
	$(document).ready( function() {
		
		var account = jscob_data.account;
		if( ! account ) return;
		
		var churchUrl = 'http://' + account + '.churchonline.org';
		var eventUrl = eventUrl = churchUrl + '/api/v1/events/current';
		// Create the notification bar
		var jscob_bar = $('<div id="jscob_bar"></div>' );
		
		fetchData();
		
		function fetchData(){
			msie = /msie/.test(navigator.userAgent.toLowerCase())
			if (msie && window.XDomainRequest) {
					var xdr = new XDomainRequest();
					xdr.open("get", eventUrl);
					xdr.onload = function() {
						loadCountdown($.parseJSON(xdr.responseText))
					};
					xdr.send();
			} else {
				$.ajax({
					url: eventUrl,
					dataType: "json",
					crossDomain: true,
					success: function(data) {
						loadCountdown(data);
					},
					error: function(xhr, ajaxOptions, thrownError) {
						return console.log(thrownError);
					}
				});
			}
		}
		
		function loadCountdown( data ){
			
			var is_live = data.response.item.isLive;
			
			jscob_bar.html( is_live ? jscob_data.live_text : jscob_data.upcoming_text );
			
			jscob_bar.addClass( is_live ? 'live' : 'upcoming' );
			
			// If upcoming message will not be displayed, just hide the bar
			if( ! jscob_data.show_upc ){ 
				jscob_bar.addClass( 'jsls-hiddenbar' );
			}
			
			var jscob = $( jscob_data.parent ).prepend( jscob_bar ); 
			
			jscob_data.bar = jscob_bar;
			
			if( is_live ) return;
			
			jscob_data.start_time = data.response.item.eventStartTime;
			
			if( jscob_data.debug ){
				var d = new Date();
				var d2 = new Date( d );
				d2.setSeconds( d.getSeconds() + 30 );
				jscob_data.start_time = d2;
			}
			
			var jscob_clock = jscob_bar.find( '#jscob_clock' );
			if( ! jscob_clock ) { jscob_clock = $( '<span id="jscob_clock"></span>' ); }
			initializeClock( 
				jscob_clock, 
				jscob_data.start_time, 
				jscob_data.delay, 
				function(){ 
					jscob_bar.html( jscob_data.live_text );
					jscob_bar.removeClass( 'jscob-hiddenbar upcoming' ).addClass( 'live' );
			} );
		}
		
	} );
	
	function getTimeRemaining( endtime ){
		var t = Date.parse( endtime ) - Date.parse( new Date() );
		var seconds = Math.floor( (t / 1000) % 60 );
		var minutes = Math.floor( (t / 1000 / 60) % 60 );
		var hours = Math.floor( (t / (1000 * 60 * 60)) % 24 );
		var days = Math.floor( t / (1000 * 60 * 60 * 24) );
		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
	}

	function initializeClock( element, endtime,delay, fn ) {
		var clock = $( element );
		if( delay === undefined ) delay = -1;
		
		function updateClock() {
			var t = getTimeRemaining( endtime );
			var sclock = "";
			if( t.days > 0 ) { sclock = '<span class="days">' + t.days + 'd</span> '; }
			if( t.hours > 0 && t.total > 3600 ) { sclock = sclock + '<span class="hours">' + t.hours + 'h</span> '; }
			if( t.minutes > 0 && t.total > 60 ) { sclock = sclock + '<span class="minutes">' + ('0' + t.minutes).slice(-2) + 'm</span> '; }
			if( t.total > 0 )  { sclock = sclock + '<span class="seconds">' + ('0' + t.seconds).slice(-2) + 's</span> '; }

			if( delay > 0 ){
				if( t.total > delay * 60000 ) {
					if( ! jscob_data.bar.hasClass( 'jscob-hiddenbar' ) ) 
						jscob_data.bar.addClass( 'jscob-hiddenbar' );
				} else {
					jscob_data.bar.removeClass( 'jscob-hiddenbar' );
				}
			}
			
			clock.html( sclock );
			
			if( t.total <= 0 ) {
				fn();
				clearInterval( timeinterval );
			}
			
		} 

		updateClock();
		var timeinterval = setInterval( updateClock, 1000 );
	}

	function debug( msg ){
		if( jscob_data.debug && console.log ){
			console.log( msg );
		}
	}
	
})( jQuery );