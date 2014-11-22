var React = require('react');
var LeftNav = require('material-ui').LeftNav;
var ApartActions = require('../actions/ApartActions');

var menuItems = [
	{ type: MenuItem.Types.SUBHEADER, text: 'Menu' },
  	{ route: 'update-aparts', text: 'Actualizar Apartamentos' }
];

var SideMenu = React.createClass({

	onChange: function() {

	},

    render: function () {
        return (
            <LeftNav 
            	docked={this.props.docked} 
            	menuItems={menuItems}
            	onChange={this.onChange} />
        );
    }
});

// <PaperButton 
//      type="RAISED" 
//      label={this.state.loading ? 'actualizando...' : "Actualizar Todos"} 
//      primary={true} 
//      onClick={this.updateAparts} />

module.exports = SideMenu;