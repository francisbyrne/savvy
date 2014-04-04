Router.map(function() {
  this.route('home', {path: '/'});
  this.route('portfolio');
  this.route('stock_detail', {
    path: '/stock/:_id', 
    data: function () { return { symbol: this.params._id }; }
  });
});

Router.configure({
  layoutTemplate: 'body',
  notFoundTemplate: 'not_found',
  loadingTemplate: 'loading'
});