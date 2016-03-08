var React = require('react');
var moment = require('moment');
var _ = require('lodash');
var DayPicker = require('./daypicker.js');

var MonthBar = React.createClass({
    getInitialState: function() {
        return ({visibleDate: this.props.selectedDate});
    },
    getDefaultProps: function() {
        return({
            reservations:{},
            weeks:{},
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
        this.setState({visibleDate: date});
        this.props.onChangeDate(date);
    },

    used: function(date) {
      if (!this.indexedReservations) {
        //console.log('before index', this.props.weeks);
        this.indexedReservations = _.sortBy(this.props.weeks, 'startDate');
        //console.log('indexed', this.indexedReservations);
      }

      var dateStr = date.format('YYYY-MM-DD');

      for (var i = 0; i < this.indexedReservations.length; i++) {
        var res = this.indexedReservations[i];
        if (dateStr < res.startDate) {
          return false;
        }
        if (dateStr < res.endDate) {
          return true;
        }
      }
    },

    check: function(startOrEnd) {
      return function(date) {
        var dateKey = date.format('YYYY-MM-DD');
        var check = false;
        _.each(this.props.weeks, function(reservation) {
          if (reservation[startOrEnd] === dateKey) {
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

        return end.isSame(date, 'day') || (start.isBefore(date) && date.isBefore(end));
    },

    filterVisibleYears: function(start, end) {
        console.time('Filter Apart: [start %s :: end %s]', start, end);
        var count = 0;
        var wholeYear = [];
        while (count < 12) {
          wholeYear.push(moment().month(count++).locale('es').format("MMMM"));
        }

        if (end.isBefore(start))
          return;

        var startYear = start.year(),
            endYear = end.year(),
            years = [];

        if (startYear < endYear) {
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
          years[startYear] = _.filter(wholeYear, function(v, i) {
            return (start.month() <= i && i <= end.month());
          });
        }
        console.timeEnd('Filter Apart: [start %s :: end %s]', start, end);
        return years;
    },

    render: function() {
        var visibleDate = this.state.visibleDate;
        var years = this.filterVisibleYears(this.props.period.start, this.props.period.end),
            months = [];

        if (years) {
          years.map(function(yearMonths, yearName) {
              months = months.concat(<div className="year" key={yearName}><span className="year-label rotate">{yearName}</span></div>);
              months = months.concat(yearMonths.map(function(month) {
              return  <DayPicker
                        key={month + '_' + yearName}
                        label={month}
                        date={moment(visibleDate).year(yearName).month(month)}
                        searched={this.inSearchPeriod}
                        used={this.used}
                        isStart={this.check('startDate')}
                        isEnd={this.check('endDate')} />
              }.bind(this)));
          }.bind(this));
        }

        return(<div className="monthpicker">
                <div className="monthpicker-container">
                  {months}
                </div>
              </div>);
    }
  });

module.exports = MonthBar;
