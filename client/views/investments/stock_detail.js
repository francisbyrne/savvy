Template.stock_detail.helpers({
  stock: function() {
    return Stocks.findOne({symbol: this.stockId});
  }
})

