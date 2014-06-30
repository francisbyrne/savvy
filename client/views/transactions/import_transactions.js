// Client-only collection for pending imports (for preview)
Imports = new Meteor.Collection(null);

Template.import_transactions.helpers({
  firstImport: function() {
    return Imports.findOne();
  },
  imports: function() {
    return Imports.find().fetch();
  }
});

Template.import_transactions.events({

  // TODO: allow editing data before import
  // Upload csv file from system and insert as a new Transaction
  'change #files': function (e) {
    var files = e.target.files || e.dataTransfer.files;
    for (var i = 0, file; file = files[i]; i++) {
      if (file.type.indexOf("text") == 0) {
        var reader = new FileReader();
        reader.onloadend = function (e) {
          var text = e.target.result;
          var all = $.csv.toArrays(text);
          _.each(all, function (entry, index) {

            // TODO: optionally include first row, or deal with headers cleverly
            // Ignore first row by default (probably header)
            if (index == 0)
              return;

            // Add unsorted array of fields to Imports collection
            Imports.insert({'fields': entry});

          });

        }
        reader.readAsText(file);
      }
    }
  },

  // User has previewed the import data and confirmed the import, so add new Transactions
  'click #confirm-import': function(event, template) {

    // Get the values of the select dropdowns 
    var keys = _.map( template.findAll(':selected'), function(item) { return item.value } );

    loadImports(keys);

    // Go back to portfolio to view imported transactions
    Router.go('portfolio');
  }
});

// Iterates through Imports collection and adds all valid trades, throwing errors for invalid trades
var loadImports = function(keys) {
  Imports.find().forEach(function(item) {
    var keys = this; // Pass in the keys from the outer function
    var trade = {};
    // Set each field of the trade, based on the selected header
    _.each(item.fields, function(field, index) {
      if (keys[index]) { // Filter out unselected fields
        keys[index] === 'symbol' && field.length > 0 && field.length < 4 && (field = field.concat(".AX")); // Convert Google to Yahoo; only for Aus shares
        trade[keys[index]] = field;
      }
    });
    if (trade.symbol && trade.price && trade.shares && trade.date) {
      addTransaction(trade);
      // TODO: In edge cases where two transactions are exactly the same, it will remove both!
      Imports.remove(item);
    }
  }, keys);

  // Provide feedback on which imports failed
  var failed = Imports.find().fetch();
  if (failed.length > 0) {
    var failedRows = _.map(failed, function(row) {return row && row.fields && row.fields.toString() + '<br>';});
    // TODO: format this better!
    Errors && Errors.throw('The following imports were ignored due to missing stock symbols:<br>' + failedRows.toString());
    Imports.remove({});
  }
};