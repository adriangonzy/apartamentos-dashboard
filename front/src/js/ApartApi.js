var ApartActions = require('./actions/ApartActions');
var Ajax = require('simple-ajax');

var baseURL = 'http://localhost:8080';

module.exports = {

	getAparts: function() {
		var req = new Ajax({
	        url: baseURL + '/rest/apart/',
	        method: 'GET'
	    });

		req.on('success', function(event) {
			console.log('getAparts:', event);
			ApartActions.receiveAparts(event);
		})
		.on('error', function(event) {
			console.error('getAparts:', event);
		})
		.send();
	},

	updateAparts: function() {
		var req = new Ajax({
	        url: baseURL + '/rest/apart/',
	        method: 'PUT'
	    });

		req.on('success', function(event) {
			console.log('updateAparts:', event);
			ApartActions.receiveAparts(event);
		})
		.on('error', function(event) {
			console.error('updateAparts:', event);
		})
		.send();
	},

	updateApart: function(apartId) {
		var req = new Ajax({
	        url: baseURL + '/rest/apart/' + apartId + '/',
	        method: 'PUT'
	    });

		req.on('success', function(event) {
			console.log('updateApart:', event);
			ApartActions.updateApartComplete(event);
		})
		.on('error', function(event) {
			console.error('updateApart:', event);
		})
		.send();
	}
};