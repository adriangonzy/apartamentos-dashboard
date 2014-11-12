/** @jsx React.DOM */

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