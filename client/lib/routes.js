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

// Check logged in for pages that require user login
Router.onBeforeAction(checkLoggedIn, {only: ['portfolio', 'transactions', 'import_transactions', 'capital-gains']});

function checkLoggedIn() {
  AccountsEntry.signInRequired(this);
}

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

  this.route('sign-in', {
    path: '/sign-in'
  });

  this.route('sign-out', {
    path: '/sign-out'
  });

  this.route('import_transactions', {
    path: '/import-transactions'
  });

  this.route('landing', {
    path: '/landing'
  });

  this.route('portfolio', {
    path: '/',
    waitOn: function() {
      return Meteor.subscribe('userHoldings');
    },
    onBeforeAction: function() {
      refreshHeldStocks(Meteor.userId());
    }
  });

  this.route('stock-detail', {
    path: '/stock/:_id', 
    controller: StockDetailController
  });

  this.route('transactions', {
    waitOn: function() {
      return Meteor.subscribe('userTransactions');
    }
  });

  this.route('capital-gains', {
    path: '/capital-gains',
    template: 'capital_gains',
    waitOn: function() {
      return Meteor.subscribe('userTransactions');
    }
  });
});