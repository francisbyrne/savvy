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


// Creates a bunch of dummy imports and runs loadImports()
loadDummyImports = function() {
  var keys = ["symbol", "", "type", "date", "shares", "price", "", "commission", ""];

  var imports = [{"fields":["BHP","BHP Billiton Limited","Buy","Jul 11, 2008","77","39.93","-3101.56","26.95",""],"_id":"EHFiztaWQtCw6B8Qo"},{"fields":["BHP","BHP Billiton Limited","Sell","Apr 1, 2014","77","37","2829.05","19.95",""],"_id":"bMqFBgddmshnBQomL"},{"fields":["MQG","Macquarie Group Ltd","Buy","Aug 10, 2011","164","24.34","-4020.71","28.95",""],"_id":"HF7YkgACuix9oTrba"},{"fields":["MQG","Macquarie Group Ltd","Buy","Aug 19, 2011","124","24.1","-3017.35","28.95",""],"_id":"mMYs2eMMoDMLnZXAP"},{"fields":["MQG","Macquarie Group Ltd","Buy","Dec 19, 2011","41","24.39","-999.99","0","Employee SPP 2011"],"_id":"Jvk7SpZwj4AMCoHm5"},{"fields":["MQG","Macquarie Group Ltd","Buy","Dec 18, 2012","30","33.33","-999.90","0","Employee SPP 2012"],"_id":"XP9bSpGgcQ3YLFtEK"},{"fields":["MQG","Macquarie Group Ltd","Sell","Mar 31, 2014","155","58","8970.05","19.95",""],"_id":"niv4AENaJwcn7CPER"},{"fields":["VOC","Vocus Communications Limited","Buy","Mar 27, 2012","1578","1.9","-3018.15","19.95",""],"_id":"fp3ek7o64zGQRj2on"},{"fields":["VOC","Vocus Communications Limited","Buy","Aug 7, 2012","3068","1.63","-5000.84","0","SPP"],"_id":"qsnc4qmLcZhQSzdx2"},{"fields":["AMM","Amcom Telecommunications Limited","Buy","Jun 22, 2012","2800","1.07","-3015.95","19.95","High growth, NBN headwinds"],"_id":"2mcB9NxrXFT96DEfu"},{"fields":["MTS","Metcash Limited","Buy","Aug 16, 2012","875","3.46","-3047.45","19.95","High Dividend Yield, low price due to one-off writedowns"],"_id":"XdqcX7wwMsc269oXj"},{"fields":["MTS","Metcash Limited","Sell","Apr 29, 2014","875","2.8","2430.05","19.95",""],"_id":"zxt6LDCDw2k7Cw45d"},{"fields":["CTD","Corporate Travel Management Ltd","Buy","Aug 24, 2012","1214","2.46","-3006.39","19.95","Good price, great growth potential, strong business model (take fee per booking)"],"_id":"NqmA5zx7vAKHfqShe"},{"fields":["CTD","Corporate Travel Management Ltd","Buy","Oct 10, 2012","1000","3.03","-3049.95","19.95",""],"_id":"cGCd8QzTtoGAvQD2y"},{"fields":["CTD","Corporate Travel Management Ltd","Buy","Jan 24, 2014","328","4.6","","0",""],"_id":"wbdpYcG2ukDhbCDWf"},{"fields":["IRI","Integrated Research Limited","Buy","Oct 16, 2012","3360","1.2","-4051.95","19.95","Motley Fool pick of 2012"],"_id":"qQ55YJbwbZTE3CnLM"},{"fields":["CDA","Codan Limited","Buy","Nov 23, 2012","2159","2.31","-5007.24","19.95","Good growth prospects, good management, strong I.P."],"_id":"ipegYXneJtiJwzMyh"},{"fields":["CDA","Codan Limited","Buy","Apr 17, 2013","650","3.1","-2034.95","19.95","15% price correction; top-up on quality stock"],"_id":"qgG4s3GpZ4TdfTBWd"},{"fields":["CDA","Codan Limited","Sell","Apr 22, 2014","2809","0.68","1890.17","19.95",""],"_id":"GJTwbDqwAL9DXiE5s"},{"fields":["CLH","Collection House Limited","Buy","Feb 22, 2013","2000","1.5","-3019.95","19.95","Motley Fool told me to."],"_id":"ks3x7HXyg3nHbJegZ"},{"fields":["CLH","Collection House Limited","Buy","Sep 13, 2013","1515","1.65","-2519.70","19.95","SPP"],"_id":"CTux3vFLco6xiwhZz"},{"fields":["RCG","RCG Corporation Limited","Buy","Apr 3, 2013","5000","0.6","-3019.95","19.95","Fool Hidden Gem Mar &#39;13"],"_id":"XZQv2GSrWSDxKbroj"},{"fields":["COH","Cochlear Limited","Buy","Apr 29, 2013","45","66","-2989.95","19.95","Fool April 2013 pick; great brand, 70% market share, good price due to recall"],"_id":"pha3xPvPWoP9XkSQn"},{"fields":["COH","Cochlear Limited","Buy","Jun 3, 2013","38","52.9","-2030.15","19.95","Price dropped 18% after profit downgrade"],"_id":"p42dSpjeqLpBANinc"},{"fields":["SIV","Silver Chef Limited","Buy","May 6, 2013","270","7.4","-2017.95","19.95",""],"_id":"RpK9vGda6ZKsqfiLp"},{"fields":["NHF","NIB Holdings Limited","Buy","May 7, 2013","1300","2.3","-3009.95","19.95","Fool Pick; health insurance tough; NIB has young client base"],"_id":"xsLQAhFwtWDqQGPJN"},{"fields":["SOL","Washington H. Soul Pattinson and Co. Ltd","Buy","May 16, 2013","203","14.8","-3024.35","19.95","Fool Pick Best Buy May 2013"],"_id":"XRTuNzoHjhoiEh3Qt"},{"fields":["IMF","Bentham IMF Ltd","Buy","May 21, 2013","1522","1.97","-3018.29","19.95","Fool Hidden Gem May 2013; lumpy profits = undervalued; unique business model; US growth"],"_id":"JcM4fNnWxuSS9xGoR"},{"fields":["IMF","Bentham IMF Ltd","Buy","Apr 4, 2014","45","1.6896","-76.03","0","DRP"],"_id":"pZzhFBHKtJoZbMHKL"},{"fields":["CBA","Commonwealth Bank of Australia","Buy","Mar 3, 2008","75","40","-3026.95","26.95",""],"_id":"D4BZG895DLFD7zG7K"},{"fields":["CBA","Commonwealth Bank of Australia","Sell","Apr 3, 2013","75","69.25","5173.80","19.95",""],"_id":"6ezzzCqQSEQ4ixBPR"},{"fields":["NAB","National Australia Bank Ltd.","Buy","Jul 12, 2011","208","24","-5020.95","28.95",""],"_id":"mGdofuwNdaFqjjwCt"},{"fields":["NAB","National Australia Bank Ltd.","Sell","Nov 23, 2012","207","23.71","4888.02","19.95",""],"_id":"NveJ9sFmXxbSWLSb4"},{"fields":["ABC","Adelaide Brighton Ltd.","Buy","Feb 29, 2012","1665","2.99","-4998.30","19.95",""],"_id":"eCa4dZJFEd7QMxzdE"},{"fields":["ABC","Adelaide Brighton Ltd.","Sell","Sep 18, 2012","643","3.02","1921.91","19.95",""],"_id":"aD3APYyASXgmL52aM"},{"fields":["ABC","Adelaide Brighton Ltd.","Sell","Sep 20, 2012","1021","3.07","3114.52","19.95",""],"_id":"Ws5wLiWGtqPPWpmkf"},{"fields":["DMG","Dragon Mountain Gold Limited","Buy","Mar 29, 2012","5500","0.52","-2879.95","19.95",""],"_id":"X7G3Q6iCgrr3yvGh2"},{"fields":["DMG","Dragon Mountain Gold Limited","Sell","Jul 25, 2012","5500","0.45","2475.00","0",""],"_id":"oE3rzeN7fqr3T5w6z"},{"fields":["PMV","Premier Investments Limited","Buy","Jun 28, 2013","450","6.67","-3021.45","19.95",""],"_id":"HHRvcQ5LdJQjCRGz5"},{"fields":["CCV","Cash Converters International Ltd","Buy","Jul 10, 2013","1673","1.195","-2019.18","19.95","Hidden Gem June 2013"],"_id":"QJqe78yfPGr4Bwd8e"},{"fields":["RMD","ResMed Inc. (CHESS)","Buy","Jul 16, 2013","606","4.95","-3019.65","19.95","Fool Best Buy July 2013"],"_id":"YfoGFNgyiq5kphwtA"},{"fields":["TLS","Telstra Corporation Ltd","Buy","Jul 30, 2013","1016","4.92","-5018.67","19.95","Fool July 2013 Share Adviser"],"_id":"LKBNyjCuKKw527A6i"},{"fields":["WEB","Webjet Limited","Buy","Sep 16, 2013","515","3.9","-2028.45","19.95","Hidden Gem"],"_id":"WY4JqtX3bwcrjznxa"},{"fields":["WEB","Webjet Limited","Buy","Jan 13, 2014","666","3","","19.95",""],"_id":"QEC7xKmxqyxvakBAB"},{"fields":["MTU","M2 Group Ltd","Buy","Sep 27, 2013","480","6.28","-3034.35","19.95","Fool Sept 2013"],"_id":"MbG8Yk4HK2sbYK5hf"},{"fields":["GBT","GBST Holdings Limited","Buy","Nov 25, 2013","663","3.02","-2022.21","19.95","Hidden Gem"],"_id":"WQ9Bn5jgoCwLTPQDt"},{"fields":["SYD","Sydney Airport Holdings Ltd","Buy","Jan 13, 2014","359","3.7","","0","MQG divestement of SYD shares"],"_id":"Bk9ABbHJZyKnRjYup"},{"fields":["TFC","TFS Corporation Limited","Buy","Jan 20, 2014","1700","1.18","","19.95",""],"_id":"d55HKiuedTyu8nrP3"},{"fields":["CGF","Challenger Ltd","Buy","Jan 28, 2014","500","6","","19.95",""],"_id":"MZ8Tb2E5NerF68h7t"},{"fields":["FXL","FlexiGroup Limited","Buy","Feb 27, 2014","750","4","","19.95",""],"_id":"kZPSRfqbMfAqsvZfc"},{"fields":["GRB","Gage Roads Brewing Co Limited","Buy","Feb 28, 2014","8000","0.25","","19.95",""],"_id":"Rb24Xzz5H8bySW5zr"},{"fields":["CCL","Coca-Cola Amatil Ltd","Buy","Apr 1, 2014","275","11","-3044.95","19.95",""],"_id":"A9aELvtdtww7HLADk"},{"fields":["TRS","Reject Shop Ltd","Buy","Apr 1, 2014","300","10","-3019.95","19.95",""],"_id":"ccPcCBin7pFojdEXg"},{"fields":["PBG","Pacific Brands Limited","Buy","Apr 1, 2014","3850","0.52","-2021.95","19.95",""],"_id":"THCsrQWqGuaJiuGkD"},{"fields":["CRZ","Carsales.Com Ltd","Buy","Apr 29, 2014","270","11.05","-3003.45","19.95",""],"_id":"g58PqRKkMYhCz3m76"}];
  for (row in imports) {
    Imports.insert(imports[row]);
  }

  loadImports(keys);
};