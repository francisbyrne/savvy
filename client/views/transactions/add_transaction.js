Template.add_transaction.rendered = function(){
    // initialize typeahead for search
    Meteor.typeahead(this.$('.ticker'));
};

Template.add_transaction.helpers({
  formActive: function() {
    return Session.get('addTransactionActive') ? 'menu': 'menu closed';
  },
  search: function() {
    // map symbols to array for typeahead datasource
    return Stocks.find().fetch().map(function(it){ return it.symbol; });
  }
});

Template.add_transaction.events({
  'focus #add-transaction .ticker': function(event, template) {
    Session.set('addTransactionActive', true);
  },
  'submit form#add-transaction': function(event, template) {
    event.preventDefault();

    var form = template.find('#add-transaction');
    var fields = forms.parseForm(form);

    addTransaction(fields, function() {
      // Reset form and focus input
      form.reset();
      template.find("input[name=symbol]").focus();
    })
  }
});