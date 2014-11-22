var React = require('react');
var moment = require('moment');
var _ = require('lodash');

var DayPicker = React.createClass({
	getDefaultProps: function() {
		return ({ 
			date: moment(),
      used: function() {return false;},
      selected: function() {return false;},
      searched: function() {return false;},
			isStart: function() {return false;},
			isEnd: function() {return false;},
			selectDate: function(date) {console.log("select", date);}
		});
	},

	render: function () {
		var date = this.props.date.clone(),
        firstDay = date.startOf('month').day(),
        curMonthDays = date.daysInMonth(),
        preMonthDays = date.subtract(1, 'months').daysInMonth(),
        offset = (firstDay === 0 ? 7 : firstDay) - 1;

    var previousMonthDays = _.range(preMonthDays - offset + 1, preMonthDays + 1).map(function(day){
        return <Day
                  key={moment(date).date(day).dayOfYear()}
                  date={moment(date).date(day)} 
                  week={1}
                  selectDate={this.props.selectDate} />
    }.bind(this));

    date = this.props.date.clone();
    var currentMonthDays = _.range(1, curMonthDays + 1).map(function(day) {
        var thisDate = moment(date).date(day);
        return <Day
                  key={thisDate.dayOfYear()}
                  date={thisDate}
                  week={Math.ceil((day+offset) / 7)} 
                  selectDate={this.props.selectDate}
                  selected={this.props.selected(thisDate)}
                  searched={this.props.searched(thisDate)}
                  used={this.props.used(thisDate)}
                  start={this.props.isStart(thisDate)}
                  end={this.props.isEnd(thisDate)} />
    }.bind(this));

    date = this.props.date.clone().add(1, 'months');
    var usedDays = previousMonthDays.length + currentMonthDays.length;
    var nextMonthDays = _.range(1, 42 - usedDays + 1).map(function(day) {
          return <Day
                    key={moment(date).date(day).dayOfYear()}
                    date={moment(date).date(day)} 
                    week={Math.ceil((usedDays + day) / 7)} 
                    selectDate={this.props.selectDate} />
    }.bind(this));

    return (
        <div className="datepicker-dates-container">
            <div className="datepicker-dates-label">{this.props.label}</div>
            <div className="datepicker-dates">
              <div className="out">
                {previousMonthDays}
              </div>
              <div>
                {currentMonthDays}
              </div>
              <div className="out">
                {nextMonthDays}
              </div>
            </div>
        </div>
        );
  }
});

var Day = React.createClass({
  handleClick: function(e) {	
      e.preventDefault();
      this.props.selectDate(this.props.date);
  },
  getDefaultProps: function() {
      return {
        selected: false,
        selectDate: function(date) {
          console.log("daypicker", date);
        }
      };
  },
  getClassName: function() {
      var className = "day week-" + this.props.week + " dayInWeek-" + this.props.date.day();
      // clicked day
      className += (this.props.selected ? ' selected':'');
      // in search period
      className += (this.props.searched ? ' searched':'');
      // reserved
      className += (this.props.used && !this.props.start?' used':'');
      // upper or lower triangle
      className += (this.props.start ?' pm-reserved':'');
      className += (this.props.end ?' am-reserved':'');
      return className;
  },

  shouldComponentUpdate: function(nextProps) {
    return !_.isEqual(this.props, nextProps);
  },

  render: function() {
    return (
        <div className={this.getClassName()}>
            <a href="#" onClick={this.handleClick}>{this.props.date.date()}</a>
        </div>
        );
  }
});

module.exports = DayPicker;