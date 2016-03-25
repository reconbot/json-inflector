'use strict';

var humps = require('humps');

function camelizeKeys(object){
  return humps.camelizeKeys(object);
}

function decamelizeKeys(object){
  return humps.decamelizeKeys(object);
}

function wrapJson(res) {
  var oldJson = res.json;
  res.json = function(){
    var args = Array.prototype.slice.apply(arguments);
    if (typeof args[0] === 'object') {
      args[0] = camelizeKeys(args[0]);
    } else if (typeof args[1] === 'object') {
      args[1] = camelizeKeys(args[1]);
    }
    oldJson.apply(this, args);
  };
}

function middlewareFactory(opt) {
  opt = opt || {};

  return function (req, res, next) {
    if (req.body && typeof req.body === 'object'){
      req.uninflectedBody = req.body;
      req.body = decamelizeKeys(req.body);
      wrapJson(res);
    }
    next();
  };
}

// can pass either an options hash, an options delegate, or nothing
module.exports = middlewareFactory;
