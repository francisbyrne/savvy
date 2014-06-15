Template.capital_gains.rendered = function(){
    // Set default dates to this financial year
    var eofy = moment( moment().year() + '-06-30' );
    var end = eofy.format('YYYY-MM-DD');
    eofy.add('days', 1).subtract('years', 1);
    var start = eofy.format('YYYY-MM-DD');
    this.$('input[name="end-date"]').val(end);
    this.$('input[name="start-date"]').val(start);
    calculateCapitalGain(start, end);
};

Template.capital_gains.events({
  'submit #cgt-form': function(event, template) {
    event.preventDefault();
    var form = template.find('#cgt-form');
    var fields = forms.parseForm(form);
    calculateCapitalGain(fields['start-date'], fields['end-date']);
  }
});

Template.cgt_results.helpers({
  trades: function() {
    return capitalEvents();
  },
  costBasis: function() {
    return costBasis(this);
  },
  gain: function() {
    return this.cashFlow - costBasis(this);
  },
  total: function() {
    var trades = capitalEvents();
    var value  = _.reduce(trades, function(memo, trade) {return memo + trade.cashFlow;}, 0);
    var cost   = _.reduce(trades, function(memo, trade) {return memo + costBasis(trade);}, 0);
    var gain   = value - cost;
    return {
      'value': value,
      'cost' : cost,
      'totalGain' : gain // Have to name this totalGain to avoid conflict with "gain" helper above
    };
  }
});

calculateCapitalGain = function(start, end) {
  Session.set('cgt', {
    'startDate': start,
    'endDate'  : end
  });
};

capitalEvents = function() {
  if (! Session.get('cgt') )
      return null;

    var selector = {
      'userId': Meteor.userId(),
      'type'  : 'Sell',
      'date'  : { $gte: new Date( Session.get('cgt').startDate ), 
                  $lte: new Date( Session.get('cgt').endDate ) }
    };
    return Transactions.find(selector).fetch();
};

costBasis = function(trade) {
  check(trade, Match.ObjectIncluding({
    'userId'  : String,
    'symbol'  : String,
    'date'    : Match.Any,
    'shares'  : Number
  }));
  var selector = {
    'userId': trade.userId,
    'symbol': trade.symbol,
    'type'  : 'Buy',
    'date'  : { $lte: new Date( trade.date ) }
  };
  var previousBuys = Transactions.find(selector).fetch();

  var totalCost    = _.reduce(previousBuys, function(memo, buy) {return memo - buy.cashFlow}, 0);
  var totalShares  = _.reduce(previousBuys, function(memo, buy) {return memo + buy.shares}, 0);
  var costPerShare = totalCost / totalShares;

  return costPerShare * trade.shares;
}