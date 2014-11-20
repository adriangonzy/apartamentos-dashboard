/** @jsx React.DOM */
var React = require('react');
var ApartActions = require('../actions/ApartActions');
var DatePickerInput = require('./datepicker/datepickerinput');

var DatesFilter = React.createClass({

  changeStart: function(date) {
    ApartActions.filterAparts({start: date, end: this.props.dates.end});
  },
  changeEnd: function(date) {
    ApartActions.filterAparts({start: this.props.dates.start, end: date});
  },
  render: function() {
    return (<form className="form-inline date-filters" role="form">
              <div className="date-filter form-group">
                <label className="date-picker-label">check-in</label>
                <DatePickerInput
                  date={this.props.dates.start}
                  onChangeDate={this.changeStart}/>
              </div>
              <div className="date-filter form-group">
                <label className="date-picker-label">check-out</label>
                <DatePickerInput 
                  date={this.props.dates.end}
                  onChangeDate={this.changeEnd}/>
              </div>
            </form>);
  }
});

module.exports = DatesFilter;