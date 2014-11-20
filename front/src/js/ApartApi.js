var ApartConstants = require('./constants/ApartConstants');
var ajax = require('simple-ajax');

module.exports = {

	getAparts: function() {
		var req = new Ajax({
	        url: 'http://localhost:8888/rest/apart',
	        method: 'GET'
	    });

		req.on('success', function(event) {
			console.log('getAparts:', event);
			ApartConstants.receiveAparts(event);
		})
		.on('error', function(event) {
			console.error('getAparts:', event);
		})
		.send();
	},

	updateAparts: function() {
		var req = new Ajax({
	        url: 'http://localhost:8888/rest/apart',
	        method: 'PUT'
	    });

		req.on('success', function(event) {
			console.log('updateAparts:', event);
			ApartConstants.receiveAparts(event);
		})
		.on('error', function(event) {
			console.error('updateAparts:', event);
		})
		.send();
	},

	updateApart: function(apartId) {
		var req = new Ajax({
	        url: 'http://localhost:8888/rest/apart/' + apartId,
	        method: 'PUT'
	    });

		req.on('success', function(event) {
			console.log('updateApart:', event);
			ApartConstants.updateApartComplete(event);
		})
		.on('error', function(event) {
			console.error('updateApart:', event);
		})
		.send();
	}
};