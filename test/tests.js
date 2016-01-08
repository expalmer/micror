var test = require('tape');
var micror = require('../micror');

test('normal route was called', function (t) {
  micror('/home', function() {
    t.pass('home called');
  });
  micror('/about', function() {
    t.pass('about called');
  });
  micror.go('/home');
  micror.go('/about');
  t.plan(2);
  t.end();
});

test('route with params was called', function (t) {
  micror('/post/:id', function() {
    t.pass('post :id called');
  });

  micror('/contact/:name/:email', function() {
    t.pass('contacts :name and :email called');
  });
  micror.go('/post/123');
  micror.go('/contact/palmer/expalmer@gmail.com');
  t.plan(2);
  t.end();
});

test('optional params with value was called', function (t) {
  micror('/posts/:page/:order?', function() {
    t.pass('posts :page and :order optional called');
  });
  micror.go('/posts/1/asc');
  t.plan(1);
  t.end();
});

test('optional params without value was called', function (t) {
  micror('/articles/:page/:order?', function() {
    t.pass('articles :page and :order optional called');
  });
  micror.go('/articles/1');
  t.plan(1);
  t.end();
});

test('get params', function (t) {
  micror('/params/:one/:two/:three', function(ctx) {
    t.equal(ctx.params.one, '10', 'value 10');
    t.equal(ctx.params.two, 'asc', 'value asc');
    t.equal(ctx.params.three, 'another', 'value another');
  });
  micror.go('/params/10/asc/another');
  t.end();
});

test('get params, querystring and hash', function (t) {
  micror('/vehicles/:one/:two/:three', function(ctx) {
    t.equal(ctx.params.one, '10', 'value 10');
    t.equal(ctx.params.two, 'asc', 'value asc');
    t.equal(ctx.params.three, 'another', 'value another');
    t.equal(ctx.querystring, 'page=10', 'QueryString Ok');
    t.equal(ctx.hash, 'less', 'Hash Ok');
  });
  micror.go('/vehicles/10/asc/another?page=10#less');
  t.end();
});

test('base url', function (t) {
  var base = '/adm';
  micror('/login', function(ctx) {
    t.equal(ctx.fullPath, '/adm/login');
  });
  micror.run({base: base});
  micror.go('/login');
  t.end();
});

test('hashbang', function (t) {
  var url = '/#!/hashbang';
  micror('/hashbang', function(ctx) {
    t.equal(ctx.fullPath, url);
  });
  micror.run({base: '', hash: true});
  micror.go('/hashbang');
  t.end();
});
