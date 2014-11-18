var React = require('react');
var moment = require('moment');
var DayPicker = require('./daypicker.js');
var NumberPicker = require('./numberpicker.js');

var DatePicker = React.createClass({
      getDefaultProps: function() {
          return ({
            show: true,
            selectedDate: moment(),
            changeYear: function(year) {
              this.selectDate(moment().year(year));
            },
            changeMonth: function(month) {
              this.selectDate(moment().month(month - 1));
            },
            selectDate: function(date) {
              console.log("select", date);
            }
          });
      },
      
      render: function () {
          var style = {display:(this.props.show ? 'block' : 'none')};
          var date = this.props.selectedDate;
          return (
              <div className="datepicker" style={style}>
                  <div className="datepicker-container">
                      <NumberPicker 
                        number={date.year()} 
                        value={date.year()} 
                        onChangeNumber={this.props.changeYear} />
                      <NumberPicker 
                        number={date.month() + 1}
                        value={date.month() + 1}
                        onChangeNumber={this.props.changeMonth} />
                      <DayPicker 
                        date={this.props.selectedDate}
                        selectDate={this.props.selectDate} />
                  </div>
              </div>
          );
      }
  });

module.exports = DatePicker;