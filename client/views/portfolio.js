Template.portfolio.rendered = function() {
  Session.set('zeroShares', 0);
};

Template.portfolio.helpers({
  showClosed: function() {
    return typeof Session.get('zeroShares') == 'undefined' ;
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  displayAmount: function() {
    return ! Session.get('displayPercent');
  },
  table: initializePortfolioTable()
});

Template.portfolio.events({
  'click #show-closed': function(event, template) {
    if ( Session.get('zeroShares') === 0 ) {
      Session.set('zeroShares', undefined);
    } else {
      Session.set('zeroShares', 0);
    }
  },
  'click #display-percent': function(event, template) {
    Session.set('displayPercent', true);
  },
  'click #display-amount': function(event, template) {
    Session.set('displayPercent', undefined);
  }
});

Template.portfolio_table.helpers({
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  visible: function() {
    // Only show current holdings unless option is specified
    return Session.get('showClosed') || this.shares > 0;
  }
});

Template.portfolio_table2.helpers({
  currentHoldings: function() {
    return Holdings.find({'userId': Meteor.userId()}).fetch();
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  visible: function() {
    // Only show current holdings unless option is specified
    return Session.get('showClosed') || this.shares > 0;
  }
})