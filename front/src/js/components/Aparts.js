var React = require('react');
var ApartStore = require('../stores/ApartStore');
var ApartList = require('./ApartList');
var DatesFilter = require('./DatesFilter');

// Method to retrieve state from Stores
function getApartsState() {
  return {
    aparts: ApartStore.getAparts(),
    dates: ApartStore.getDates()
  };
}

// Define main Controller View
var Aparts = React.createClass({

  // Get initial state from stores
  getInitialState: function() {
    return getApartsState();
  },

  _onChange: function() {
    this.setState(getApartsState());
  },

  // Add change listeners to stores
  componentDidMount: function() {
    ApartStore.addChangeListener(this._onChange);
  },

  // Remove change listers from stores
  componentWillUnmount: function() {
    ApartStore.removeChangeListener(this._onChange);
  },

  // Render our child components, passing state via props
  render: function() {
    return (
		<div>
			<DatesFilter
			  dates={this.state.dates} />
			<ApartList
			  aparts={this.state.aparts} 
			  dates={this.state.dates} />
		</div>
    );
  }
});

module.exports = Aparts;