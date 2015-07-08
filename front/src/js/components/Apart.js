var React = require('react');
var _ = require('lodash');
var ApartActions = require('../actions/ApartActions');
var PaperButton = require('material-ui').PaperButton;
var Paper = require('material-ui').Paper;
var Icon = require('material-ui').Icon;
var MonthBar = require('./datepicker/MonthBar');
var HOMELIDAYS_URL = 'http://www.homelidays.com/hebergement/p';

var Apart = React.createClass({

  getDefaultProps: function() {
    return {
      apart: {
        reserved: {},
        image_urls: [],
        calendar: {}
      }
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    var apartUpToDate = _.isEqual(this.props.apart, nextProps.apart);
    var datesUpToDate = _.isEqual(this.props.dates, nextProps.dates);
    return !apartUpToDate || !datesUpToDate;
  },

  onUpdate: function() {
    ApartActions.updateApart(this.props.apart.id);
  },

  render: function() {
    var apart = this.props.apart,
        apartClassName = "apart" + (this.props.isAvailable ? "" : " unavailable"),
        image = apart.image_urls ? apart.image_urls[0] : '';

    return (<Paper zDepth={1} rounded={false} className={apartClassName}> 
              <img className="apart-img" src={image} />
              <div className="apart-info">
                <p className="apart-description">{apart.description}</p>
                <a className="apart-link" href={HOMELIDAYS_URL + apart.id} target={"_blank"}>
                  <p className="apart-id" >
                    <Icon icon="content-link" className="link-icon" />
                    <span className="link-label">Referencia: {apart.id}</span>
                  </p>
                </a>
                <PaperButton 
                  type={'RAISED'}
                  onClick={this.onUpdate} 
                  label={'Actualizar'}
                  primary={true} />
              </div>
              <MonthBar
                period={this.props.dates}
                reservations={apart.reserved}
                weeks={apart.calendar} />
            </ Paper>);
  }
});

module.exports = Apart;