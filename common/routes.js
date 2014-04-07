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
    // get the stock details from server, see market_data.js for legend of fields
    Meteor.call('refreshStockDetails', { symbols: [this.params._id], fields: ['s', 'n', 'l1', 'c1', 'm', 'k', 'v', 'a2', 'j1', 'r', 'y', 'e', 'e1'] });
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
});
