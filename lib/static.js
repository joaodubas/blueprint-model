'use strict';

const events = require('events');
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
    },
    use: {
      enumerable: true,
      writable: false,
      configurable: false,
      value: use
    }
  };

  Object.defineProperties(model, properties);

  events.EventEmitter.call(model);
  Object.keys(events.EventEmitter.prototype).forEach(function (key) {
    model[key] = events.EventEmitter.prototype[key];
  });
}

function setProperties(properties) {
  /* jshint validthis: true */
  protos.setProperties(this, properties);
  return this;
}

function setProperty(property) {
  /* jshint validthis: true */
  protos.setProperty(this, property);
  return this;
}

function use(fn) {
  /* jshint validthis: true */
  protos.use(this, fn);
  return this;
}
