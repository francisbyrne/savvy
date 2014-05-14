UI.registerHelper('formatPercent', function(field) {
  return numeral(field || 0).format('+0.00%');
});

UI.registerHelper('formatCurrency', function(field) {
  return numeral(field || 0).format('$0,0.00');
});

UI.registerHelper('formatCurrencySign', function(field) {
  // Workaround for Numeral.js issue #89: $+0.00 instead of +$0.00
  return (field > 0 ? '+' : '') + numeral(field || 0).format('$0,0.00');
});

UI.registerHelper('formatDate', function(field) {
  return moment(field || 0).format('ll');
});