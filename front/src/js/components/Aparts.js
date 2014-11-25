var React = require('react/addons');
var Perf = React.addons.Perf;
var ApartStore = require('../stores/ApartStore');
var DatesStore = require('../stores/DatesStore');
var ApartList = require('./ApartList');
var DatesFilter = require('./DatesFilter');

// Method to retrieve state from Stores
function getApartsState() {
  return {
    aparts: ApartStore.getAparts(),
    dates: DatesStore.getDates()
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
			<ApartList
			  aparts={this.state.aparts} 
			  dates={this.state.dates} />
    );
  },

  componentDidUpdate: function() {
    Perf.stop();
    var measurements = Perf.getLastMeasurements();
    Perf.printInclusive(measurements);
    Perf.printExclusive(measurements);
    Perf.printWasted(measurements);
    Perf.printDOM(measurements);
  }
});

module.exports = Aparts;