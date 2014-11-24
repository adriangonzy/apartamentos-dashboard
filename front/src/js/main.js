(function () {

	var React = require('react');
	var injectTapEventPlugin = require("react-tap-event-plugin")
	var App = require('./components/App');
	var ApartApi = require('./ApartApi');

	//Needed for React Developer Tools
  	window.React = React;

	//Needed for onTouchTap
	//Can go away when react 1.0 release
	//Check this repo:
	//https://github.com/zilverline/react-tap-event-plugin
	injectTapEventPlugin();

	// load aparts
	ApartApi.getAparts();

  	//Render the main app component
  	React.render(<App />, document.getElementById('main'));
})();