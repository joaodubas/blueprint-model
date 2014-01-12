'use strict';

/**
 * Dependencies
 */
const co = require('co');
const levelco = require('level-co');
const memdown = require('memdown');
const model = require('../');

/**
 * Plugin
 */
function wrapper(opts) {
  opts = opts || {};
  opts.level = opts.level || ['db', {db: memdown}];

  if (!opts.keyAlias) throw new TypeError('Provide a default keyAlias.');

  const db = levelco.deferred.apply(levelco, opts.level);

  let protoProperties = {
    _keyAlias: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: opts.keyAlias
    },
    _key: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: null
    },
    _makeKey: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function () {
        if (!this._key)
          this._key = this.model._getKey(this[this._keyAlias]);
        return this;
      }
    },
    _getKey: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function () {
        return this._makeKey()._key;
      }
    },
    save: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: function *() {
        yield this.model.db.put(this._getKey(), this._values);
      }
    }
  };

  let staticProperties = {
    _getKey: {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function (key) {
        if (/^posts~/.test(key))
          key = 'posts~' + key;
        return key;
      }
    },
    db: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: db
    },
    get: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: function *(key) {
        let datum;
        try {
          datum = yield this.db.get(this._getKey(key));
        } catch (e) {
          throw new Error(this.modelName + ' ' + key + ' not found');
        }
        let instance = new this(JSON.parse(datum));
        instance._key = this._getKey(key);
        return instance;
      }
    },
    put: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: function *(value) {
        let instance;
        let datum;

        try {
          instance = new this(value);
        } catch (e) {
          throw new Error('Validation error');
        }

        let key = instance._getKey();
        try {
          yield this.db.put(key, JSON.stringify(instance._values));
        } catch (e) {
          throw new Error('Could not save the instance.');
        }

        return instance;
      }
    },
    del: {
      enuerable: true,
      configurable: false,
      writable: false,
      value: function *(key) {
        yield this.db.del(this._getKey(key));
      }
    }
  };

  return function (Model) {
    Object.defineProperties(Model, staticProperties);
    Object.defineProperties(Model.prototype, protoProperties);
  };
}

/**
 * Model
 */
const attributes = {
  username: 'me',
  email: 'me@gmail.com',
  password: 'mepass'
};
const properties = ['username', 'email', 'password'];
const User = model.createModel('User', properties);
User.use(wrapper({keyAlias: 'username'}));

/**
 * Usage
 */
co(function *() {
  var instance = yield User.put({
    username: 'me',
    email: 'me@me.com',
    password: 'me'
  });
  console.log('create', JSON.stringify(instance._values));
})();

co(function *() {
  var instance = yield User.get('me');
  console.log('get', JSON.stringify(instance._values));
})();

co(function *() {
  yield User.del('me');
  console.log('removed');
})();

exports.User = User;
