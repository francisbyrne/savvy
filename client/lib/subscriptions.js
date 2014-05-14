Meteor.startup(function() {
  Meteor.subscribe('allStocks');
  Meteor.subscribe('watchTransactions');
  Meteor.subscribe('watchStocks');
});