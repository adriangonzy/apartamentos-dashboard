var React = require('react');
var moment = require('moment');
var DatePicker = require('./datepicker.js');

var DatePickerInput = React.createClass({
    getDefaultProps: function() {
        return {
            date: moment(),
            onChangeDate: function(date){console.log(date)}
        };
    },
    getInitialState: function() {
        return {show: false};
    },
    showDatePicker: function() {
        this.setState({show: true});
    },
    hideDatePicker: function() {
        this.setState({show: false});
    },
    onChangeDate: function(date) {
        this.setState({show: false});
        this.props.onChangeDate(date);
    },

    render: function() {
        var style = {position:'fixed', top:0, left:0, width:'100%', height:'100%', display:(this.state.show?'block':'none')};

        return (
            <div>
                <input className="form-control" type="text" onFocus={this.showDatePicker} value={this.props.date.format('YYYY MM DD')} />
                <div style={style} onClick={this.hideDatePicker}></div>
                <div className="datepicker-wrapper">
                    <DatePicker 
                      selectedDate={this.props.date}
                      show={this.state.show} 
                      onChangeDate={this.onChangeDate}  />
                </div>
            </div>
        );
    }
});

module.exports = DatePickerInput;
