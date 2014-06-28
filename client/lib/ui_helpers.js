var gainOrLoss = function(check, field) {
  if (! field) {
    field = check;
  }

  if (check > 0)
    return '<span class="gain">' + field + '</span>';
  else if (check < 0)
    return '<span class="loss">' + field + '</span>';
  else
    return field;
};

formatPercent = function formatPercent(field) {
  var percent = numeral(field || 0).format('+0.00%');
  return gainOrLoss(field, percent);
};

formatPercentBrackets = function formatPercentBrackets(field) {
  var percent = '(' + numeral(field || 0).format('+0.00%') + ')';
  return gainOrLoss(field, percent);
};

formatCurrency = function formatCurrency(field) {
  return numeral(field || 0).format('$0,0.00');
};

formatCurrencySign = function formatCurrencySign(field) {
  // Workaround for Numeral.js issue #89: $+0.00 instead of +$0.00
  var amount = (field > 0 ? '+' : '') + numeral(field || 0).format('$0,0.00');
  return gainOrLoss(field, amount);
};

formatDate = function formatDate(field) {
  return moment(field || 0).format('ll');
};

UI.registerHelper('formatPercent', formatPercent);
UI.registerHelper('formatPercentBrackets', formatPercentBrackets);
UI.registerHelper('formatCurrency', formatCurrency);
UI.registerHelper('formatCurrencySign', formatCurrencySign);
UI.registerHelper('formatDate', formatDate);
UI.registerHelper('signedIn', function(){
  return !! Meteor.user();
});