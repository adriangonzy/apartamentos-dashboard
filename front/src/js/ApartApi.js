var ApartActions = require('./actions/ApartActions');
var request = require('superagent');

var baseURL = 'http://localhost:8080';

module.exports = {
	fillAparts: function() {
		request
		  	.put('/rest/apart/fill')
		  	.end(function(resp){
		  		console.log('fill aparts: ', event);
		  		ApartActions.receiveAparts(JSON.parse(resp.text));
		  	});
	},

	getAparts: function() {
		request
		  	.get('/rest/apart/')
		  	.end(function(resp){
		  		console.log('get aparts: ', event);
		  		ApartActions.receiveAparts(JSON.parse(resp.text));
		  	});
	},

	updateAparts: function() {
		request
		  	.put('/rest/apart/')
		  	.end(function(resp){
		  		console.log('update aparts: ', event);
		  		ApartActions.receiveAparts(JSON.parse(resp.text));
		  	});
	},

	updateApart: function(apartId) {
		request
		  	.put('/rest/apart/' + apartId + '/')
		  	.end(function(resp){
		  		console.log('update apart: ' + apartId);
		  		console.log(resp);
		  		ApartActions.updateApartComplete(JSON.parse(resp.text));
		  	});
	}
};