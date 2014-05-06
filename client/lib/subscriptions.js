Meteor.startup(function() {
  Meteor.subscribe('allStocks');
  Meteor.subscribe('userTransactions');
});