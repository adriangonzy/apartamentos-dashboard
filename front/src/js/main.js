var React = require('react')
var APP = require('./components/app')
var ApartApi = require('./ApartApi.js');

// load aparts
ApartApi.getAparts();

React.render(
	<APP />, 
	document.getElementById('main'));