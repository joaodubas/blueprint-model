'use strict';

/**
 * Dependencies
 */
const co = require('co');
const levelco = require('level-co');
const memdown = require('memdown');
const model = require('../');

/**
 * Database
 */
const db = levelco.deferred(
  'db',
  {db: memdown}
);

/**
 * Extend model
 */
function uses(Model, fns) {
  Object.keys(fns).forEach(function (key) {
    use(Model, key, fns[key]);
  });
}

function use(Model, name, fn) {
  let descriptor = {
    enumerable: true,
    configurable: false,
    writable: false,
    value: fn
  };
  Object.defineProperty(Model, name, descriptor);
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

const access = {
  _key: function (key) {
    if (/^post~/) key = 'post~' + key;
    return key;
  },
  get: function *(key) {
    let datum;
    try {
      datum = yield db.get(this._key(key));
    } catch (e) {
      throw new Error(this.modelName + ' ' + key + ' not found');
    }
    let instance = new this(JSON.parse(datum));
    return instance;
  },
  put: function *(value) {
    let instance;
    let datum;

    try {
      instance = new this(value);
    } catch (e) {
      throw new Error('Validation error');
    }

    let key = this._key(value.name);
    try {
      yield db.put(key, JSON.stringify(value));
    } catch (e) {
      throw new Error('Could not save the instance.');
    }

    return instance;
  },
  del: function *(key) {
    yield db.del(this._key(key));
  }
};
uses(User, access);

/**
 * Usage
 */
co(function *() {
  var instance = yield User.put({
    username: 'me',
    email: 'me@me.com',
    password: 'me'
  });
  console.log(instance);
})();

co(function *() {
  var instance = yield User.get('me');
  console.log(instance);
})();

co(function *() {
  yield User.del('me');
  console.log('removed');
});

exports.User = User;
exports.db = db;
