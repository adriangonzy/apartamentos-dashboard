var AppDispatcher = require('../dispatcher/AppDispatcher');
var ApartConstants = require('../constants/ApartConstants');

// Define actions object
var ApartActions = {

  // Receive inital product data
  receiveAparts: function(aparts) {
    AppDispatcher.handleAction({
      actionType: ApartConstants.RECEIVE_APARTS,
      data: aparts
    });
  },

  // Set currently selected product variation
  filterAparts: function(dates) {
    AppDispatcher.handleAction({
      actionType: ApartConstants.APARTS_FILTER,
      data: dates
    });
  },

  // Add item to cart
  updateAparts: function() {
    AppDispatcher.handleAction({
      actionType: ApartConstants.APARTS_UPDATE
    })
  },

  // Remove item from cart
  updateApart: function(apartId) {
    AppDispatcher.handleAction({
      actionType: ApartConstants.APART_UPDATE,
      apartId: apartId
    })
  },

  updateApartComplete: function(apart) {
    AppDispatcher.handleAction({
      actionType: ApartConstants.APART_UPDATE_COMPLETE,
      apart: apart 
    })
  },

  // Update cart visibility status
  expandApart: function(apartId) {
    AppDispatcher.handleAction({
      actionType: ApartConstants.APART_EXPAND,
      apartId: apartId
    })
  }
};

module.exports = ApartActions;