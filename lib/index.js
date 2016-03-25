'use strict';

const inflection = require('inflection');

inflection.camelizeLower = (str) => {
  return inflection.camelize(str, true);
};

function inflectObject(inflector, obj) {
  // clone the object and check for circular references
  // and reduce the set of value to json types
  obj = JSON.parse(JSON.stringify(obj));
  return _inflectObject(inflector, obj);
}

function _inflectObject(inflector, obj){
  if (obj === null || typeof obj !== 'object' ) {
    return obj;
  }
  const inflect = _inflectObject.bind(null, inflector);
  if (Array.isArray(obj)){
    return obj.map(inflect);
  }
  let newObj = {};
  Object.keys(obj).forEach(prop => {
    let newProp = inflector(prop);
    newObj[newProp] = inflect(obj[prop]);
  });
  return newObj;
}

function transform(obj, inflectorName){
  if (Array.isArray(inflectorName)){
    let transformInflector = str => {
      return inflection.transform(str, inflectorName);
    };
    return inflectObject(transformInflector, obj);
  } else {
    return inflectObject(inflection[inflectorName], obj);
  }
}

function wrapJson(opt, res) {
  let oldJson = res.json;
  res.json = function(){
    let args = Array.prototype.slice.apply(arguments);
    if (typeof args[0] === 'object') {
      args[0] = transform(args[0], opt.response);
    } else if (typeof args[1] === 'object') {
      args[1] = transform(args[1], opt.response);
    }
    return oldJson.apply(this, args);
  };
}

let defaults = {
  request: 'underscore',
  response: 'camelizeLower'
};

function middlewareFactory(opt) {
  opt = opt || {};
  opt = Object.assign({}, defaults, opt);

  return function (req, res, next) {
    if (req.body && typeof req.body === 'object'){
      req.uninflectedBody = req.body;
      req.body = transform(req.body, opt.request);
      wrapJson(opt, res);
    }
    next();
  };
}

// can pass either an options hash, an options delegate, or nothing
module.exports = middlewareFactory;
