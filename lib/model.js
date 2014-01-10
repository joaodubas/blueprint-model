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

    if (properties && attrs) {
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
