'use strict';

const levelco = require('level-co');
const memdown = require('memdown');
const model = require('../');

var attributes = {
  username: 'me',
  email: 'me@gmail.com',
  password: 'mepass'
};
const properties = Object.keys(attributes);
const User = model.createMolde('User', properties);

