formatPercent = function formatPercent(field) {
  return numeral(field || 0).format('+0.00%');
};

formatCurrency = function formatCurrency(field) {
  return numeral(field || 0).format('$0,0.00');
};

formatCurrencySign = function formatCurrencySign(field) {
  // Workaround for Numeral.js issue #89: $+0.00 instead of +$0.00
  return (field > 0 ? '+' : '') + numeral(field || 0).format('$0,0.00');
};

formatDate = function formatDate(field) {
  return moment(field || 0).format('ll');
};

UI.registerHelper('formatPercent', formatPercent);
UI.registerHelper('formatCurrency', formatCurrency);
UI.registerHelper('formatCurrencySign', formatCurrencySign);
UI.registerHelper('formatDate', formatDate);