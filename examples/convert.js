'use strict';
/* jshint esnext: true */

/**
 * Dependencies
 */
const model = require('../');

/**
 * Plugin
 */
function wrapper(Model) {
  let attrs = Object.keys(Model);
  let staticAttrs = {
    attrs: {
      enumerable: false,
      configurable: false,
      writable: true,
      value: attrs 
    },
    fromJSON: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: fromJSON
    }
  };
  let protoAttrs = {
    toJSON: {
      enumerable: true,
      configurable: false,
      writable: false,
      value: toJSON
    }
  };

  Object.defineProperties(Model, staticAttrs);
  Object.defineProperties(Model.prototype, protoAttrs);
}

function toJSON() {
  /* jshint validthis: true */
  let json = {};
  this.model.attrs.forEach(function (v) {
    json[v] = this[v];
  }, this);
  this.emit('converted', json);
  this.model.emit('converted', json);
  return json;
}

function fromJSON(json) {
  /* jshint validthis: true */
  let instance = new this();
  this.attrs.forEach(function (v) {
    if (!(v in json)) return;
    instance[v] = json[v];
  });
  this.emit('created', instance, json);
  return instance;
}

/**
 * Usage
 */
const User = model.createModel('User', ['name', 'email', 'password']);
User.use(wrapper);

var user = new User({name: 'me', email: 'me', password: 'me'});
var otherUser = User.fromJSON({name: 'me', email: 'me', password: 'me'});
console.log(user.toJSON());
console.log(otherUser.toJSON());
