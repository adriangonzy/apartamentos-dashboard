var React = require('react');
var Aparts = require('./Aparts');
var MenuItem = require('material-ui').MenuItem;
var AppBar = require('material-ui').AppBar;
var IconButton = require('material-ui').IconButton;
var AppCanvas = require('material-ui').AppCanvas;
var LeftNav = require('material-ui').LeftNav;
var DatesFilter = require('./DatesFilter');
var ApartActions = require('../actions/ApartActions');

var menuItems = [
	{ type: MenuItem.Types.SUBHEADER, text: 'Menu' },
  	{ route: 'update-aparts', text: 'Actualizar Apartamentos' }
];

var App = React.createClass({
	handleClick: function() {
		this.refs.leftNav.toggle();
	},

	handleChange: function(e, selectedIndex, menuItem) {
		ApartActions.updateAparts();
	},

	render: function() {
	return (
	  <AppCanvas>
	    <AppBar
	      className="mui-dark-theme"
	      onMenuIconButtonTouchTap={this._onMenuIconButtonTouchTap}
	      zDepth={0}>
	      <IconButton 
            		icon="navigation-menu" 
            		className="mui-app-bar-navigation-icon-button"
            		onClick={this.handleClick}
                    text={"Apartamentos"} />
	     </AppBar>
	    <LeftNav
	    	docked={false}
	    	menuItems={menuItems}
	    	onChange={this.handleChange}
	    	ref="leftNav" />
	    <div className="container">
		    <DatesFilter />
			<Aparts />
		</div>
	  </AppCanvas>
	);
	}
 });

module.exports = App;