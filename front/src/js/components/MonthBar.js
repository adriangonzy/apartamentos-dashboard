var React = require('react');
var moment = require('moment');
var _ = require('lodash');
var DayPicker = require('./daypicker.js');

var MonthBar = React.createClass({
    getInitialState: function() {
        return ({visibleDate:this.props.selectedDate});
    },
    getDefaultProps: function() {
        return({
            reservations:{},
            selectedDate: moment(),
            period: {
                start: moment(),
                end: moment().add(1, 'years')
            },
            onChangeDate: function(date) {
              console.log(date);
            }
        });
    },

    onChangeSelectedDate: function(date) {
        this.setState({visibleDate:date});
        this.props.onChangeDate(date);
    },

    used: function(date) {
      return this.props.reservations[date.format('YYYY-MM-DD')] != undefined;
    },

    check: function(property) {
      return function(date) {
        var dateKey = date.format('YYYY-MM-DD');
        var check = false;
        _.each(this.props.weeks, function(k, reservation) {
          if (reservation[property] === dateKey) {
            check = true;
            return false;
          }
        });
        return check;
      }.bind(this);
    },

    inSearchPeriod: function(date) {
        var start = this.props.period.start, 
            end = this.props.period.end;
        return start.isBefore(date) && date.isBefore(end);
    },

    filterVisibleYears: function(start, end) {
        var count = 0;
        var wholeYear = [];
        while (count < 12) {
          wholeYear.push(moment().month(count++).locale('es').format("MMMM"));
        }

        if (end.isBefore(start))
          return wholeYear;

        var startYear = start.year(),
            endYear = end.year(),
            years = [],
            partialMonths = [];

        if (startYear < endYear) {
          console.log("different years");
          years[startYear] = _.filter(wholeYear, function(v, i) {
            return (start.month() <= i);
          });
          years[endYear] = _.filter(wholeYear, function(v, i) {
            return (i <= end.month());
          });
          startYear++;
          // pad
          while(startYear < endYear) {
            years[startYear]=wholeYear;
            startYear++;
          }
        } else {
          console.log("same year");
          years[startYear] = _.filter(wholeYear, function(v, i) {
            return (start.month() <= i && i <= end.month());
          }); 
        }
        console.table(years);
        return years;
    },

    render: function() {
        var visibleDate = this.state.visibleDate;
        var years = this.filterVisibleYears(this.props.period.start, this.props.period.end);

        console.log("start", this.props.period.start.format('YYYY-MM-DD'));
        console.log("end", this.props.period.end.format('YYYY-MM-DD'));

        var y1 = moment().year(2014).month(10).date(10);
        console.log("y1", y1.format('YYYY-MM-DD'), "used", this.used(y1));
        var y2 = moment().year(2015).month(10).date(10);
        console.log("y2", y2.format('YYYY-MM-DD'), "used", this.used(y2));
        

        years = years.map(function(year, yearName) {
          var months = year.map(function(month) {
              return  <DayPicker
                        label={month}
                        date={moment(visibleDate).year(yearName).month(month)}
                        searched={this.inSearchPeriod}
                        used={this.used}
                        isStart={this.check('checkinDate')}
                        isEnd={this.check('checkoutDate')} />
          }.bind(this));

          return (<div className="year">
                    <span>{yearName}</span>
                    <div className="monthpicker">
                      <div className="monthpicker-container">
                        {months}
                      </div>
                    </div>
                  </div>);
        }.bind(this));

        return (<div className="years">
                  {years}
                </div>);
    }
  });

module.exports = MonthBar;