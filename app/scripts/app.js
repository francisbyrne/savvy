'use strict';

angular.module('financeApp', ['financeServices'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/:stockId', {
        templateUrl: 'views/stock.html',
        controller: 'StockCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
