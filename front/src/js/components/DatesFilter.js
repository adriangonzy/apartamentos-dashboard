/** @jsx React.DOM */
var React = require('react/addons');
var Perf = React.addons.Perf;
var moment = require('moment');
var DatesActions = require('../actions/DatesActions');
var DatesStore = require('../stores/DatesStore');
var DatePickerInput = require('./datepicker/datepickerinput');

// Method to retrieve state from Stores
function getDatesState() {
  return {
    dates: DatesStore.getDates()
  };
}

var DatesFilter = React.createClass({

  // Get initial state from stores
  getInitialState: function() {
    return getDatesState();
  },

  _onChange: function() {
    this.setState(getDatesState());
  },

  // Add change listeners to stores
  componentDidMount: function() {
    DatesStore.addChangeListener(this._onChange);
  },

  // Remove change listers from stores
  componentWillUnmount: function() {
    DatesStore.removeChangeListener(this._onChange);
  },
  
  changeStart: function(date) {
    Perf.start();
    DatesActions.updateDates({start: date, end: this.state.dates.end});
  },
  changeEnd: function(date) {
    Perf.start();
    DatesActions.updateDates({start: this.state.dates.start, end: date});
  },
  render: function() {
    return (<form className="form-inline date-filters" role="form">
              <div className="date-filter form-group">
                <label className="date-picker-label">check-in</label>
                <DatePickerInput
                  date={this.state.dates.start}
                  onChangeDate={this.changeStart} />
              </div>
              <div className="date-filter form-group">
                <label className="date-picker-label">check-out</label>
                <DatePickerInput 
                  date={this.state.dates.end}
                  onChangeDate={this.changeEnd} />
              </div>
            </form>);
  }
});

module.exports = DatesFilter;