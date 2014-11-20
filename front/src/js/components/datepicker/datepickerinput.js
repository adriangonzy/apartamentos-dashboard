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
    selectDate: function(date) {
        var show = this.state.date.date() === date.date();
        this.setState({date: date, show: show});
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
                      selectDate={this.selectDate}
                      selectedDate={this.state.date}
                      show={this.state.show} />
                </div>
            </div>
        );
    }
});

module.exports = DatePickerInput;
