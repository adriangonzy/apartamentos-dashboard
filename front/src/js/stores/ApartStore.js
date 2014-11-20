var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var ApartConstants = require('../constants/ApartConstants');
var ApartApi = require('../ApartApi');
var _ = require('lodash');

// Define initial data points
var _aparts = {}, _dates = {};

// Extend Cart Store with EventEmitter to add eventing capabilities
var ApartStore = _.extend({}, EventEmitter.prototype, {

  // Return cart items
  getAparts: function() {
    return _aparts;
  },

  // Return # of items in cart
  getDates: function() {
    return _dates;
  },

  // Emit Change event
  emitChange: function() {
    this.emit('change');
  },

  // Add change listener
  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  // Remove change listener
  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }
});

function loadAparts(aparts) {
  _aparts = aparts;
}

function updateAparts() {
  ApartApi.updateAparts();
}

function updateApart(apartId) {
  ApartApi.updateApart(apartId);
}

function updateApartComplete(apart) {
  
}

function filterAparts(dates) {

}

function expandApart(apartId) {

}

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
  
    case ApartConstants.RECEIVE_APARTS:
      loadAparts(action.aparts)
      break;

    case ApartConstants.APARTS_FILTER:
      filterAparts(action.dates);
      break;

    case ApartConstants.APARTS_UPDATE:
      updateAparts();
      break;

    case ApartConstants.APART_UPDATE:
      updateApart(action.apartId);
      break;

    case ApartConstants.APART_EXPAND:
      expandApart(action.apartId);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  ApartStore.emitChange();
  return true;
});

module.exports = ApartStore;