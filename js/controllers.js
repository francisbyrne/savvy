var financeModule = angular.module('finance', []);

financeModule.controller('StockSearchCtrl',
  function($scope) {

    $scope.search = {
      'key': '',
      'ready': false
    };

    $scope.executeSearch = function() {
      loadFundamentals( $scope.search.key );
      $scope.search.ready = true;
    };

    // Query yql finance database and load stock fundamentals
    var loadFundamentals = function( ticker ) {
      var yqlQuery = 'SELECT * FROM yahoo.finance.quotes WHERE symbol="' + ticker + '"';
      var url = buildYqlUrl( yqlQuery );
      // TODO: get rid of jQuery; async json call is interfering with angular data binding
      $.getJSON( url, function(data) {
        $scope.stock = mapYqlQuoteToStock( data.query.results.quote );
      });
    };

    var mapYqlQuoteToStock = function( quote ) {
      return {
        ticker:           quote.Symbol,
        name:             quote.Name,
        lastTrade:        quote.LastTradePriceOnly, 
        priceChange:      quote.Change, 
        dayRange:         quote.DaysRange,
        yearRange:        quote.YearRange,
        volume:           quote.Volume,
        avgVolume:        quote.AverageDailyVolume,
        marketCap:        quote.MarketCapitalization,
        priceEarnings:    quote.PERatio,
        dividendYield:    quote.DividendYield,
        earningsPerShare: quote.EarningsShare
      };
    };

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
      var yqlBaseUri  = 'http://query.yahooapis.com/v1/public/yql',
          yqlEnv      = 'http://datatables.org/alltables.env',
          yqlFormat   = 'json';
      var queryString = toQueryString(
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

  }
);