var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var AppDispatcher = require('../dispatchers/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var _showLeftNav = false;

var AppStore = _.extend({}, EventEmitter.prototype, {

  getLeftNavShow: function() {
    return _showLeftNav;
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

function toggleLeftNav() {
	_showLeftNav = !_showLeftNav;
}

// Register callback with AppDispatcher
AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.actionType) {
    case AppConstants.SHOW_LEFT_NAV:
      toggleLeftNav()
      break;
    default:
      return true;
  }
  // If action was responded to, emit change event
  AppStore.emitChange();
  return true
});

module.exports = AppStore;

