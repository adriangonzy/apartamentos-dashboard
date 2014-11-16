var React = require('react');
var moment = require('moment');
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
        $.each(this.props.weeks, function(k, reservation) {
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
            endYear = end.year()
            years = [],
            partialMonths = [];

        while(startYear < endYear) {
          years[startYear] = wholeYear;
          startYear++;
        }

        // if different years all months until endDate months
        if (start.year() < end.year()) {
          console.log("different years");
          partialMonths = _.grep(wholeYear, function(name, i) {  
              return i <= end.month();
          });
        // if same year then filter specific months
        } else {
          console.log("same year");
          partialMonths = _.grep(wholeYear, function(name, i) {
            return (start.month() <= i && i <= end.month());
          }); 
        }

        years[startYear] = partialMonths;
        console.table(years);

        return years;
    },

    render: function() {
        var visibleDate = this.state.visibleDate;
        var years = this.filterVisibleYears(this.props.period.start, this.props.period.end);

        years = years.map(function(year, i) {
          // finish this
              return  <DayPicker
                        label={month}
                        date={new Date(visibleDate.getFullYear(), DateUtils.month_names.indexOf(month), 1)}
                        searched={this.inSearchPeriod}
                        used={this.isUsed}
                        isStart={this.check('checkinDate')}
                        isEnd={this.check('checkoutDate')} />;
        }.bind(this));

        return (<div className="monthpicker">
                  <div className="monthpicker-container">
                      {months}
                  </div>
                </div>);
    }
  });