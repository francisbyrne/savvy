Template.portfolio.helpers({
  visible: function() {
    // Only show current holdings unless option is specified
    return Session.get('showClosed') || this.shares > 0;
  },
  showClosed: function() {
    return Session.get('showClosed');
  },
  displayPercent: function() {
    return Session.get('displayPercent');
  },
  settings: function() {
    return {
      showFilter: false,
      fields: [
        {key: 'symbol',             label: 'Symbol'},
        {key: 'lastTradePriceOnly', label: 'Price',        fn: formatCurrency},
        {key: 'change',             label: 'Change',       fn: formatCurrencySign},
        {key: 'shares',             label: 'Shares'},
        {key: 'costBasis',          label: 'Cost Basis',   fn: formatCurrency},
        {key: 'marketValue',        label: 'Market Value', fn: formatCurrency},
        {key: 'daysGain',           label: 'Day\'s Gain',  fn: formatCurrencySign},
        {key: 'gain',               label: 'Gain',         fn: formatCurrencySign},
        {key: 'overallGain',        label: 'Overall Gain', fn: formatCurrencySign}
      ]
    };
  }
})

Template.portfolio.events({
  'click #show-closed': function(event, template) {
    Session.get('showClosed') && (Session.set('showClosed', false) || true) || Session.set('showClosed', true);
  },
  'click #display-percent': function(event, template) {
    Session.set('displayPercent', true);
  },
  'click #display-amount': function(event, template) {
    Session.set('displayPercent', undefined);
  }
})