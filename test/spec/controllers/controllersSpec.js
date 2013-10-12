'use strict';

describe('Controller: StockCtrl', function () {

  // load the controller's module
  beforeEach(module('financeApp'));

  var StockCtrl,
    scope;

  // Initialize the controller and a mock stock
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StockCtrl = $controller('StockCtrl', {$scope: scope});
  }));

  it('should have a scope', function() {
    expect(scope).toBeTruthy();
  });

  it('should change location on search', function() {
    inject(function($route, $location) {
      scope.query = 'myStock';
      scope.search();
      expect($location.path()).toBe('/myStock');
    });
  });

  it('should get a stock from xhr and attach it to scope', function () {
    var mockStock = {
                      "ticker": "goog",
                      "name": "Google",
                      "lastTrade": 540.99,
                      "priceRange": "+1.50"
                    };

    inject(function(_$httpBackend_) {
      var $httpBackend = _$httpBackend_;
      expect(scope.stock).toEqual({});

      $httpBackend.when('/goog')
          .respond(mockStock);

      scope.query = 'goog';
      scope.search();

      expect(scope.stock).toEqual(mockStock);
    });
  });
});
