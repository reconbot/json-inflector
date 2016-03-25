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
  let newObj = Object.keys(obj).reduce((memo, prop) => {
    memo[inflector(prop)] = inflect(obj[prop]);
    return memo;
  }, {});
  return newObj;
}

function transform(obj, inflectorName){
  if (Array.isArray(inflectorName)){
    const transformInflector = str => inflection.transform(str, inflectorName);
    return inflectObject(transformInflector, obj);
  }
  return inflectObject(inflection[inflectorName], obj);
}

// The res.json() method takes 3 types of arguments
// res.json(obj) this is the current best practice
// res.json(statusCode, obj) this is an older form still accepted
// res.json(obj, statusCode) this is a crazier form still accepted
function wrappedJson(oldJson, inflectorName){
  let args = Array.prototype.slice.call(arguments, 2);
  if (typeof args[0] === 'object') {
    args[0] = transform(args[0], inflectorName);
  } else if (typeof args[1] === 'object') {
    args[1] = transform(args[1], inflectorName);
  }
  return oldJson.apply(this, args);
}

let defaults = {
  request: 'underscore',
  response: 'camelizeLower'
};

function middlewareFactory(opt) {
  opt = Object.assign({}, defaults, opt);
  return function (req, res, next) {
    if (req.body && typeof req.body === 'object'){
      req.uninflectedBody = req.body;
      req.body = transform(req.body, opt.request);
    }
    res.json = wrappedJson.bind(res, res.json, opt.response);
    next();
  };
}

// can pass either an options hash, an options delegate, or nothing
module.exports = middlewareFactory;
