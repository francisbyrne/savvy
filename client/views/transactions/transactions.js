Template.transactions.helpers({
  transactions: function() {
    // Get all transactions for current user - sorted by ticker (asc) then date (asc)
    return Transactions.find( {userId: Meteor.userId()}, {sort: ['symbol', 'date']} ).fetch();
  }
});

Template.transactions.events({
  'click button.remove-transaction': function(event, template) {
    if ( confirm('Are you sure you wish to remove ' + this.type + ' ' + this.symbol + ' on ' + this.date + '?' ) )
      Transactions.remove(this._id);
  },
  'click #focus-add-trade': function(event, template) {
    template.$('#add-transaction .ticker').focus();
  }
});