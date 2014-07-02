// Client-only collection for pending imports (for preview)
Imports = new Meteor.Collection(null);

Template.import_transactions.created = function() {
  Session.set('ignoreImportHeader', true);
};

Template.import_transactions.helpers({
  fieldHeaders: function() {
    var firstRow = Imports.findOne();
    var fields = firstRow && firstRow.fields;
    _.each(fields, function(field, index) {
      fields[index] = detectField(field, fields);
    });
    return fields;
  },
  ignoreHeader: function() {
    return Session.get('ignoreImportHeader');
  },
  imports: function() {
    return Imports.find().fetch();
  },
  isSelected: function(field) {
    return (this == field);
  },
  options: function() {
    return {
      fnInitComplete: function() {
        UI.insert( 
          UI.render(Template.import_heading), 
          $('#import-preview_wrapper .datatable-header').get()[0], 
          $('#import-preview_wrapper .dataTables_filter').get()[0] 
        );
      },
    }
  }
});

Template.import_transactions.events({

  'click #cancel-import': function(event, template) {
    Imports.remove({});
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
          var all = $.csv.toArrays(text);

          // If ignoring headers, splice out the first row
          if (Session.get('ignoreImportHeader'))
            all.splice(0, 1);

          // Get column count, to ensure we have consistent columns in each row
          var colCount = all[0].length;

          // Add unsorted array of fields to Imports collection
          _.each(all, function (entry, index) {

            // Pad out empty columns on each row
            for (var i = entry.length; i < colCount; i++) {
              entry[i] = '';
            }

            Imports.insert({'fields': entry});
          });

        }
        reader.readAsText(file);
      }
    }
  },

  // User has previewed the import data and confirmed the import, so add new Transactions
  'click #confirm-import': function(event, template) {

    // Get the values of the select dropdowns as field headings & load imports
    var fields = template.findAll('th option:selected'); // Only get select boxes in table headers
    fields = _.map( fields, function(field) { return field.value; } ); // Get the values
    loadImports(fields);

    // Go back to portfolio to view imported transactions
    Router.go('portfolio');
  },

  'click #ignore-header': function(event, template) {
    Session.get('ignoreImportHeader') ? Session.set('ignoreImportHeader', false) : Session.set('ignoreImportHeader', true);
  },

  'click .remove-import': function(event, template) {
    Imports.remove(this._id);
    // template.$('tr#' + this._id).remove();
    // template.__component__.dom.remove('#' + this._id)
    var table = $('#import-preview').dataTable();
    table.fnDeleteRow( document.getElementById( this._id ) );
  }
});

// Iterates through Imports collection and adds all valid trades, throwing errors for invalid trades
var loadImports = function loadImports(keys) {
  Imports.find().forEach(function(item) {
    var keys = this; // Pass in the keys from the outer function
    var trade = {};
    // Set each field of the trade, based on the selected header
    _.each(item.fields, function(field, index) {
      if (keys[index]) {
        // Convert Google to Yahoo; only for Aus shares
        if (keys[index] === 'symbol' && ! isYahooAusTicker(field) ) {
          field = toYahooAusTicker(field);
        };
        // Filter out unselected fields
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

// Detect a trade field, which is one of:
// 'type', 'shares', 'price', 'commission', 'date', 'symbol' or '' (empty string for none of the above)
var detectField = function detectField(field, fields) {
  var date = new Date(field);
  if (field === 'Buy' || field === 'Sell') {
    return 'type';
  } else if ( ! _.isNaN( parseFloat(field) ) ) {
    var number = parseFloat(field);
    var FEE_LIMIT = 200; // limit for commissions (surely no one pays more than $200 brokerage per trade!?!?)
    if ( ! _.contains(fields, 'shares') && isInt( number ) ) {
      return 'shares';
    }
    if ( ! _.contains(fields, 'price') ) {
      return 'price';
    }
    if ( ! _.contains(fields, 'commission') && Math.abs(number) < FEE_LIMIT ) {
      return 'commission';
    }
    return '';
  } else if ( _.isDate( date ) && ! isNaN( date.getTime() ) ) {
    return 'date';
  } else if ( isValidSymbol(field) ) {
    return 'symbol';
  } else {
    return '';
  }
};

var isYahooAusTicker = function isYahooAusTicker(ticker) {
  return ticker.substr(ticker.length - 3) === '.AX';
};

var toYahooAusTicker = function toYahooAusTicker(field) {
  return field.concat(".AX");
};

var isValidSymbol = function isValidSymbol(ticker) {
  if (! isYahooAusTicker(ticker) )
    ticker = toYahooAusTicker(ticker);

  return Stocks.find({'symbol': ticker}).count() > 0;
};

var isInt = function isInt(n) {
   return n % 1 === 0;
};