Template.portfolio.helpers({
  holdingsExist: function() {
    return !! Holdings.find({'userId': Meteor.userId()}).count();
  },
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
        },
        drawCallback: function() {

          // This is a hack due to the fact that UI.render doesn't behave reactively

          // Remove current total template
          $('#portfolio #portfolio-total').remove();

          // Insert new total template
          UI.insert( 
            UI.render(Template.portfolio_total), 
            $('#portfolio table').get()[0]
          );


        }
      },
      subscription: "holdings",
      id: 'portfolio-table',
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
          mRender: function(data, type, full) {
            return Session.get('displayPercent') && formatPercent(full.changePercent) || formatCurrencySign(data);
          }
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
          mRender: function(data, type, full) {
            return Session.get('displayPercent') && formatPercent(full.daysGainPercent) || formatCurrencySign(data);
          }
        },{
          title: "gain",
          data: "overallGain",
          mRender: function(data, type, full) {
            return Session.get('displayPercent') && formatPercent(full.overallGainPercent) || formatCurrencySign(data);
          }
        }
      ],
      query: Session.get('portfolioFilter')
    };
  }
});

var displayPercent = function() {
  // Get the column API object
  var column = table.column( $(this).attr('data-column') );

  // Toggle the visibility
  column.visible( ! column.visible() );
}

Deps.autorun(function() {
  if ( Session.get('displayPercent') ) {
    var table = 0;
  }
})

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
  },
  'click #focus-add-trade': function(event, template) {
    template.$('#add-transaction .ticker').focus();
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