'use strict';

angular.module('financeApp')
  .controller('StockCtrl', function ($scope, $location, $routeParams, Stock) {
    $scope.stock = $routeParams.stockId ? Stock.get({stockId: $routeParams.stockId}) : {};
    $scope.search = function() {
      $location.path('/' + this.query);
    };
  });