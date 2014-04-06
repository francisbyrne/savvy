Template.stock_detail.helpers({
  stock: function() {
    return Stocks.findOne({id: this.stockId});
  }
})

