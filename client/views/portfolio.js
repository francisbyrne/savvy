Meteor.startup(function() {
  Meteor.subscribe('userHoldings');
});

Template.portfolio.helpers({
});