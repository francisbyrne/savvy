UI.registerHelper('formatPercent', function(field) {
  return numeral(field).format('0.00%');
});

UI.registerHelper('formatCurrency', function(field) {
  return numeral(field).format();
});

UI.registerHelper('formatDate', function(field) {
  return moment(field).format('ll');
});