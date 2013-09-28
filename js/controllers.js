'use strict';

angular.module('finance.controllers', []).
  controller('StockSearchCtrl', [function($scope) {

    $scope.search = {
      'key': '',
      'ready': false
    };

    $scope.executeSearch = function() {
    
    };

  }]).
  controller('FundamentalsCtrl', [function($scope, $http) {

    //$scope.$watch($scope.search.key, loadFundamentals);
    $scope.$watch($scope.search.key, alertMe);

    function alertMe(key) {
      console.log(key);
    };
  }]);