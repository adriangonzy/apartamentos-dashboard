var keyMirror = require('react/lib/keyMirror');

// Define action constants
module.exports = keyMirror({
	HOMELIDAYS_URL: 'http://www.homelidays.com/hebergement/p',
	RECEIVE_APARTS: null,
	APARTS_FILTER: null,
	APARTS_UPDATE: null,
	APART_UPDATE: null, 
	APART_UPDATE_COMPLETE: null,
	APART_EXPAND: null
});