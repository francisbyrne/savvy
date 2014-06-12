Template.portfolio.helpers({
  table: function() {
    return {
      options: {
        // Move the display options inside the datatables header after it initialises
        fnInitComplete: function() {
          UI.insert( 
            UI.render(Template.display_options), 
            $('#portfolio .datatable-header').get()[0], 
            $('#portfolio .dataTables_filter').get()[0] 
          );
          if ( $('#portfolio #portfolio-total').length <= 0 ) {
            UI.insert( 
              UI.render(Template.portfolio_total), 
              $('#portfolio table').get()[0]
            );
          }
        }
      },
      subscription: "holdings",
      id: "portfolio-table",
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
        }
      ],
      query: Session.get('portfolioFilter')
    };
  }
});

Template.portfolio.events({
  'click #show-closed': function(event, template) {
    var query = Session.get('portfolioFilter');
    if (query && query.shares) {
      delete query.shares;
    } else {
      var filter = { 'shares': { $ne: 0 } };
      _.extend( query, filter );
    }
    Session.set('portfolioFilter', query);
  },
  'click #display-percent': function(event, template) {
    Session.set('displayPercent', true);
  },
  'click #display-amount': function(event, template) {
    Session.set('displayPercent', undefined);
  }
});

Template.portfolio.rendered = function() {
  Session.set('portfolioFilter', { 'shares': { $ne: 0 } });
};

Template.display_options.helpers({
  showClosed: function() {
    var filter = Session.get('portfolioFilter');
    return filter && ! filter.shares;
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  displayAmount: function() {
    return ! Session.get('displayPercent');
  }
});

Template.portfolio_total.helpers({
  total: function() {
    var holdings = Holdings.find({ 'userId': (Meteor.userId()) }).fetch();
    var total = {};
    total.marketValue        = _.reduce(holdings, function(memo, holding) {return memo + holding.marketValue;}, 0);
    total.costBasis          = _.reduce(holdings, function(memo, holding) {return memo + holding.costBasis;}, 0);
    total.daysGain           = _.reduce(holdings, function(memo, holding) {return memo + holding.daysGain;}, 0);
    total.gain               = _.reduce(holdings, function(memo, holding) {return memo + holding.gain;}, 0);
    total.gainPercent        = total.gain / total.costBasis;
    // total.overallGain        = _.reduce(holdings, function(memo, holding) {return memo + holding.overallGain;}, 0);
    var totalCost            = _.reduce(holdings, function(memo, holding) {return memo + holding.totalCost;}, 0);
    // total.overallGainPercent = total.overallGain / totalCost;

    return total;
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  displayAmount: function() {
    return ! Session.get('displayPercent');
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