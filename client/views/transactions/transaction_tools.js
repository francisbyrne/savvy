Template.transaction_tools.events({
  'click #clear': function(event, template) {
    if ( confirm('Are you sure you wish to Clear All Transactions?') ) {
      Meteor.call('clearTransactions', function(error, result) {
        if (error) {
          console.log(error);
        }
      });
    }
  },

  // TODO: allow editing data before import
  // Upload csv file from system and insert as a new Transaction
  'change #files': function (e) {
    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0, file; file = files[i]; i++) {
      if (file.type.indexOf("text") == 0) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          var text = e.target.result;
          var all = $.csv.toObjects(text);
          _.each(all, function (entry) {
            var trade = {
              // TODO: these fields need to be generic!
              'symbol': entry.Symbol,
              'type':   entry.Type,
              'date': entry['Date'],
              'shares': entry.Shares,
              'price': entry.Price,
              'commission': entry.Commission
            };
            addTransaction(trade);
          });
        }
        reader.readAsText(file);
      }
    }
  }
})