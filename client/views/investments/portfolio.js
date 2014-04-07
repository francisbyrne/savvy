Meteor.startup(function() {
  Meteor.subscribe('userHoldings');
});

Template.portfolio.helpers({
  holdingDetails: function() {
    var holdings = Holdings.find({userId: Meteor.userId()}).fetch();
    var stockHoldings = _.map(holdings, function(holding) {
      // extend the stock document to include the holding id
      return _.extend( {holdingId: holding._id}, Stocks.findOne({id: holding.stockId}) );
    });
    return stockHoldings;
  }
});

Template.portfolio.events({
  'submit form#add-holding': function(event, template) {
    event.preventDefault();
    var stockId = $('#symbol').val();
    Meteor.call('addHolding', stockId, function(error, result) {
      if (error)
        console.log(error.message);
    });
  },
  'click .remove-holding': function(event, template) {
    Meteor.call('removeHolding', this.holdingId, function(error, result) {
      if (error)
        console.log(error.message);
    });
  }
});