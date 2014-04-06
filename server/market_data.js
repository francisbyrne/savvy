
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
  p2: 'Change in Percent',
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
  s1: 'Shares Owned',
  x: 'Stock Exchange',
  j2: 'Shares Outstanding',

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
  e1: 'Error Indication (returned for symbol changed or invalid)'
};

Meteor.methods({

  getStockDetails: function(options) {
    if (_.isUndefined(options)) { options = {}; }

    // assert(_.isPlainObject(options),
    //        '"options" must be a plain object.');
    // assert(_.isArray(options.symbols) && !_.isEmpty(options.symbols),
    //        '"options.symbols" must be a non-empty string array.');
    // assert((_.isArray(options.fields) && !_.isEmpty(options.fields)) || _.isUndefined(options.fields),
    //        '"options.fields" must be a non-empty string array or undefined.');

    if (!options.fields) {
      options.fields = _.keys(FIELD);  // fetch all fields if undefined
    }

    // Avoid CSV column result mis-alignment (000,000,000).
    options.fields = _.without(options.fields, 't6', 'f6', 'j2', 'a5', 'b6', 'k3');

    var url = 'http://download.finance.yahoo.com/d/quotes.csv';

    try {
      var results = HTTP.get( url, { params: {
        s: options.symbols.join(','),
        f: options.fields.join('')
      } } );

      // var results = {
      //   statusCode: 200,
      //   content: '"GOOG",543.14,"4/4/2014","4:00pm",-26.60,574.65,577.77,543.00"'
      // };

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

              // Manual type conversion
              // if (_.contains([], field)) {
              //   value = parseInt(value, 10);
              // } else if (_.contains(['a', 'b', 'b2', 'b3', 'p', 'o'], field)) {
              //   value = parseFloat(value);
              // } else if (_.contains([], field)) {
              //   value = moment(value).toDate();
              // }

              result[FIELD[field]] = value;
            }

            assert(line.length === lineIdx, 'CSV column mis-alignment error');

            result.id = symbol;

            return result;
          });

          data = [];
          var i = 0;

          _.each(items, function (item) {
            Stocks.upsert( { id: item.id }, item );
          });

        }) );
      }
    } catch(error) {
      // TODO: throw error
    }
  }

});