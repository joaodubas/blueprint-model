'use strict';

exports.setProperties = setProperties;

function setProperties(model) {
  var properties = {
    _values: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: null
    },
    values: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function (name, value) {
        if (!this._values) this._values = [];
        if (arguments.length === 1) return this._values[name];
        this._values[name] = value;
      }
    },
    model: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: model
    }
  };
  Object.defineProperties(model.prototype, properties);
}
