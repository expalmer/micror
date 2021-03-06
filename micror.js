(function (root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    exports.micror = factory();
  } else {
    root.micror = factory();
  }
})(this, function() {
  'use strict';

  var _base = '';
  var _hash = false;

  function micror(path) {
    var route = {
      path: path,
      keys: []
    };
    route.regexp = regexp(path, route.keys);
    for (var i = 1; i < arguments.length; i += 1) {
      micror.callbacks.push(middleware(route, arguments[i]));
    }
  }

  micror.callbacks = [];

  micror.go = function(path, state, saveState) {
    var ctx = new Context(path, state);
    ctx[saveState ? 'saveState' : 'pushState']();
    var i = 0;
    function callNextCallback() {
      var cb = micror.callbacks[i++];
      if (!cb) {
        return console.log('route [', ctx.path, '] not found');
      }
      cb(ctx, callNextCallback);
    }
    callNextCallback();
  };

  micror.run = function(opts) {
    _base = opts && opts.base ? opts.base : '';
    _hash = opts && opts.hash ? '#!' : false;
    window.addEventListener('popstate', onPopState, false);
    document.addEventListener('click', onClickHandler, false);
    var url = location.pathname + location.search + location.hash;
    url = _base ? url.replace(_base, '') : '';
    if (_hash && location.hash.indexOf('#!') !== -1) {
      url = location.hash.substr(2) + location.search;
    }
    micror.go(url, undefined, true);
  };

  function Context(path, state) {
    path = _base + (_hash ? '/#!' : '') + path.replace(_base, '');
    path = path.length > 1 ? path.replace(/\/$/, '') : path;
    this.fullPath = path;
    path = _hash ? path.split('#!')[1] : (_base ? path.replace(_base, '') : path);
    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.params = {};
    var h = path.split('#');
    path = h[0];
    this.hash = h[1] || '';
    var q = path.split('?');
    path = q[0];
    this.querystring = q[1] || '';
    this.path = path || '/';
  }

  Context.prototype.pushState = function() {
    history.pushState(this.state, this.title, this.fullPath);
  };

  Context.prototype.saveState = function() {
    history.replaceState(this.state, this.title, this.fullPath);
  };

  function middleware(route, callback) {
    return function(ctx, next) {
      var match = route.regexp.exec(decodeURIComponent(ctx.path));
      if (match) {
        fillParams(match, route.keys, ctx.params);
        return callback(ctx, next);
      }
      next();
    };
  }

  function fillParams(match, keys, params) {
    keys.forEach(function(key, idx) {
      params[key.name] = match[idx + 1];
    });
  }

  function regexp(path, keys) {
    var regex = path.replace(/\/(:?)([^\/?]+)(\??)(?=\/|$)/g,
      function(match, isVariable, segment, isOptional) {
        if (isVariable) {
          keys.push({name: segment});
        }
        return isVariable ? isOptional ? '(?:\\/([^\\/]+))?' : '\\/([^\\/]+)' : '\\/' + segment;
      });
    regex = regex === '*' ? '(.*)' : (regex === '/' ? '' : regex);
    return new RegExp('^' + regex + '(?:\\/(?=$))?$', 'i');
  }

  function onClickHandler(e) {
    var element = e.target;
    while (typeof element !== 'undefined' && element.nodeName !== 'A') {
      element = element.parentNode;
    }
    if (!element || element.nodeName !== 'A') {
      return;
    }
    var path = element.pathname + element.search + (element.hash || '');
    e.preventDefault();
    micror.go(path);
  }

  function onPopState(e) {
    if (e.state) {
      var path = e.state.path;
      micror.go(path, e.state, true);
    } else {
      micror.go(location.pathname + location.hash);
    }
  }

  return micror;
});
