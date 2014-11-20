var React = require('react');
var ApartActions = require('../actions/ApartActions');
var PaperButton = require('material-ui').PaperButton;

var ApartList = React.createClass({

  getInitialState: function() {
    return {loading: false};
  },

  updateAparts: function() {
    // TODO loading button
    ApartActions.updateAparts();
  },

  render: function() {
    var aparts = {available: [], unavailable: []},
        available = this.props.aparts.available,
        unavailable = this.props.aparts.unavailable;

    available.push(<Apart
                      isAvailable={true}
                      period={this.props.dates}
                      apart={apart} />);

    unavailable.push(<Apart
                      isAvailable={false}
                      period={this.props.dates}
                      apart={apart} />);

    return (<div className="aparts">
              <PaperButton 
                  type="RAISED" 
                  label="Primary" 
                  primary={true} 
                  onClick={this.updateAparts} />
              {aparts.available.length > 0 ? <h2>Disponibles</h2> : null}
              {aparts.available}
              <br></br>
              <h2>No Disponibles</h2>
              {aparts.unavailable}
            </div>);
  }
});

module.exports = ApartList;