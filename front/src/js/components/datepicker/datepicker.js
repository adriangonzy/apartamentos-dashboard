var React = require('react');
var moment = require('moment');
var DayPicker = require('./daypicker.js');
var NumberPicker = require('./numberpicker.js');

var DatePicker = React.createClass({
      getDefaultProps: function() {
          return ({
            show: true,
            date: moment(),
            selectDate: function(date) {
              console.log("select", date);
            }
          });
      },
      changeYear: function(year) {
        var newDate = moment(this.props.date).year(year);
        this.props.selectDate(newDate);
      },
      changeMonth: function(month) {
        var newDate = moment(this.props.date).month(month - 1);
        this.props.selectDate(newDate);
      },
      selectDate: function(date) {
        this.setState({date: date});
        this.props.selectDate(date);
      },
      render: function () {
          var style = {display:(this.props.show ? 'block' : 'none')};
          var date = this.props.date;
          return (
              <div className="datepicker" style={style}>
                  <div className="datepicker-container">
                      <NumberPicker 
                        number={date.year()} 
                        value={date.year()} 
                        onChangeNumber={this.changeYear} />
                      <NumberPicker 
                        number={date.month() + 1}
                        value={date.month() + 1}
                        onChangeNumber={this.changeMonth} />
                      <DayPicker 
                        date={date}
                        selectDate={this.selectDate} />
                  </div>
              </div>
          );
      }
  });

module.exports = DatePicker;