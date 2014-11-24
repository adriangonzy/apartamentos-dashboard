var React = require('react');
var LeftNav = require('material-ui').LeftNav;
var MenuItem = require('material-ui').MenuItem;
var ApartActions = require('../actions/ApartActions');
var AppStore = require('../stores/AppStore');

var menuItems = [
	{ type: MenuItem.Types.SUBHEADER, text: 'Menu' },
  	{ route: 'update-aparts', text: 'Actualizar Apartamentos' }
];

function getLeftNavState() {
  return { show: AppStore.getLeftNavShow() };
}

var SideMenu = React.createClass({
    // Get initial state from stores
    getInitialState: function() {
    return getLeftNavState();
    },
    _onChange: function() {
        this.refs.LeftNav.toggle();
    },
    // Add change listeners to stores
    componentDidMount: function() {
        AppStore.addChangeListener(this._onChange);
    },
    // Remove change listers from stores
    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },

	onChange: function(e, selectedIndex, menuItem) {
        //if (menuItem == 'update-aparts')
        ApartActions.updateAparts();
	},

    render: function () {
        return (
            <LeftNav
                ref="LeftNav"
                docked={false}
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