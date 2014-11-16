var React = require('react');
var moment = require('moment');
var DayPicker = require('./daypicker.js');
var NumberPicker = require('./numberpicker.js');

var DatePicker = React.createClass({
      getInitialState: function() {
          return({visibleDate:this.props.selectedDate});
      },
      getDefaultProps: function() {
          return ({
            show: true,
            selectedDate: moment(),
            onChangeDate: function(date) {
              console.log(date);
            }
          });
      },
      onChangeSelectedDate: function(date) {
          this.setState({visibleDate:date});
          this.props.onChangeDate(date);
      },
      changeYear: function(year) {
          this.setState({visibleDate: this.state.visibleDate.year(year)});
      },
      changeMonth: function(month) {
          this.setState({visibleDate: this.state.visibleDate.month(month)});
      },

      render: function () {
          var style = {display:(this.props.show ? 'block':'none')};
          var visibleDate = this.state.visibleDate;
          return (
              <div className="datepicker" style={style}>
                  <div className="datepicker-container">
                      <NumberPicker 
                        number={visibleDate.year()} 
                        value={visibleDate.year()} 
                        onChangeNumber={this.changeYear} />
                      <NumberPicker 
                        number={visibleDate.month()}
                        value={visibleDate.month()}
                        onChangeNumber={this.changeMonth} />
                      <DayPicker 
                        date={visibleDate}
                        select={this.onChangeSelectedDate} />
                  </div>
              </div>
              );
      }
  });

module.exports = DatePicker;