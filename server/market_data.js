
// TODO: camelize all fields
var FIELD = {
  s: 'symbol',

  // Pricing
  a: 'Ask',
  b: 'Bid',
  b2: 'Ask (Realtime)',
  b3: 'Bid (Realtime)',
  p: 'Previous Close',
  o: 'Open',
  l1: 'lastTradePriceOnly',
  k1: 'Last Trade (Realtime) With Time',
  l: 'Last Trade (With Time)',

  // Dividends
  y: 'dividendYield',
  d: 'Dividend Per Share',
  r1: 'Dividend Pay Date',
  q: 'Ex-Dividend Date',

  // Date
  c1: 'change',
  c: 'Change And Percent Change',
  c6: 'Change (Realtime)',
  k2: 'Change Percent (Realtime)',
  p2: 'changePercent',
  d1: 'Last Trade Date',
  d2: 'Trade Date',
  t1: 'Last Trade Time',

  // Averages
  c8: 'After Hours Change (Realtime)',
  c3: 'Commission',
  g: 'Day’s Low',
  h: 'Day’s High',
  t8: '1 yr Target Price',
  m5: 'Change From 200-day Moving Average',
  m6: 'Percent Change From 200-day Moving Average',
  m7: 'Change From 50-day Moving Average',
  m8: 'Percent Change From 50-day Moving Average',
  m3: '50-day Moving Average',
  m4: '200-day Moving Average',

  // Misc
  w1: 'Day’s Value Change',
  w4: 'Day’s Value Change (Realtime)',
  p1: 'Price Paid',
  m: 'daysRange',
  m2: 'Day’s Range (Realtime)',
  g1: 'Holdings Gain Percent',
  g3: 'Annualized Gain',
  g4: 'Holdings Gain',
  g5: 'Holdings Gain Percent (Realtime)',
  g6: 'Holdings Gain (Realtime)',

  // 52 Week Pricing
  k: 'fiftyTwoWeekHigh',
  j: '52-week Low',
  j5: 'Change From 52-week Low',
  k4: 'Change From 52-week High',
  j6: 'Percent Change From 52-week Low',
  k5: 'Percebt Change From 52-week High',
  w: '52-week Range',

  // System Info
  i: 'More Info',
  j1: 'marketCapitalization',
  j3: 'Market Cap (Realtime)',
  f6: 'Float Shares',
  n: 'name',
  n4: 'Notes',
  s1: 'sharesOwned',
  x: 'Stock Exchange',
  j2: 'sharesOutstanding',

  // Volume
  v: 'volume',
  a5: 'Ask Size',
  b6: 'Bid Size',
  k3: 'Last Trade Size',
  a2: 'averageDailyVolume',

  // Ratio
  e: 'earningsPerShare',
  e7: 'EPS Estimate Current Year',
  e8: 'EPS Estimate Next Year',
  e9: 'EPS Estimate Next Quarter',
  b4: 'Book Value',
  j4: 'EBITDA',
  p5: 'Price per Sales',
  p6: 'Price per Book',
  r: 'priceEarningsRatio',
  r2: 'PE Ratio (Realtime)',
  r5: 'PEG Ratio',
  r6: 'Price Per EPS Estimate Current Year',
  r7: 'Price Per EPS Estimate Next Year',
  s7: 'Short Ratio',

  // Misc
  t7: 'Ticker Trend',
  t6: 'Trade Links',
  i5: 'Order Book (Realtime)',
  l2: 'High Limit',
  l3: 'Low Limit',
  v1: 'Holdings Value',
  v7: 'Holdings Value (Realtime)',
  s6: 'Revenue',
  e1: 'errorIndication' // (returned for symbol changed or invalid)
};

Meteor.methods({

  /* Performs an upsert on Stocks collection for a given set of fields 
  *  (Array: options.fields) of given stock symbols (Array: options.symbols) 
  */
  refreshStocks: function(options) {
    if (_.isUndefined(options)) { options = {}; }

    assert(_.isObject(options),
           '"options" must be a plain object.');
    assert(_.isArray(options.symbols) && !_.isEmpty(options.symbols),
           '"options.symbols" must be a non-empty string array.');
    assert((_.isArray(options.fields) && !_.isEmpty(options.fields)) || _.isUndefined(options.fields),
           '"options.fields" must be a non-empty string array or undefined.');

    // fetch standard fields if undefined
    if (!options.fields) {
      options.fields = ['s', 'n', 'l1', 'c1', 'p2', 'm', 'k', 'v', 'a2', 'j1', 'r', 'y', 'e', 'e1'];
    }

    // Avoid CSV column result mis-alignment (000,000,000).
    options.fields = _.without(options.fields, 't6', 'f6', 'j2', 'a5', 'b6', 'k3');

    var url = 'http://download.finance.yahoo.com/d/quotes.csv';

    // Get data from market data provider; throw connection error if unavilable
    try {
      var results = HTTP.get( url, { params: {
        s: options.symbols.join(','),
        f: options.fields.join('')
      } } );
    } catch(error) {
      throw new Meteor.Error(504, 'Market data provider unavailable. Stocks may be unavailable and/or prices etc. may be out of date.');
    }

    // FOR OFFLINE DEV
    // var results = {
    //   statusCode: 200,
    //   content: '"YHOO","Yahoo! Inc.",34.26,-1.50,"33.83 - 36.0499",41.72,41049936,41049936,34.582B,28.38,N/A,1.26'
    // };

    // Hack to handle invalid stock symbols
    if (results.content.substr(-6,3) != "N/A") {
      throw new Meteor.Error(404, "No such stock exists.");
    }

    // Grab CSV file from Yahoo Finance and for each stock, insert a new Stock to the collection
    try {
      if (results.statusCode == 200) {

        CSV().from.string(results.content).to.array( Meteor.bindEnvironment(function (data) {
          var items = _.map(data, function (line, i) {
            var result = {},
                symbol = options.symbols[i],
                lineIdx = 0,
                field,
                fieldIdx,
                value;

            for (fieldIdx = 0; fieldIdx < options.fields.length; ++fieldIdx) {
              field = options.fields[fieldIdx];
              value = line[lineIdx++];

              result[FIELD[field]] = value;
            }

            assert(line.length === lineIdx, 'CSV column mis-alignment error');

            return result;
          });

          _.each(items, function (item) {
            Stocks.upsert( { symbol: item.symbol }, item );
          });

        }) );
      }
    } catch(error) {
      throw new Meteor.Error(500, error.message);
    }
  }

});