'use strict';

exports.setProperties = setProperties;

function setProperties(model) {
  var properties = {
    values: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: (function () {
        var values = {};
        return function (name, value) {
          if (arguments.length === 1) return values[name];
          values[name] = value;
          // dummy reference to all values
          this._values = values;
        };
      })()
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
