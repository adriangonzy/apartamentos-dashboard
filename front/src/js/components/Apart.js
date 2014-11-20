var React = require('react');

var Apart = React.createClass({

  getInitialState: function() {
    return {loading: false, deleting: false};
  },

  onDelete: function() {
    this.props.onDelete(this.props.apart.id);
    this.setState({deleting: true});
  },

  onUpdate: function() {
    this.props.onUpdate(this.props.apart.id);
    this.setState({loading: true});
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({loading: false, deleting: false});
  },

  render: function() {
    var apart = this.props.apart,
        image = apart.data.property ? apart.data.property.imageUrls[0] : "",
        apartClassName = "apart" + (this.props.isAvailable ? "" : " unavailable"),
        weeks = apart.data.availabilityCalendar ? apart.data.availabilityCalendar.reservations : {};
    return (<div className={apartClassName}>
              <img className="apart-img" src={image} />
              <div className="apart-info">
                <p>{apart.description}</p>
                <a href={Homelidays_URL + apart.id} target={"_blank"}>
                  <p className="apart-id" >Referencia: {apart.id}</p>
                </a>
                <p>
                <button 
                  type="button" 
                  onClick={this.onUpdate} 
                  className="btn btn-info" 
                  disabled={this.state.loading ? "disabled":""}>
                  {this.state.loading ? "actualizando...":"actualizar"}
                </button>
                <button 
                  type="button" 
                  onClick={this.onDelete} 
                  className="btn btn-danger"
                  disabled={this.state.deleting ? "disabled":""}>
                  {this.state.deleting ? "suprimiendo...":"suprimir"}
                </button>
                </p>
              </div>
              <MonthBar
                period={this.props.period}
                reservations={apart.reserved}
                weeks={weeks} />
            </div>);
  }
});

module.exports = Apart;