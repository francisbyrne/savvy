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


  /**** Accounts/Login *****/

  this.route('sign-in', {
    path: '/sign-in'
  });

  this.route('sign-out', {
    path: '/sign-out'
  });

  this.route('sign-up', {
    path: '/sign-up'
  });


  /******** Pages *********/

  this.route('home', {
    path: '/',
    onBeforeAction: function() {
      if (Meteor.user()) {
        Router.go('dashboard');
      } else {
        Router.go('landing');
      }
    }
  });

  this.route('landing', {
    path: '/landing',
    layoutTemplate: 'landing-layout'
  });

  this.route('dashboard', {
    path: '/dashboard',
    waitOn: function() {
      return Meteor.subscribe('userHoldings');
    }
  });

  this.route('stock-detail', {
    path: '/stock/:_id', 
    controller: StockDetailController
  });

  this.route('portfolio', {
    path: '/portfolio',
    waitOn: function() {
      return Meteor.subscribe('userHoldings');
    },
    onBeforeAction: function() {
      refreshHeldStocks(Meteor.userId());
    }
  });

  this.route('transactions', {
    waitOn: function() {
      return Meteor.subscribe('userTransactions');
    }
  });

  this.route('import_transactions', {
    path: '/import-transactions'
  });

  this.route('capital-gains', {
    path: '/capital-gains',
    template: 'capital_gains',
    waitOn: function() {
      return Meteor.subscribe('userTransactions');
    }
  });
});

// Clear session vars on new pages
Router.onBeforeAction(function() {
  Session.set('addTransactionActive', false);
});

// Pages that don't require login (easier than checking those that do)
Router.onBeforeAction(checkLoggedIn, {except: [
  'landing', 
  'entrySignIn', 
  'entrySignUp', 
  'entryForgotPassword', 
  'entryResetPassword', 
  'stock-detail'
  ]});

function checkLoggedIn() {
  AccountsEntry.signInRequired(this);
}