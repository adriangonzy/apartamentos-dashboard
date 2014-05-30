/** @jsx React.DOM */

  var DateUtils = {
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
          this.props.onChangeNumber(e.target.getAttribute('data-number'));
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
          date.setMonth(month-1);
          this.setState({visibleDate:date});
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
                        number={visibleDate.getMonth()+1}  
                        value={visibleDate.getMonth() + 1} 
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

var MonthPicker = React.createClass({
    /**
     *
     * @returns {{selectedDate: Date, show: boolean, onChangeDate: onChangeDate}}
     */
    getDefaultProps: function() {
        return({reservations:{}, selectedDate:new Date(), isUsed: function() {return false;}, onChangeDate: function(date) {
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

   isUsed: function(date) {
        var month = date.getMonth() + 1;
        var day = date.getDate();
        month = (month < 10 ? '0' : '') + month;
        day = (day < 10 ? '0' : '') + day;
        var dateKey = date.getFullYear() + "-" + month + "-" + day;
        return this.props.reservations[dateKey] != undefined;
    },

    dateForMonth: function(date, month) {
      var newDate = new Date();
      newDate.setTime(date.getTime());
      newDate.setMonth(month);
      return newDate;
    },

    componentDidUpdate: function() {
      console.log(this.props.reservations);
    },

    render: function() {
        var month_names = ["enero", "febrero", "marzo", "abril"," mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        var visibleDate = this.state.visibleDate;

        var months = month_names.map(function(month, i){
              return  <DayPicker
                        date={new Date(visibleDate.getFullYear(), i, 1)}
                        isUsed={this.isUsed}
                        selectedDate={visibleDate}
                        selectDate={this.onChangeSelectedDate}
                        label={month}/>;
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
        return ({selectedDate:new Date(), isUsed: function() {return false;}, selectDate: function(date) {
          console.log(date);
        }});
      },
      selectDay: function(date) {
          this.props.selectDate(date);
      },
      isUsed : function(date) {
          return this.props.isUsed(date);
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
                  selected = false;

              if(date.getMonth()==this.props.selectedDate.getMonth() && date.getFullYear()==this.props.selectedDate.getFullYear()) {
                  selected = (day==this.props.selectedDate.getDate());
              }
              return <Day selected={selected} date={thisDate} week={weekNumber} changeDate={this.selectDay} used={this.isUsed(thisDate)} />
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
          return({date:new Date()});
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
      },
      render: function() {
          var style={position:'fixed', top:0,left:0, width:'100%', height:'100%', display:(this.state.show?'block':'none')};

          return (
              <div>
                  <input type="text" onFocus={this.showDatePicker} value={this.props.date} />
                  <div style={style} onClick={this.hideDatePicker}></div>
                  <div className="datepicker-wrapper">
                      <DatePicker selectedDate={this.props.date} show={this.state.show} onChangeDate={this.onChangeDate}  />
                  </div>
              </div>
              );
      }
  });


  var Day = React.createClass(/** @lends {React.ReactComponent.prototype} */{
      /**
       *
       * @param e
       */
      handleClick: function(e) {
          e.preventDefault();
          this.props.changeDate(this.props.date);
      },
      /**
       *
       * @returns {{selected: boolean}}
       */
      getDefaultProps: function() {
          return {selected:false};
      },
      render: function() {
          var className="day week-"+this.props.week+" dayInWeek-"+this.props.date.getDay();
          className += (this.props.selected?' selected':'');
          className += (this.props.used?' used':'');
          return (
              <div className={className}>
                  <a href="#" onClick={this.handleClick}>{this.props.date.getDate()}</a>
              </div>
              );
      }
  });