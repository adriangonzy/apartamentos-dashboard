var React = require('react');
var moment = require('moment');
var DatePicker = require('./datepicker.js');

var DatePickerInput = React.createClass({
    getDefaultProps: function() {
        return {
            date: moment(),
            onChangeDate: function(date){console.log("DatePickerInput", date)}
        };
    },
    getInitialState: function() {
        return {show: false, date: this.props.date};
    },
    showDatePicker: function() {
        this.setState({show: true});
    },
    hideDatePicker: function() {
        this.setState({show: false});
    },
    selecMonth: function(month) {
        var newDate = this.state.date.month(month - 1);
        this.setState({date: newDate, show: true});
        this.props.onChangeDate(newDate);
    },
    selecYear: function(year) {
        var newDate = this.state.date.year(year);
        this.setState({date: newDate, show: true});
        this.props.onChangeDate(newDate);
    },
    selectDate: function(date) {
        this.setState({date: date, show: false});
        this.props.onChangeDate(date);
    },
    render: function() {
        var style = {
                position:'fixed', 
                top:0, 
                left:0, 
                width:'100%', 
                height:'100%', 
                display:(this.state.show ? 'block' : 'none')
        };
        return (
            <div>
                <input 
                    type="text" 
                    className="form-control" 
                    onFocus={this.showDatePicker} 
                    value={this.state.date.format('DD/MM/YYYY')} 
                    onChange={function(){}}/>
                <div style={style} onClick={this.hideDatePicker}></div>
                <div className="datepicker-wrapper">
                    <DatePicker 
                      changeMonth={this.selecMonth}
                      changeYear={this.selecYear}
                      selectDate={this.selectDate}
                      selectedDate={this.state.date}
                      show={this.state.show} />
                </div>
            </div>
        );
    }
});

module.exports = DatePickerInput;
