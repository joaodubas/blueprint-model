'use strict';

const protos = require('./proto.js');

exports.setProperties = set;

function set(model) {
  let properties = {
    setProperties: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: setProperties
    },
    setProperty: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: setProperty
    }
  };
  Object.defineProperties(model, properties);
}

function setProperties(properties) {
  protos.setProperties(this, properties);
  return this;
}

function setProperty(property) {
  protos.setProperty(this, property);
  return this;
}
