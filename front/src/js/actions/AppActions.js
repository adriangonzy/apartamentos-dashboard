var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

// Define actions object
var AppActions = {
  toggleLeftNav: function() {
    AppDispatcher.handleAction({
      actionType: AppConstants.SHOW_LEFT_NAV
    });
  }
};

module.exports = AppActions;