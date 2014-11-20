var React = require('react');
var MonthBar = require('./monthbar');
var DatePicker = require('./datepicker');
var DatePickerInput = require('./datepickerinput');

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