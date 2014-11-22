var _ = require('lodash');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var AppDispatcher = require('../dispatchers/AppDispatcher');
var DatesConstants = require('../constants/DatesConstants');

var _dates = {start: moment(), end: moment().add(6, 'months')};

var DatesStore = _.extend({}, EventEmitter.prototype, {

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

function updateDates(dates) {
  // console.log('update dates');
  // console.log(dates);
  _dates = dates;
}

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case DatesConstants.DATES_UPDATE:
      updateDates(action.dates);
      break;

    default:
      return true;
  }

  // If action was responded to, emit change event
  DatesStore.emitChange();
  return true
});

module.exports = DatesStore;
