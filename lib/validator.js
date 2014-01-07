'use strict';

const VALIDATORS = {
  required: {
    fn: function (value) {
      return value != null;
    },
    message: 'You must set a value for '
  },
  number: {
    fn: function (value) {
      return typeof value === 'number';
    },
    message: 'You must set a number for '
  },
  date: {
    fn: function (value) {
      return value.constructor.name === 'Date';
    },
    message: 'You must set a date for '
  },
  boolean: {
    fn: function (value) {
      return typeof value === 'boolean';
    },
    message: 'You must set a boolean for '
  },
  string: {
    fn: function (value) {
      return typeof value === 'string';
    },
    message: 'You must set a string for '
  }
};

const ERRORS = {
  descriptorValidator: 'Validators must be an array.'
};

function get(descriptor) {
  let rs = {
    required: null,
    validation: null
  }; 

  // add required validation
  if (descriptor.required) rs.required = VALIDATORS.required.fn;

  // add type validation
  if (descriptor.type) rs.validation = [(VALIDATORS[descriptor.type].fn)];

  // add custom validations
  if (descriptor.validators) {
    if (descriptor.validators.constructor.name !== 'Array') {
      throw new TypeError(ERRORS.descriptorValidator);
    }
    if (!rs.validation) rs.validation = [];
    descriptor.validators.forEach(function (ds) {
      rs.validation.push(ds.fn);
    });
  }

  if (!rs.required && !rs.validation) return null;

  return function (value) {
    let valid = true;

    if (rs.required && !rs.required(value)) return [!valid];

    if (value != null && rs.validation) {
      valid = rs.validation.map(function (fn) {
        return fn(value);
      }).every(function (isValid) {
        return isValid;
      });
    }
    return [valid];
  };
}

exports.methods = VALIDATORS;
exports.get = get;
