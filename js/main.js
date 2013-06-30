
// This utility function creates the query string to be appended to the base URI of the YQL Web service.  
var toQueryString = function( obj ) {      
  var parts = [];      
  for( var each in obj ) if ( obj.hasOwnProperty( each ) ) {  
    parts.push( encodeURIComponent( each ) + '=' + encodeURIComponent( obj[ each ] ) );      
  }      
  return parts.join('&');    
};

// Build a webservice query based on a YQL (Yahoo Query Language) query
// e.g. SELECT * FROM yahoo.finance.quotes WHERE symbol="bhp.ax"
var buildYqlUrl = function( query ) {
	var yqlBaseUri 	= 'http://query.yahooapis.com/v1/public/yql',
			yqlEnv 			= 'http://datatables.org/alltables.env',
			yqlFormat 	= 'json';
	var	queryString = toQueryString(
		{
			q: query,
			env: yqlEnv,
			format: yqlFormat
		}
	);
	return yqlBaseUri + '?' + queryString;
};

// Set DOM object's class based on whether it is a gain or a loss
var gainOrLoss = function( domObj, changeString ) {
	if ( changeString.charAt( 0 ) === '-' )
		domObj.className = 'loss'
	else if ( changeString.charAt( 0 ) === '+' ) 
		domObj.className = 'gain';
	else
		domObj.className = '';
};

// Query yql finance database and load stock fundamentals
var loadFundamentals = function( ticker ) {
	var yqlQuery = 'SELECT * FROM yahoo.finance.quotes WHERE symbol="' + ticker + '"';
	var url = buildYqlUrl( yqlQuery );
	$.getJSON( url, displayFundamentals );
};

// Insert all the fundamentals data into DOM
var displayFundamentals = function( data ) {
	var quote = data.query.results.quote;
	$( '#ticker' ).html( quote.Symbol );
	$( '#stock-name' ).html( quote.Name );
	$( '#last-trade' ).html( quote.LastTradePriceOnly );
	$( '#price-change' ).html( quote.Change );
	// format/colour price change based on gain/loss
	gainOrLoss( document.getElementById( 'price-change' ), quote.Change );
	$( '#range .value' ).html( quote.DaysRange );
	$( '#year-range .value' ).html( quote.YearRange );
	$( '#volume .value' ).html( quote.Volume + ' / ' + quote.AverageDailyVolume );
	$( '#market-cap .value' ).html( quote.MarketCapitalization );
	$( '#price-earnings .value' ).html( quote.PERatio );
	$( '#dividend-yield .value' ).html( quote.DividendYield );
	$( '#EPS .value' ).html( quote.EarningsShare );
	//$( '#num-shares .value' ).html( quote.DaysRange );
};

var loadMarketDataChart = function( ticker, startDate, endDate ) {
	var yqlQuery = 'SELECT * FROM yahoo.finance.historicaldata WHERE symbol="'
		+ ticker + '" AND startDate="' + startDate + '" AND endDate="' + endDate + '"';
	var url = buildYqlUrl( yqlQuery );
	$.getJSON( url, function( data ) {
		var chartData = convertYqlQuotesToChartData ( data );
		displayMarketDataChart( chartData );
	} );
};

// Convert the data response from YQL to a format usable by HighStock
// Input: [ { Date: '2013-06-29', Close: 31.80 }, 
// 				{ Date: '2013-06-28', Close: 31.41 } ]
// Output: [ 
//					 [ 1372472064968, 31.41 ], the big number is a timestamp for '2013-06-28'
//					 [ 1372461129679, 31.80 ]  this one is '2013-06-29'
// 				 ] 
// Note: the reverse order because HighStock requires ascending order
var convertYqlQuotesToChartData = function( yqlData ) {
	var quotes 		= yqlData.query.results.quote,
			chartData	=	[];
	var length = quotes.length,
			quote  = {};
	for ( var i = length - 1; i >= 0; i-- ) {
		quote = quotes[i];
		var point	 = [
			new Date( quote.Date ).getTime(),
			parseFloat( quote.Close )
		];
		chartData.push( point );
	}
	return chartData;
};

// Generate a HighStock chart in a particular selector
var displayMarketDataChart = function( selector, data ) {
  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  $( selector ).highcharts( "StockChart", {
		rangeSelector: {
	    selected: 4,
	    inputEnabled: false,
	    buttons: [{
        type: "month",
        count: 1,
        text: "1m"
	    }, {
        type: "month",
        count: 3,
        text: "3m"
	    }, {
        type: "month",
        count: 6,
        text: "6m"
	    }, {
        type: "ytd",
        text: "YTD"
	    }, {
        type: "year",
        count: 1,
        text: "1y"
	    }, {
        type: "year",
        count: 5,
        text: "5y"
	    }]
		},
		title: {
	    text: null
		},
		navigator: {
	    enabled: false
		},
		scrollbar: {
	    enabled: false
		},
		credits: {
	    enabled: false
		},
		series: [{
	    name: "Price",
	    data: data,
	    tooltip: {
        valueDecimals: 2
	    }
		}]
  });
};

// takes a Date object, returns a string in yyyy-mm-dd format
var yyyymmdd = function( date ) {
 var yyyy = date.getFullYear().toString();
 var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
 var dd  = date.getDate().toString();
 return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
};

// Get today's date as a string 'yyyy-mm-dd'
var today = function() {
	var d = new Date();
  return yyyymmdd( d );
};

// Get this day last year as a string 'yyyy-mm-dd'
var lastYear = function() {
	var d = new Date();
  d.setFullYear( d.getFullYear() - 1 );
	return yyyymmdd( d );
};

$( document ).ready( function() {
	$( '#search-form' ).submit( function( e ) {
		e.preventDefault();
		var ticker = $( '#search' ).val();
		loadFundamentals( ticker );
		loadMarketDataChart( ticker, lastYear(), today() );
	});
});