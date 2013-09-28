


    // Query yql finance database and load stock fundamentals
    var loadFundamentals = function( key ) {
     // $scope.search.ready = false;
      var yqlQuery = 'SELECT * FROM yahoo.finance.quotes WHERE symbol="' + key + '"';
      var url = buildYqlUrl( yqlQuery );
      // TODO: get rid of jQuery; async json call is interfering with angular data binding
      $http.get(url).success( function(data) {
        $scope.stock = mapYqlQuoteToStock( data.query.results.quote );
        $scope.search.ready = true;
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