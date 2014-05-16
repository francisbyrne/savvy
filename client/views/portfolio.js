Template.portfolio.rendered = function() {
  Session.set('rowOptions', {'shares': {$ne: 0} } );
};

Template.portfolio.helpers({
  showClosed: function() {
    return ! Session.get('rowOptions');
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  displayAmount: function() {
    return ! Session.get('displayPercent');
  },
  table: function() {
    return { 
      options: {
        // Move the display options inside the datatables header after it initialises
        fnInitComplete: function() {
          $('#portfolio-table .datatable-header').prepend( $('#portfolio #display-options').detach() );
        }
      },
      rows: Holdings.find( Session.get('rowOptions') ).fetch(),
      columns: [{
        title: "symbol",
        data: "symbol"
      },{
        title: "price",
        data: "lastTrade"
      },{
        title: "change",
        data: "change"
      },{
        title: "shares",
        data: "shares"
      },{
        title: "cost basis",
        data: "costBasis"
      },{
        title: "market value",
        data: "marketValue"
      },{
        title: "day's gain",
        data: "daysGain"
      },{
        title: "gain",
        data: "gain"
      }]
    }
  }
});

Template.portfolio.events({
  'click #show-closed': function(event, template) {
    if ( Session.get('rowOptions') ) {
      Session.set('rowOptions', undefined);
    } else {
      Session.set('rowOptions', {'shares': {$ne: 0} } );
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