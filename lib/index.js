'use strict';

const inflection = require('inflection');

inflection.camelizeLower = (str) => {
  return inflection.camelize(str, true);
};

function inflectObject(inflector, obj, blackList) {
  // clone the object and check for circular references
  // and reduce the set of value to json types
  obj = JSON.parse(JSON.stringify(obj));
  return _inflectObject(inflector, blackList, obj);
}

function _inflectObject(inflector, blackList, obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const inflect = _inflectObject.bind(null, inflector, blackList);

  if (Array.isArray(obj)) {
    return obj.map(inflect);
  }
  let newObj = Object.keys(obj).reduce((memo, prop) => {
    let blacked = blackList.find(config => config[prop]);
    if (blacked) {
      if (/^noinflect$/i.test(blacked[prop].props)) {
        memo[prop] = obj[prop];
      } else {
        memo[prop] = inflect(obj[prop]);
      }
    } else if (blackList.includes(prop)) {
      memo[prop] = inflect(obj[prop]);
    } else {
      memo[inflector(prop)] = inflect(obj[prop]);
    }
    return memo;
  }, {});
  return newObj;
}

function transform(obj, inflectorName, blackList) {
  blackList = blackList || [];
  if (Array.isArray(inflectorName)) {
    const transformInflector = str => inflection.transform(str, inflectorName, blackList);
    return inflectObject(transformInflector, obj, blackList);
  }
  return inflectObject(inflection[inflectorName], obj, blackList);
}

// The res.json() method takes 3 types of arguments
// res.json(obj) this is the current best practice
// res.json(statusCode, obj) this is an older form still accepted
// res.json(obj, statusCode) this is a crazier form still accepted
function wrappedJson(oldJson, inflectorName, blackList) {
  let args = Array.prototype.slice.call(arguments, 3);
  if (typeof args[0] === 'object') {
    args[0] = transform(args[0], inflectorName, blackList);
  } else if (typeof args[1] === 'object') {
    args[1] = transform(args[1], inflectorName, blackList);
  }
  return oldJson.apply(this, args);
}

let defaults = {
  request: 'underscore',
  response: 'camelizeLower',
  blackList: []
};

function middlewareFactory(opt) {
  opt = Object.assign({}, defaults, opt);
  return function (req, res, next) {
    if (req.body && typeof req.body === 'object') {
      req.uninflectedBody = req.body;
      req.body = transform(req.body, opt.request, opt.blackList);
    }
    res.json = wrappedJson.bind(res, res.json, opt.response, opt.blackList);
    next();
  };
}

// It's a great utility function to have
middlewareFactory.transform = transform;

// can pass either an options hash, an options delegate, or nothing
module.exports = middlewareFactory;