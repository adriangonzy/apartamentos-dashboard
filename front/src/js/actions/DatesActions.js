var AppDispatcher = require('../dispatchers/AppDispatcher');
var DatesConstants = require('../constants/DatesConstants');

// Define actions object
var DatesActions = {

  // Receive inital product data
  updateDates: function(dates) {
    // console.log('action receiveAparts', aparts);
    AppDispatcher.handleAction({
      actionType: DatesConstants.DATES_UPDATE,
      dates: dates
    });
  }

};

module.exports = DatesActions;