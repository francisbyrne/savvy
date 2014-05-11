// Global config
Router.configure({
  layoutTemplate: 'body',
  notFoundTemplate: 'not_found',
  loadingTemplate: 'loading'
});

// Clear session vars on new pages
Router.onBeforeAction(function() {
  Session.set('addTransactionActive', false);
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
  // this.route('home', {path: '/'});

  this.route('portfolio', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe('userTransactions');
    },
    data: calculateHoldings
  });

  this.route('stock_detail', {
    path: '/stock/:_id', 
    controller: StockDetailController
  });

  this.route('transactions');
  this.route('import_transactions', {
    path: '/import-transactions'
  });
});
