var React = require('react');
var moment = require('moment');
var ApartActions = require('../actions/ApartActions');
var Apart = require('./Apart');

var ApartList = React.createClass({

  getDefaultProps: function() {
    return {
      aparts: {available: [], unavailable: []}, 
      dates: {
          start: moment(), 
          end: moment().add(1, 'year')
      }
    };
  },

  render: function() {
    var aparts = {available: [], unavailable: []},
        available = (this.props.aparts.available || []),
        unavailable = (this.props.aparts.unavailable || []);

    aparts.available = available.map(function(k, apart) {
      return (<Apart
                isAvailable={true}
                dates={this.props.dates}
                apart={apart} />);
    });

    aparts.unavailable = unavailable.map(function(k, apart) {
      return (<Apart
                isAvailable={false}
                dates={this.props.dates}
                apart={apart} />);
    });
    
    return (<div className="aparts">
              {aparts.available.length > 0 ? <h2>Disponibles</h2> : null}
              {aparts.available}
              <br></br>
              <h2>No Disponibles</h2>
              {aparts.unavailable}
            </div>);
  }
});

module.exports = ApartList;