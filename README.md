# ChurchOnline Notification Bar (Plugin)

A WordPress plugin to display a notification on the header of the site when there is [Church Online](https://online.church) event scheduled or live on a specific account 

## Description

This plugin is used to display a notification on the header of the site when there is [Church Online](https://online.church) event scheduled or live on a specific account (doesn't have to be your own). If there is an livestream scheduled, the bar will display a countdown until the event is live. Once it is live, the bar contains a link to the event page. 

## Configuration

Configuration is done through the WordPress Customizer. 

### Options 
* **Church Online Account:** Church Online account name (e.g., *.online.church)
* **Location:** Where to display the bar on the site: on the front page only or everywhere on the site
* **DOM element to inject into:** The CSS selector of the parent element the notification bar will be injected into (e.g. `body`, `#header`, `.top`.
* **Link text:** Text to show in the link when the event is live. 
* **Upcoming text:** Text to show when the event is scheduled. Use `{{CLOCK}}` for a countdown timer; If `{{CLOCK}}` is not included, the countdown will be appended at the end of the text. 
* **Notification delay:** How long before the event is the bar displayed for. Options range from 1 min - 2 days, or no delay, in which case the bar is displayed as soon as the new event is scheduled.
* **Show bar when upcoming:** If checked, the bar is displayed when there is an event scheduled, subject to the *Delay* setting.
* **Show units:** If checked, the units (d, h, m, s) are displayed in the countdown clock.  
* **Custom CSS:** Enter any custom CSS to style the bar (see below) and its contents.

### Custom CSS

The following styles are available:
```css
#jscob_bar{ _/* Notification bar */_ }
#jscob_link { _/* Link when live */_ }
#jscob_clock { _/* Clock */_ }
#jscob_clock .digits { _/* Clock digits */_ }
#jscob_clock .days/.hours/.minutes/.seconds { _/* Clock days, hours, minutes, seconds */_ }
#jscob_clock .jscob_units { _/* Clock units */_ }
#jscob_bar.live { _/* Bar style when live */_ }
#jscob_bar.upcoming { _/* Bar style when upcoming */_ }
```

Depending on your theme you might have to override some styles with `!important`. 

### Overriding units
An alternative way to override the units displayed in the clock is by unchecking the Show units option in the Customizer and using css as follows:
```css
#jscob_clock .digits:after { 
	/* Format the units */
	font-variant: small-caps;
	font-size: 0.5em;
	color: #343434;
}
/* Modify the unit text */
#jscob_clock .days:after{ content: 'days'; }
#jscob_clock .hours:after{ content: 'hours'; }
#jscob_clock .minutes:after{ content: 'minutes'; }
#jscob_clock .seconds:after{ content: 'seconds'; }
```

## Installation

Please see [Installing Plugins](http://codex.wordpress.org/Managing_Plugins#Installing_Plugins) in the WordPress Codex for general installation instructions.


## Changelog

* 1.0   - Initial version
* 1.1 	- Initial upgrade to new version 
* 1.2 	- Full GraphQl support
* 1.2.1 - Minor updates