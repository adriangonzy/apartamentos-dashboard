var React = require('react');

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

module.exports = NumberPicker;