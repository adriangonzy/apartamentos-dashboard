/** @jsx React.DOM */

  var DateUtils = {

    month_names : ["enero", "febrero", "marzo", "abril"," mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],

    compareDates: function(date1, date2) {
      return date1.setHours(0,0,0,0).getTime() == date2.setHours(0,0,0,0).getTime();
    },

    /**
     * Gets count of days in current month.
     * @param {number} month January has number 1. February 2, ... and so on
     * @param {number} year
     * @returns {number}
     */
    daysInMonthCount: function(month, year) {
        var d = new Date(year, month + 1, 0);
        return d.getDate();
    },
    /**
     * Gets array of numbers starting from start to end
     * @param {number} start
     * @param {number} end
     * @returns {Array} array of numbers
     */
    getArrayByBoundary: function(start, end) {
        var out = [];
        for(var i= start; i<=end; i++) {
            out.push(i);
        }
        return out;
    },
    /**
     * Creates new Date() instance.
     * @param {number} date day in month
     * @param {number} time
     * @returns {Date}
     */
    createNewDay:  function(date, time) {
        var newDate = new Date();
        newDate.setTime(time);
        newDate.setDate(date);
        return newDate;
    },
    /**
     * Creates new Date() instance.
     * @param {number} date day in month
     * @param {number} month
     * @param {number} time
     * @returns {Date}
     */
    createNewDayMonth: function(date, month, time) {
        var newDate = new Date();
        newDate.setTime(time);
        newDate.setMonth(month);
        newDate.setDate(date);
        return newDate;
    }
  }

  var NumberPicker = React.createClass({
      getDefaultProps: function() {
          return {number:0, value:''};
      },
      changeNumber: function(e) {
          var l = e.target.getAttribute('data-number');
          this.log("data-number   ", l);
          this.props.onChangeNumber(l);
      },

      log: function(msg, l) {
          console.log(msg + " " + l);
          console.log(this.props.value);
          return l;
      },

      render: function() {
          return (
              <div className={"numberpicker"}>
                  <a onClick={this.changeNumber} data-number={this.props.number-1} className={"btn btn-default"}>&lt;</a>
                  <span className="btn">{this.props.value}</span>
                  <a onClick={this.changeNumber} data-number={this.props.number+1} className={"btn btn-default"}>&gt;</a>
              </div>
              );
      }
  });

  var DatePicker = React.createClass({
      /**
       *
       * @param {Date} date
       */
      onChangeVisibleDate: function(date) {
          this.setState({visibleDate:date});
      },
      /**
       *
       * @param {Date} date
       */
      onChangeSelectedDate: function(date) {
          this.setState({visibleDate:date});
          this.props.onChangeDate(date);
      },
      /**
       *
       * @returns {{selectedDate: Date, show: boolean, onChangeDate: onChangeDate}}
       */
      getDefaultProps: function() {
          return({reservations:{}, selectedDate:new Date(), show:true, onChangeDate: function(date) {
            console.log(date);
          }});
      },
      /**
       *
       * @returns {{visibleDate: Date}}
       */
      getInitialState: function() {
          var date = new Date();
          date.setTime(this.props.selectedDate.getTime());
          return({visibleDate:date});
      },
      /**
       *
       * @param {number} year
       */
      changeYear: function(year) {
          var date = new Date();
          date.setTime(this.state.visibleDate.getTime());
          date.setFullYear(year);
          this.setState({visibleDate:date});
      },
      /**
       *
       * @param {number} month
       */
      changeMonth: function(month) {
          var date = new Date();
          date.setTime(this.state.visibleDate.getTime());

          console.log("BEFORE MONTH: " + month);
          month = month - 1;
          console.log("AFTER MONTH: " + month);
          date.setMonth(month);
          
          console.log("month " + month);
          console.log("date " + date);

          console.log("getMonth " + (date.getMonth()));
          this.setState({visibleDate:date});
      },

      correctMonth: function(date) {
          console.log("date " + date);
          return date;
      },

      render: function () {
          var style = {display:(this.props.show?'block':'none')};
          var visibleDate = this.state.visibleDate;
          
          return (
              <div className="datepicker" style={style}>
                  <div className="datepicker-container">
                      <NumberPicker 
                        number={visibleDate.getFullYear()} 
                        value={visibleDate.getFullYear()} 
                        onChangeNumber={this.changeYear} />
                      <NumberPicker 
                        number={this.correctMonth(visibleDate).getMonth() + 1}
                        value={this.correctMonth(visibleDate).getMonth() + 1}
                        onChangeNumber={this.changeMonth} />
                      <DayPicker 
                        date={visibleDate}
                        selectedDate={visibleDate}
                        changeDate={this.onChangeVisibleDate} 
                        selectDate={this.onChangeSelectedDate} />
                  </div>
              </div>
              );
      }
  });

var MonthBar = React.createClass({
    /**
     *
     * @returns {{selectedDate: Date, show: boolean, onChangeDate: onChangeDate}}
     */
    getDefaultProps: function() {

        var endDate = new Date();
        var newYear = endDate.getFullYear() + 1;
        endDate.setFullYear(newYear);
        return({reservations:{}, period: {start: new Date(), end: endDate}, selectedDate: new Date(), onChangeDate: function(date) {
          console.log(date);
        }});
    },

    /**
     *
     * @returns {{visibleDate: Date}}
     */
    getInitialState: function() {
        var date = new Date();
        date.setTime(this.props.selectedDate.getTime());
        return ({visibleDate:date});
    },

    onChangeSelectedDate: function(date) {
        this.setState({visibleDate:date});
        this.props.onChangeDate(date);
    },

    getDateKey: function(date) {
      var month = date.getMonth() + 1;
      var day = date.getDate();
      month = (month < 10 ? '0' : '') + month;
      day = (day < 10 ? '0' : '') + day;
      var dateKey = date.getFullYear() + "-" + month + "-" + day;
      return dateKey;
    },

    isUsed: function(date) {
      return this.props.reservations[this.getDateKey(date)] != undefined;
    },

    isReservationStart: function(date) {
      var dateKey = this.getDateKey(date);
      var isStart = false;
      $.each(this.props.weeks, function(k, reservation) {
        if (reservation.checkinDate === dateKey) {
          isStart = true;
          return false;
        }
      });
      return isStart;
    },

    isReservationEnd: function(date) {
      var dateKey = this.getDateKey(date);
      var isEnd = false;
      $.each(this.props.weeks, function(k, reservation) {
        if (reservation.checkoutDate === dateKey) {
          isEnd = true;
          return false;
        }
      });
      return isEnd;
    },

    filterVisibleMonths: function(startDate, endDate) {
        if (endDate < startDate) 
          return DateUtils.month_names;

        var years = endDate.getFullYear() - startDate.getFullYear();
        var months = [];
        var partialMonths;

        console.log("years " + years);
        // add whole years
        while(years >= 1) {
          months = months.concat(DateUtils.month_names);
          years--;
        }

        // if different years all months until endDate months
        if (startDate.getFullYear() < endDate.getFullYear()) {
          console.log("different years");
          partialMonths = $.grep(DateUtils.month_names, function(name, i) {  
              return i <= endDate.getMonth();
          });
        // if same year then filter specific months
        } else {
          console.log("same year");
          partialMonths = $.grep(DateUtils.month_names, function(name, i) {
            return (startDate.getMonth() <= i && i <= endDate.getMonth());
          }); 
        }

        console.table(partialMonths);
        months = months.concat(partialMonths);

        console.table(months);
        return months
    },

    inSearchPeriod: function(date) {
        var start = new Date(this.props.period.start.getTime()), 
            end = new Date(this.props.period.end.getTime());
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        date.setHours(0,0,0,0);
        return start <= date && end >= date;
    },

    render: function() {
        var visibleDate = this.state.visibleDate;
        var months = this.filterVisibleMonths(this.props.period.start, this.props.period.end);

        months = months.map(function(month, i) {
              return  <DayPicker
                        label={month}
                        date={new Date(visibleDate.getFullYear(), DateUtils.month_names.indexOf(month), 1)}
                        inSearch={this.inSearchPeriod}
                        isUsed={this.isUsed}
                        isStart={this.isReservationStart}
                        isEnd={this.isReservationEnd} />;
        }.bind(this));

        return (<div className="monthpicker">
                  <div className="monthpicker-container">
                      {months}
                  </div>
                </div>);
    }
  });

  var DayPicker = React.createClass({
      /**
       *
       * @param {Date} date
       */
      getDefaultProps: function() {
        return ({ selectedDate:new Date(), 
                  isUsed: function() {return false;}, 
                  isStart: function() {return false;},
                  isEnd: function() {return false;},
                  inSearch: function() {return false;},
                  isSelected: function() {return false;},
                  selectDate: function(date) { console.log(date);}});
      },
      selectDay: function(date) {
          this.props.selectDate(date);
      },
      render: function (){
          var date=this.props.date,
              beforeDaysCount = DateUtils.daysInMonthCount((date.getMonth() - 1), date.getFullYear()),
              firstDay = DateUtils.createNewDay(1, date.getTime()),
              offset = (firstDay.getDay() === 0 ? 7 : firstDay.getDay()) - 1,
              daysArray = DateUtils.getArrayByBoundary(beforeDaysCount - offset + 1, beforeDaysCount);

          var previousMonthDays = daysArray.map(function(day){
              var thisDate = DateUtils.createNewDayMonth(day, date.getMonth()-1, date.getTime());
              return <Day date={thisDate} week={1} changeDate={this.selectDay} />
          }.bind(this));

          daysArray = DateUtils.getArrayByBoundary(1, DateUtils.daysInMonthCount(date.getMonth(), date.getFullYear()));
          var actualMonthDays = daysArray.map(function(day) {
              
              var thisDate = DateUtils.createNewDay(day, date.getTime()),
                  weekNumber = Math.ceil((day+offset) / 7),
                  selected = this.props.isSelected(thisDate, date);

              return <Day 
                        date={thisDate} 
                        week={weekNumber} 
                        changeDate={this.selectDay} 
                        selected={selected}
                        inSearch={this.props.inSearch(thisDate)}
                        used={this.props.isUsed(thisDate)}
                        start={this.props.isStart(thisDate)}
                        end={this.props.isEnd(thisDate)} />
          }.bind(this));

          daysArray = DateUtils.getArrayByBoundary(1, 42 - previousMonthDays.length - actualMonthDays.length);
          var nextMonthDays = daysArray.map(function(day){
              var thisDate = DateUtils.createNewDayMonth(day, date.getMonth()+1, date.getTime()),
                  weekNumber = Math.ceil((previousMonthDays.length + actualMonthDays.length + day) / 7);
              return <Day date={thisDate} week={weekNumber} changeDate={this.selectDay} />
          }.bind(this));

          return (
              <div className="datepicker-dates-container">
                  <div className="datepicker-dates-label">{this.props.label}</div>
                  <div className="datepicker-dates">
                    <div className="out">
                    {previousMonthDays}
                    </div>
                    <div>
                    {actualMonthDays}
                    </div>
                    <div className="out">
                    {nextMonthDays}
                    </div>
                  </div>
              </div>
              );
      }
  });

  var DatePickerInput = React.createClass({
      /**
       *
       * @returns {{date: Date}}
       */
      getDefaultProps: function() {
          return({date:new Date(), onChangeDate: function(date){console.log(date)}});
      },
      /**
       *
       * @returns {{show: boolean}}
       */
      getInitialState: function() {
          return {show:false};
      },
      showDatePicker: function() {
          this.setState({show:true});
      },
      hideDatePicker: function() {
          this.setState({show:false});
      },
      /**
       *
       * @param {Date} date
       */
      onChangeDate: function(date) {
          this.props.date = date;
          this.setState({show:false});
          this.props.onChangeDate(date);
      },

      isSelected: function(date1, date2) {
        return DateUtils.compareDates(date1, date2);
      },

      render: function() {
          var style={position:'fixed', top:0,left:0, width:'100%', height:'100%', display:(this.state.show?'block':'none')};

          return (
              <div>
                  <input className="form-control" type="text" onFocus={this.showDatePicker} value={this.props.date.toLocaleDateString()} />
                  <div style={style} onClick={this.hideDatePicker}></div>
                  <div className="datepicker-wrapper">
                      <DatePicker isSelected={this.isSelected} selectedDate={this.props.date} show={this.state.show} onChangeDate={this.onChangeDate}  />
                  </div>
              </div>
              );
      }
  });

  var Day = React.createClass({
      /**
       * @param e
       */
      handleClick: function(e) {
          e.preventDefault();
          this.props.changeDate(this.props.date);
      },
      /**
       * @returns {{selected: boolean}}
       */
      getDefaultProps: function() {
          return {selected:false};
      },
      render: function() {
          var className="day week-"+this.props.week+" dayInWeek-"+this.props.date.getDay();

          className += (this.props.selected?' selected':'');
          // only needed for start date
          className += (this.props.used && !this.props.start?' used':'');
          className += (this.props.start ?' pm-reserved':'');
          className += (this.props.end ?' am-reserved':'');
          className += (this.props.inSearch ?' searched':'');

          return (
              <div className={className}>
                  <a href="#" onClick={this.handleClick}>{this.props.date.getDate()}</a>
              </div>
              );
      }
  });