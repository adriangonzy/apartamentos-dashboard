var React = require('react');
var moment = require('moment');
var _ = require('lodash');
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
    var aparts = _.groupBy(this.props.aparts, function(apart) {
      return apart.available ? 'available' : 'unavailable';
    });

    aparts.available = aparts.available || [];
    aparts.unavailable = aparts.unavailable || [];
    
    aparts.available = aparts.available.map(function(apart) {
      return (<Apart
                key={apart.id}
                isAvailable={true}
                dates={this.props.dates}
                apart={apart} />);
    }.bind(this));
  
    aparts.unavailable = aparts.unavailable.map(function(apart) {
      return (<Apart
                key={apart.id}
                isAvailable={false}
                dates={this.props.dates}
                apart={apart} />);
    }.bind(this));
    
    
    return (<div className="aparts">
              {aparts.available.length > 0 ? <h1 className={'sublist-header'}>Disponibles</h1> : null}
              {aparts.available}
              <br></br>
              <h1 className={'sublist-header'}>No Disponibles</h1>
              {aparts.unavailable}
            </div>);
  }
});

module.exports = ApartList;