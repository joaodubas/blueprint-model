'use strict';
const validators = require('./validator.js');

exports.setProperties = setProperties;
exports.setProperty = setProperty;

function setProperties(model, properties) {
  properties.forEach(function (key) {
    setProperty(model, key);
  });
}

function setProperty(model, key) {
  let validate = null;
  let name = key;
  let properties = {
    enumerable: true,
    configurable: false,
    get: get,
    set: set
  };

  if (typeof key !== 'string') {
    name = key.name;
    validate = validators.get(key);
  }

  function get() {
    /* jshint validthis: true */
    return this.values(name);
  }

  function set(value) {
    /* jshint validthis: true */
    if (validate) {
      let valid = validate(value);
      if (!valid[0]) throw new TypeError();
    }
    this.values(name, value);
  }

  Object.defineProperty(model.prototype, name, properties);
}
