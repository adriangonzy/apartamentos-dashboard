var React = require('react');
var ApartActions = require('../actions/ApartActions');
var HOMELIDAYS_URL = require('../constants/ApartConstants').HOMELIDAYS_URL;
var PaperButton = require('material-ui').PaperButton;
var MonthBar = require('./datepicker/MonthBar');

var Apart = React.createClass({

  getInitialState: function() {
    return {loading: false};
  },

  onUpdate: function() {
    ApartActions.updateApart(this.props.apart.id);
    this.setState({loading: true});
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({loading: false});
  },

  render: function() {
    var apart = this.props.apart,
        apartClassName = "apart" + (this.props.isAvailable ? "" : " unavailable");

    return (<div className={apartClassName}>
              <img className="apart-img" src={image} />
              <div className="apart-info">
                <p>{apart.description}</p>
                <a href={HOMELIDAYS_URL + apart.image_urls[0]} target={"_blank"}>
                  <p className="apart-id" >Referencia: {apart.id}</p>
                </a>
                <PaperButton 
                  type={"RAISED"} 
                  onClick={this.onUpdate} 
                  label={this.state.loading ? 'actualizando...' : 'Actualizar'}
                  disabled={this.state.loading}
                  primary={true} />
              </div>
              <MonthBar
                period={this.props.dates}
                reservations={apart.reserved}
                weeks={apart.calendar} />
            </div>);
  }
});

module.exports = Apart;