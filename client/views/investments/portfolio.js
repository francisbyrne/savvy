Meteor.startup(function() {
  Meteor.subscribe('userHoldings');
});

Template.portfolio.helpers({
  holdingDetails: function() {
    var holdings = Holdings.find({userId: Meteor.userId()}).fetch();
    var ids = holdingsToStockIds(holdings);
    var stocks = _.map(ids, function(id) {
      return Stocks.findOne({id: id});
    });
    return stocks;
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
    Meteor.call('removeHolding', this.id, function(error, result) {
      if (error)
        console.log(error.message);
    });
  }
});