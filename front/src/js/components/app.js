/** @jsx React.DOM */
var React = require('react');
var reservations = require('./reservations.js')
var MonthBar = require('./monthbar.js');
var DatePicker = require('./datepicker.js');

var APP = 
	React.createClass({
		render: function() {	
			return (
				<div>
					<h1>Mi app de ratillas</h1>
					<MonthBar 
						reservations={reservations} />
					<DatePicker />
				</div>
			);
		}
	});
module.exports = APP;