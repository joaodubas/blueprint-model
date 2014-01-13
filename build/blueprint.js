/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("blueprint-model/./lib/model.js", function(exports, require, module){
'use strict';

const events = require('events');
const utils = require('util');
const base = require('./base.js');
const protos = require('./proto.js');
const statics = require('./static.js');
const validators = require('./validator.js');

exports.createModel = createModel;

function createModel (name, properties) {
  if (typeof name !== 'string') throw new TypeError('Model name required');

  function Model(attrs) {
    if (!(this instanceof Model)) {
      return new Model(attrs);
    }

    events.EventEmitter.call(this);

    if (attrs) {
      let self = this;
      Object.keys(attrs).forEach(function (key) {
        self[key] = attrs[key];
      });
      self.model.emit('construct', this, attrs);
    }
  }
  inherits(Model, name, properties);

  return Model;
}

function inherits(Model, name, properties) {
  Model.modelName = name;
  utils.inherits(Model, events.EventEmitter);
  base.setProperties(Model);
  statics.setProperties(Model);
  if (properties) protos.setProperties(Model, properties);
}

});
require.register("blueprint-model/./lib/base.js", function(exports, require, module){
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
        if (!this._values) this._values = {};
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

});
require.register("blueprint-model/./lib/static.js", function(exports, require, module){
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

});
require.register("blueprint-model/./lib/proto.js", function(exports, require, module){
const validators = require('./validator.js');

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
  let validate = null;
  let name = key;
  let properties = {
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
      let valid = validate(value);
      if (!valid[0]) throw new TypeError();
    }
    this.values(name, value);

    let events = [
      ['change', this, name, value],
      ['change ' + name, this, value]
    ];
    let self = this;
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

});
require.register("blueprint-model/./lib/validator.js", function(exports, require, module){
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

});
require.alias("blueprint-model/lib/model.js", "blueprint-model/index.js");
