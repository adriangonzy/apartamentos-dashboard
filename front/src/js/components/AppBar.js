var React = require('react');
var IconButton = require('material-ui').IconButton;
var Paper = require('material-ui').Paper;
var AppActions = require('../actions/AppActions');

var AppBar = React.createClass({

	handleClick: function(event) {
		AppActions.toggleLeftNav();
	},

    render: function () {
        return (
            <Paper className="mui-dark-theme mui-app-bar" zDepth={0} rounded={false}>
            	<IconButton 
            		icon="navigation-menu" 
            		className="mui-app-bar-navigation-icon-button"
            		onClick={this.handleClick}
                    text={"Apartamentos"} />
            </Paper>
        );
    }
});

module.exports = AppBar;