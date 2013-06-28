
var yqlBaseUri = 'http://query.yahooapis.com/v1/public/yql';
var yqlEnv = 'http://datatables.org/alltables.env';
var yqlResults = {};

var handler = function( object ) {
	yqlResults = object && object.data;
};

// This utility function creates the query string  
// to be appended to the base URI of the YQL Web  
// service.  
var toQueryString = function ( obj ) {      
  var parts = [];      
  for( var each in obj ) if ( obj.hasOwnProperty( each ) ) {  
    parts.push( encodeURIComponent( each ) + '=' + encodeURIComponent( obj[ each ] ) );      
  }      
  return parts.join('&');    
};

var gainOrLoss = function( domObj, changeString ) {
	if ( changeString.charAt( 0 ) === '-' )
		domObj.className = 'loss'
	else if ( changeString.charAt( 0 ) === '+' ) 
		domObj.className = 'gain';
	else
		domObj.className = '';
};

var displayQuote = function( data ) {
	var quote = data.query.results.quote;
	$( '#ticker' ).html( quote.Symbol );
	$( '#stock-name' ).html( quote.Name );
	$( '#last-trade' ).html( quote.LastTradePriceOnly );
	$( '#price-change' ).html( quote.Change );
	gainOrLoss( document.getElementById( 'price-change' ), quote.Change );
	$( '#range .value' ).html( quote.DaysRange );
	$( '#year-range .value' ).html( quote.YearRange );
	$( '#daily-volume' ).html( quote.Volume );
	$( '#avg-volume' ).html( quote.AverageDailyVolume );
	$( '#market-cap .value' ).html( quote.MarketCapitalization );
	$( '#price-earnings .value' ).html( quote.PERatio );
	$( '#dividend-yield .value' ).html( quote.DividendYield );
	$( '#EPS .value' ).html( quote.EarningsShare );
	//$( '#num-shares .value' ).html( quote.DaysRange );
};

$( document ).ready( function() {
	
	$( '#search-form' ).submit( function( e ) {
		e.preventDefault();
		var ticker = $( '#search' ).val();
		var yqlQuery = 'SELECT * FROM yahoo.finance.quotes WHERE symbol="' + ticker + '"';
		var queryString = toQueryString( 
			{ 
				q: yqlQuery, 
				env: yqlEnv,
				format: 'json' 
			} 
		);
		$.getJSON( yqlBaseUri + '?' + queryString, displayQuote );
	})
})