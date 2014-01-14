'use strict';

var events = require('events');
var utils = require('util');
var base = require('./base.js');
var protos = require('./proto.js');
var statics = require('./static.js');
var validators = require('./validator.js');

exports.createModel = createModel;

function createModel (name, properties) {
  if (typeof name !== 'string') throw new TypeError('Model name required');

  function Model(attrs) {
    if (!(this instanceof Model)) {
      return new Model(attrs);
    }

    events.EventEmitter.call(this);

    if (attrs) {
      var self = this;
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
