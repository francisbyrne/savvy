'use strict';

var financeApp = angular.module('financeServices', ['ngResource']).
  factory('Stock', function($resource){
    return $resource('stocks/:stockId.json');
  });