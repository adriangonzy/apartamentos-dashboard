var React = require('react');
var MonthBar = require('./monthbar.js');
var DatePicker = require('./datepicker.js');
var DatePickerInput = require('./datepickerinput.js');

var APP = 
	React.createClass({
		render: function() {	
			return (
				<div>
					<h1>Mi app de ratillas</h1>
					<MonthBar 
						reservations={reservations} />
					<DatePicker />
					<DatePickerInput />
				</div>
			);
		}
	});
module.exports = APP;