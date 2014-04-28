// Global config
Router.configure({
  layoutTemplate: 'body',
  notFoundTemplate: 'not_found',
  loadingTemplate: 'loading'
});


// Custom Controllers

StockDetailController = RouteController.extend({
  template: 'stock_detail',
  data: function () {
    return {stockId: this.params._id};
  },
  onBeforeAction: function() {
    Errors.clearSeen();
    // Get the stock details from server, see market_data.js for legend of fields
    Meteor.call('refreshStocks', { symbols: [this.params._id] }, function(error, results) {
      if (error) {
        Errors.throw(error.reason);
      }
    });
  }
});

// Route Maps
Router.map(function() {
  this.route('home', {path: '/'});
  this.route('portfolio');
  this.route('stock_detail', {
    path: '/stock/:_id', 
    controller: StockDetailController
  });
  this.route('transactions');
});