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
			select: function(date) { console.log(date);}
		});
	},
	render: function () {
		var date = this.props.date.clone(),
        firstDay = date.startOf('month').day(),
        curMonthDays = date.daysInMonth(),
        preMonthDays = date.substrat(1, 'months').daysInMonth(),
        offset = firstDay === 0 ? 7 : firstDay;
      
    var previousMonthDays = _.range(preMonthDays - offset, preMonthDays + 1).map(function(day){
        return <Day 
                  date={moment(date).date(day)} 
                  week={1} 
                  select={this.props.selectDate} />
    }.bind(this));

    date = this.props.moment.clone();
    var currentMonthDays = _.range(1, curMonthDays).map(function(day) {
        var thisDate = moment(date).date(day);
        return <Day 
                  date={thisDate}
                  week={Math.ceil((day+offset) / 7)} 
                  select={this.props.select}
                  selected={this.props.selected(thisDate)}
                  searched={this.props.searched(thisDate)}
                  used={this.props.used(thisDate)}
                  start={this.props.isStart(thisDate)}
                  end={this.props.isEnd(thisDate)} />
    }).bind(this));

    date = this.props.moment.clone().add(1, 'months');
    var usedDays = previousMonthDays.length + currentMonthDays.length;
    var nextMonthDays = _.range(1, 42 - usedDays).map(function(day) {
          return <Day 
                    date={moment(date).date(day)} 
                    week={Math.ceil((usedDays + day) / 7)} 
                    select={this.props.selectDate} />
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
      this.props.select(this.props.date);
  },
  getDefaultProps: function() {
      return {selected:false};
  },
  getClassName: function() {
  	var className="day week-" + this.props.week + " dayInWeek-" + this.props.date.day();
    // clicked day
    className += (this.props.selected ? ' selected':'');
    // in search period
    className += (this.props.searched ? ' searched':'');
    // reserved
    className += (this.props.used && !this.props.start?' used':'');
    // upper or lower triangle
    className += (this.props.start ?' pm-reserved':'');
    className += (this.props.end ?' am-reserved':'');
	
  },
  render: function() {
    return (
        <div className={getClassName()}>
            <a href="#" onClick={this.handleClick}>{this.props.date}</a>
        </div>
        );
  }
});

module.exports = DayPicker;