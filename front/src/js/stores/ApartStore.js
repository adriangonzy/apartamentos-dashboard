var _ = require('lodash');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;
var AppDispatcher = require('../dispatchers/AppDispatcher');

var ApartConstants = require('../constants/ApartConstants');
var ApartApi = require('../ApartApi');

var DatesConstants = require('../constants/DatesConstants');
var DatesStore = require('./DatesStore');


// Define initial data points
var _aparts = [];

// Extend Cart Store with EventEmitter to add eventing capabilities
var ApartStore = _.extend({}, EventEmitter.prototype, {

  // Return cart items
  getAparts: function() {
    return _aparts;
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
  console.log('store receive aparts');
  console.log(aparts);
  _aparts = aparts;
  filterAparts(DatesStore.getDates());
}

function updateAparts() {
  console.log('store update aparts');
  ApartApi.updateAparts();
}

function updateApart(apartId) {
  console.log('update apart' + apartId);
  ApartApi.updateApart(apartId);
}

function updateApartComplete(updatedApart) {
  console.log('update apart complete');
  console.log(updatedApart);

  updatedApart.available = isAvailable(updatedApart, DatesStore.getDates());
  var i = _.findIndex(_aparts, function(apart) {return apart.id === updatedApart.id});
  _aparts[i] = updatedApart;
}

var intersect = function(s1, e1, s2, e2) {
  var firstPeriodBeforeSecond = e1.isBefore(s2, 'day') && e1.isBefore(e2, 'day'),
      secondPeriodBeforeFirst = e2.isBefore(s1, 'day') && e2.isBefore(e1, 'day');
  return !(firstPeriodBeforeSecond || secondPeriodBeforeFirst);
};

function isAvailable(apart, dates) {
  var available = true;
  _.each(apart.calendar, function(res){
    // add one day to start so first half day is not accounted in intersection
    var resStart = moment(res.startDate).add(1, 'day'),
    // remove one day to end so last half day is not accounted in intersection
        resEnd = moment(res.endDate).subtract(1, 'day');
    available = !intersect(dates.start, dates.end, resStart, resEnd);
    return available;
  });
  return available;
}

function filterAparts(dates) {
  // save dates state
  var start = dates.start,
      end = dates.end;

  console.log('before filter', _aparts);

  // for every apart flag if available
  _.each(_aparts, function(apart) {
    apart.available = isAvailable(apart, dates);
  });


  console.log('filtered');
  console.table(_aparts);
}

function expandApart(apartId) {

}

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
  var action = payload.action;
  var disableEmit = false;
  switch(action.actionType) {
  
    case ApartConstants.RECEIVE_APARTS:
      loadAparts(action.aparts)
      break;

    case ApartConstants.APARTS_FILTER:
      filterAparts(action.dates);
      break;

    case ApartConstants.APARTS_UPDATE:
      updateAparts();
      disableEmit = true;
      break;

    case ApartConstants.APART_UPDATE:
      updateApart(action.apartId);
      disableEmit = true;
      break;

    case ApartConstants.APART_UPDATE_COMPLETE:
      updateApartComplete(action.apart);
      break;

    case ApartConstants.APART_EXPAND:
      expandApart(action.apartId);
      break;

    case DatesConstants.DATES_UPDATE:
      filterAparts(action.dates);
      break;

    default:
      return true;
  }

  if (disableEmit) {
    return true;
  }

  // If action was responded to, emit change event
  ApartStore.emitChange();
  return true;
});

module.exports = ApartStore;