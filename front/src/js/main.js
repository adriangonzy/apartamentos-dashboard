(function () {

	var React = require('react/addons');
	var Perf = React.addons.Perf;
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

	// Perf.start();
  	//Render the main app component
  	React.render(<App />, document.getElementById('main'));
  	// Perf.stop();

  	// var measurements = Perf.getLastMeasurements();
  	// Perf.printInclusive(measurements);
  	// Perf.printExclusive(measurements)
  	// Perf.printWasted(measurements);
  	// Perf.printDOM(measurements);
})();