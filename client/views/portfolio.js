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
  total: totalHoldings,
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