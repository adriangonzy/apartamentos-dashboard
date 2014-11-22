var AppDispatcher = require('../dispatchers/AppDispatcher');
var ApartConstants = require('../constants/ApartConstants');

// Define actions object
var ApartActions = {

  // Receive inital product data
  receiveAparts: function(aparts) {
    // console.log('action receiveAparts', aparts);
    AppDispatcher.handleAction({
      actionType: ApartConstants.RECEIVE_APARTS,
      aparts: aparts
    });
  },

  // Set currently selected product variation
  filterAparts: function(dates) {
    console.log('action filter', dates);
    AppDispatcher.handleAction({
      actionType: ApartConstants.APARTS_FILTER,
      dates: dates
    });
  },

  // Add item to cart
  updateAparts: function() {
    console.log('action updateAparts');
    AppDispatcher.handleAction({
      actionType: ApartConstants.APARTS_UPDATE
    })
  },

  // Remove item from cart
  updateApart: function(apartId) {
    console.log('action updateApart', apartId);
    AppDispatcher.handleAction({
      actionType: ApartConstants.APART_UPDATE,
      apartId: apartId
    })
  },

  updateApartComplete: function(apart) {
    console.log('action updateApartComplete', apart);
    AppDispatcher.handleAction({
      actionType: ApartConstants.APART_UPDATE_COMPLETE,
      apart: apart 
    })
  },

  // Update cart visibility status
  expandApart: function(apartId) {
    console.log('action expandApart', apartId);
    AppDispatcher.handleAction({
      actionType: ApartConstants.APART_EXPAND,
      apartId: apartId
    })
  }
};

module.exports = ApartActions;