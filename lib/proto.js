'use strict';
var validators = require('./validator.js');

exports.setProperties = setProperties;
exports.setProperty = setProperty;
exports.use = use;

function setProperties(model, properties) {
  if (properties.constructor.name !== 'Array') {
    throw new TypeError('Provide a list o properties.');
  }
  properties.forEach(function (key) {
    setProperty(model, key);
  });
}

function setProperty(model, key) {
  var validate = null;
  var name = key;
  var properties = {
    enumerable: true,
    configurable: false,
    get: get,
    set: set
  };

  if (typeof key !== 'string') {
    if (!key.hasOwnProperty('name')) {
      throw new TypeError('Descriptor property should have a `name` key.');
    }
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
      var valid = validate(value);
      if (!valid[0]) throw new TypeError();
    }
    this.values(name, value);

    var events = [
      ['change', this, name, value],
      ['change ' + name, this, value]
    ];
    var self = this;
    events.forEach(function (args) {
      self.model.emit.apply(self.model, args);
      self.emit.apply(self, args);
    });
  }

  Object.defineProperty(model.prototype, name, properties);
}

function use(model, fn) {
  fn(model);
}
