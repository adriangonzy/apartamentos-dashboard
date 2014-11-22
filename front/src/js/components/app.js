var React = require('react');
var Aparts = require('./Aparts');
var DatesFilter = require('./DatesFilter');

var APP = 
	React.createClass({
		render: function() {	
			return (
				<div>
					<DatesFilter />
					<Aparts />
				</div>
			);
		}
	});
module.exports = APP;