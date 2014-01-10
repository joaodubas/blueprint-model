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
    }
  };

  events.EventEmitter.call(model);
  Object.keys(events.EventEmitter.prototype).forEach(function (key) {
    properties[key] = {
      enumerable: true,
      configurable: false,
      writable: false,
      value: events.EventEmitter.prototype[key]
    };
  });

  Object.defineProperties(model, properties);
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
