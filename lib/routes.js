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

  this.route('portfolio', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe('userHoldings');
    }
  });

  this.route('stock_detail', {
    path: '/stock/:_id', 
    controller: StockDetailController
  });

  this.route('transactions', {
    waitOn: function() {
      return Meteor.subscribe('userTransactions');
    }
  });

  this.route('import_transactions', {
    path: '/import-transactions'
  });
});

initializePortfolioTable = function() {
  return {
    options: {
      // Move the display options inside the datatables header after it initialises
      fnInitComplete: function() {
        $('#portfolio-table .datatable-header').prepend( $('#portfolio #display-options').detach() );
      }
    },
    // rows: Holdings.find( {'shares': {$ne: 0} } ).fetch(),
    subscription: "holdings",
    selector: "portfolio-table",
    columns: [{
      title: "symbol",
      data: "symbol"
    },{
      title: "price",
      data: "lastTrade",
      mRender: formatCurrency
    },{
      title: "change",
      data: "change",
      mRender: formatCurrencySign
    },{
      title: "shares",
      data: "shares"
    },{
      title: "cost basis",
      data: "costBasis",
      mRender: formatCurrency
    },{
      title: "market value",
      data: "marketValue",
      mRender: formatCurrency
    },{
      title: "day's gain",
      data: "daysGain",
      mRender: formatCurrencySign
    },{
      title: "gain",
      data: "gain",
      mRender: formatCurrencySign
    }],
    query: {'userId': Meteor.userId() }
  };
};