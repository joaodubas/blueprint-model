'use strict';

const levelco = require('level-co');
const memdown = require('memdown');
const model = require('../');
const db = levelco.deferred(
  'db',
  {
    db: function (l) {
      return new (memdown)(l);
    }
  }
);

var attributes = {
  username: 'me',
  email: 'me@gmail.com',
  password: 'mepass'
};
const properties = Object.keys(attributes);
const User = model.createModel('User', properties);
const access = {
  get: function *() { yield null; },
  put: function *() { yield null; },
  del: function *() { yield null; }
};
